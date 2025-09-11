import React, { useState } from "react";
import Papa from "papaparse";
import { createClient } from "@supabase/supabase-js";
import initSqlJs from "sql.js";

export default function UploadCSV() {
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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
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
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">CSV / SQLite to Supabase</h2>

      {/* file input + dropdown side-by-side */}
      <div className="flex items-center gap-4">
        <input type="file" accept=".csv,.sqlite,.db" onChange={handleFileUpload} />
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
  );
}
