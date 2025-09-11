import React, { useState } from "react";
import Papa from "papaparse";
import { createClient } from "@supabase/supabase-js";
import initSqlJs from "sql.js";

export default function UploadCSV() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tables, setTables] = useState([]);
    const [show,setShow]=useState('')
    const supabaseUrl = "https://mmoeoxkgnfomdwzzbsix.supabase.co";
    const supabaseKey =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tb2VveGtnbmZvbWR3enpic2l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNzAxNjYsImV4cCI6MjA2Nzc0NjE2Nn0.7ZC-oZXDio0tmiwIlxFT_XO__D3hZPv6LG12EvW9Doc";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (file.name.endsWith(".csv")) {
            const file = e.target.files[0];
            if (!file) return;

            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: async function (results) {
                    console.log("CSV Parsed:", results.data);
                    await createTableAndInsert(results.data);
                },
            });

        } else if (file.name.endsWith(".sqlite") || file.name.endsWith(".db")) {
            setData([])
            const file = e.target.files[0];
            if (!file) return;

            setLoading(true);

            const SQL = await initSqlJs({
                locateFile: (file) => `https://sql.js.org/dist/${file}`,
            });

            const arrayBuffer = await file.arrayBuffer();
            const db = new SQL.Database(new Uint8Array(arrayBuffer));

            // Get all table names
            const tableResult = db.exec(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
            );

            if (tableResult.length === 0) {
                alert("No tables found in SQLite file");
                setLoading(false);
                return;
            }

            const foundTables = tableResult[0].values.map((row) => row[0]);
            setTables(foundTables);

            for (const tableName of foundTables) {
                const tableData = db.exec(`SELECT * FROM ${tableName}`);
                if (tableData.length === 0) continue;

                const columns = tableData[0].columns;
                const values = tableData[0].values;

                const rows = values.map((row) =>
                    Object.fromEntries(columns.map((col, idx) => [col, row[idx]]))
                );

                await createTableAndInsertSqlite(tableName, columns, rows);
            }

            setLoading(false);
        };
    };

    const createTableAndInsert = async (rows) => {
        if (rows.length === 0) return alert("CSV is empty!");

        setLoading(true);
        const tableName = "poc_table"; // you can make this dynamic

        // Infer columns (all text for simplicity)
        const columns = Object.keys(rows[0])
            .map((col) => `"${col}" text`)
            .join(", ");

        const createTableSQL = `create table if not exists ${tableName} (id serial primary key, ${columns});`;

        // Execute raw SQL
        const { error: createError } = await supabase.rpc("exec_sql", { sql: createTableSQL });
        if (createError) {
            console.error("Create table error:", createError);
            setLoading(false);
            return;
        }

        // Insert rows
        const { data: inserted, error: insertError } = await supabase
            .from(tableName)
            .insert(rows);

        if (insertError) console.error("Insert error:", insertError);

        // Fetch back data
        const { data: fetched } = await supabase.from(tableName).select("*");
        setData(fetched);
        setLoading(false);
        setShow('csv')
    };

    const createTableAndInsertSqlite = async (tableName, columns, rows) => {
        // Make sure table name is safe
        const safeTable = tableName.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();

        const columnDefs = columns.map((c) => `"${c}" text`).join(", ");
        const createSQL = `create table if not exists ${safeTable} (id serial primary key, ${columnDefs});`;

        const { error: createError } = await supabase.rpc("exec_sql", { sql: createSQL });
        if (createError) {
            console.error("Table creation error:", createError);
            return;
        }

        const { error: insertError } = await supabase
            .from(safeTable)
            .insert(rows);

        if (insertError) console.error(`Insert error for ${safeTable}:`, insertError);
        setShow('sqlite')
    };
    return (
        <div className="p-4">
            <h2 className="text-xl font-bold">CSV to Supabase </h2>
            <input type="file" accept=".csv,.sqlite,.db" onChange={handleFileUpload} />
            {loading && <p>Processing...</p>}

            {show === 'csv' && (
                <table className="table-auto border mt-4">
                    <thead>
                        <tr>
                            {Object.keys(data[0]).map((col) => (
                                <th key={col} className="border px-2">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i}>
                                {Object.values(row).map((val, j) => (
                                    <td key={j} className="border px-2">{val}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {show === 'sqlite' && <div className="p-4">
                {tables.length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-semibold">Tables Found:</h3>
                        <ul className="list-disc pl-6">
                            {tables.map((t) => (
                                <li key={t}>{t}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>}
        </div>

    );
}

