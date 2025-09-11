import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import Papa from "papaparse";
import { createClient } from "@supabase/supabase-js";
import initSqlJs from "sql.js";

const FileUploader = () => {
    const [files, setFiles] = useState([]);
    
    //table
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState("");
    const [createSQL, setCreateSQL] = useState("");
    const [columns, setColumns] = useState([]);
    const [show, setShow] = useState("");
    const [dbInstance, setDbInstance] = useState(null);
    const [tableSQLMap, setTableSQLMap] = useState({});
    const [selectedTableRows, setSelectedTableRows] = useState([]);

    const supabaseUrl = "https://mmoeoxkgnfomdwzzbsix.supabase.co";
    const supabaseKey = "YOUR_KEY_HERE"; // keep as you had it
    const supabase = createClient(supabaseUrl, supabaseKey);

    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFiles = Array.from(event.dataTransfer.files);
        const model = localStorage.getItem("modelName");
        const apiKey = localStorage.getItem("apiKey");

        if (!model || !apiKey) {
            return toast.error("Please enter both Model and API Key.");
        }

        setFiles((prev) => [...prev, ...droppedFiles]);
        toast.success("File(s) added successfully");
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleFileSelect = (event) => {
        const selectedFiles = Array.from(event.target.files);
        const model = localStorage.getItem("modelName");
        const apiKey = localStorage.getItem("apiKey");
        if (!model || !apiKey) {
            return toast.error("Please enter both Model and API Key.");
        }

        setFiles((prev) => [...prev, ...selectedFiles]);
        toast.success("File(s) added successfully");
    };

    const handleRemoveFile = (file) => {
        setFiles((prevFiles) => prevFiles.filter((prevfile) => prevfile.name !== file.name));
        toast.success(`${file.name} removed successfully`);
    };

    const handleUpload = async () => {
        const model = localStorage.getItem("modelName");
        const apiKey = localStorage.getItem("apiKey");

        if (!model || !apiKey) {
            return toast.error("Missing Model or API Key.");
        }

        if (files.length === 0) {
            return toast.error("No files to upload.");
        }

        const formData = new FormData();
        files.forEach(file => {
            formData.append("files", file);
        });
        formData.append("model", model);
        formData.append("apiKey", apiKey);

        try {
            const response = await axios.post("http://localhost:5000/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            console.log("Upload success:", response.data);
            console.log("Upload test:", response.data.
                uploaded[0].id
            );
            toast.success("Files uploaded successfully");
            setFiles([]);
        } catch (error) {
            console.error("Upload error:", error.response?.data || error.message);
            toast.error("Upload failed");
        }
    };

    const handleFileUpload = async () => {
        console.log(files)
        const file = files?.[0];
        if (!file) return;

        // reset UI
        setCreateSQL("");
        setColumns([]);
        setSelectedTable("");
        setTables([]);
        setTableSQLMap({});
        setSelectedTableRows([]);
        setData([]);
        setShow("");
        setDbInstance(null);

        if (file.name.endsWith(".csv")) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: async function (results) {
                    await createTableAndInsert(results.data);
                },
            });
            return;
        }

        if (file.name.endsWith(".sqlite") || file.name.endsWith(".db")) {
            setLoading(true);
            const SQL = await initSqlJs({
                locateFile: (file) => `https://sql.js.org/dist/${file}`,
            });

            const arrayBuffer = await file.arrayBuffer();
            const db = new SQL.Database(new Uint8Array(arrayBuffer));
            setDbInstance(db);

            // get tables + their CREATE SQL
            const tableResult = db.exec(
                "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
            );

            if (!tableResult || tableResult.length === 0) {
                alert("No tables found in SQLite file");
                setLoading(false);
                return;
            }

            const foundTables = tableResult[0].values.map((r) => r[0]);
            const sqlMap = {};
            tableResult[0].values.forEach((r) => {
                sqlMap[r[0]] = r[1];
            });

            setTables(foundTables);
            setTableSQLMap(sqlMap);

            // auto-select first table (calls handleSelectTable)
            await handleSelectTable(foundTables[0], db, sqlMap);

            setShow("sqlite");
            setLoading(false);

            // ----- optional: insert each table rows into Supabase (keeps your previous behavior) -----
            for (const tableName of foundTables) {
                try {
                    const tableData = db.exec(`SELECT * FROM "${tableName}";`);
                    if (!tableData || tableData.length === 0) continue;

                    const cols = tableData[0].columns;
                    const values = tableData[0].values;
                    const rows = values.map((row) =>
                        Object.fromEntries(cols.map((c, i) => [c, row[i]]))
                    );

                    await createTableAndInsertSqlite(tableName, cols, rows);
                } catch (err) {
                    console.error("Error reading table for supabase insert:", tableName, err);
                }
            }
        }
    };

    // when user selects a table from dropdown (or auto-select)
    const handleSelectTable = async (tableName, db = dbInstance, sqlMap = tableSQLMap) => {
        if (!tableName) return;
        // ensure db is available
        if (!db) {
            console.warn("DB instance not available yet");
            return;
        }

        setSelectedTable(tableName);
        setCreateSQL(sqlMap?.[tableName] ?? "");

        // get schema
        const pragma = db.exec(`PRAGMA table_info("${tableName}");`);
        if (pragma && pragma.length > 0) {
            const rows = pragma[0].values.map((c) => ({
                name: c[1],
                type: c[2],
                notNull: c[3] === 1 ? "Yes" : "No",
                default: c[4] ?? "NULL",
                primaryKey: c[5] === 1 ? "Yes" : "No",
            }));
            setColumns(rows);
        } else {
            setColumns([]);
        }

        // get first N rows to display
        try {
            const tableData = db.exec(`SELECT * FROM "${tableName}" LIMIT 1000;`);
            if (tableData && tableData.length > 0) {
                const cols = tableData[0].columns;
                const values = tableData[0].values;
                const rows = values.map((row) =>
                    Object.fromEntries(cols.map((c, i) => [c, row[i]]))
                );
                setSelectedTableRows(rows);
            } else {
                setSelectedTableRows([]);
            }
        } catch (err) {
            console.error("Error reading rows for table", tableName, err);
            setSelectedTableRows([]);
        }

        // ensure UI shows sqlite schema/rows
        setShow("sqlite");
    };

    const createTableAndInsert = async (rows) => {
        if (!rows || rows.length === 0) return alert("CSV is empty!");

        setLoading(true);
        const tableName = "poc_table";
        const columnsDef = Object.keys(rows[0])
            .map((col) => `"${col}" TEXT`)
            .join(", ");

        const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (id serial primary key, ${columnsDef});`;

        setCreateSQL(createTableSQL);

        const colMeta = Object.keys(rows[0]).map((h) => ({
            name: h,
            type: "TEXT",
            notNull: "No",
            default: "NULL",
            primaryKey: "No",
        }));
        setColumns(colMeta);

        const { error: createError } = await supabase.rpc("exec_sql", { sql: createTableSQL });
        if (createError) {
            console.error("Create table error:", createError);
            setLoading(false);
            return;
        }

        const { error: insertError } = await supabase.from(tableName).insert(rows);
        if (insertError) console.error("Insert error:", insertError);

        const { data: fetched } = await supabase.from(tableName).select("*");
        setData(fetched || []);
        setLoading(false);
        setShow("csv");
    };

    const createTableAndInsertSqlite = async (tableName, columns, rows) => {
        const safeTable = tableName.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
        const columnDefs = columns.map((c) => `"${c}" TEXT`).join(", ");
        const createSQL = `CREATE TABLE IF NOT EXISTS ${safeTable} (id serial primary key, ${columnDefs});`;

        const { error: createError } = await supabase.rpc("exec_sql", { sql: createSQL });
        if (createError) {
            console.error("Table creation error:", createError);
            return;
        }

        const { error: insertError } = await supabase.from(safeTable).insert(rows);
        if (insertError) console.error(`Insert error for ${safeTable}:`, insertError);
    };
    return (
        <div style={{ padding: "20px" }}>
            <h1 className="text-2xl p-2">
                Upload CSV <span className="text-red-500">(.csv)</span> or SQLite database{" "}
                <span className="text-red-500">(.sqlite, .db)</span>
            </h1>

            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="p-[4px] rounded-xl bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 
             hover:from-pink-500 hover:via-purple-500 hover:to-blue-400 transition-all duration-700"
            >
                <div className="p-10 text-center rounded-xl bg-gray-100 text-black cursor-pointer">
                    <p className="mb-3">Drag & Drop files here or click to upload</p>

                    <input
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        id="fileUpload"
                    />
                    <label
                        htmlFor="fileUpload"
                        className="cursor-pointer text-blue-600 font-medium hover:underline"
                    >
                        Browse Files
                    </label>
                </div>
            </div>

            {files.length > 0 && (
                <div className="mt-4">
                    <ul>
                        {files.map((file, index) => (
                            <li key={index} style={{ marginBottom: "8px" }}>
                                <span className="text-green-700">{file.name} ({Math.round(file.size / 1024)} KB)</span>
                                <button
                                    onClick={() => handleRemoveFile(file)}
                                    style={{
                                        marginLeft: "10px",
                                        padding: "2px 6px",
                                        border: "none",
                                        backgroundColor: "red",
                                        color: "white",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => { 
                            handleUpload();
                            handleFileUpload();
                        }}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Upload to Server
                    </button>
                </div>
            )}

            <div className="p-4">
                {/* file input + dropdown side-by-side */}
                <div className="flex items-center gap-4">
                    {tables.length > 0 && (
                        <select
                            value={selectedTable}
                            onChange={(e) => handleSelectTable(e.target.value)}
                            className="border px-2 py-1"
                        >
                            {tables.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {loading && <p className="mt-2">Processing...</p>}

                {/* CREATE TABLE SQL */}
                {createSQL && (
                    <div className="mt-4">
                        <h3 className="font-semibold">CREATE TABLE SQL:</h3>
                        <pre className="bg-black text-white p-2 rounded whitespace-pre-wrap">{createSQL}</pre>
                    </div>
                )}

                {/* Columns & Types */}
                {columns && columns.length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-semibold">Columns & Types</h3>
                        <table className="table-auto border w-full mt-2">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="border px-2">Name</th>
                                    <th className="border px-2">Type</th>
                                    <th className="border px-2">Not Null</th>
                                    <th className="border px-2">Default</th>
                                    <th className="border px-2">Primary Key</th>
                                </tr>
                            </thead>
                            <tbody>
                                {columns.map((col, i) => (
                                    <tr key={i}>
                                        <td className="border px-2">{col.name}</td>
                                        <td className="border px-2">{col.type}</td>
                                        <td className="border px-2">{col.notNull}</td>
                                        <td className="border px-2">{col.default}</td>
                                        <td className="border px-2">{col.primaryKey}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* CSV rows rendering */}
                {/* {show === "csv" && data && data.length > 0 && (
        <table className="table-auto border mt-4">
          <thead>
            <tr>
              {Object.keys(data[0]).map((col) => (
                <th key={col} className="border px-2">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((val, j) => (
                  <td key={j} className="border px-2">
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )} */}

                {/* SQLite selected table rows rendering */}
                {/* {show === "sqlite" && selectedTableRows && selectedTableRows.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Rows - {selectedTable}</h3>
          <table className="table-auto border w-full mt-2">
            <thead>
              <tr>
                {Object.keys(selectedTableRows[0]).map((col) => (
                  <th key={col} className="border px-2">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedTableRows.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="border px-2">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )} */}
            </div>
        </div>
    );
};

export default FileUploader;
