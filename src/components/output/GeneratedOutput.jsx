import { useState } from "react";
import Table from "../table/Table";

const GeneratedOutput = ({ isDark }) => {


    const Dummydata = [
        { id: 1, brand: "Dell", model: "XPS 13 Plus", price_usd: 1299, performance_score: 87, cpu: "Intel i7-1360P", battery_hours: 10, release_year: 2024 },
        { id: 2, brand: "Apple", model: "MacBook Air M2", price_usd: 1199, performance_score: 85, cpu: "Apple M2", battery_hours: 18, release_year: 2022 },
        { id: 3, brand: "HP", model: "Spectre x360 14", price_usd: 1399, performance_score: 84, cpu: "Intel i7-1355U", battery_hours: 12, release_year: 2023 },
        { id: 4, brand: "Lenovo", model: "ThinkPad X1 Carbon Gen 11", price_usd: 1599, performance_score: 86, cpu: "Intel i7-1365U", battery_hours: 14, release_year: 2024 },
        { id: 5, brand: "Asus", model: "ZenBook 14 OLED", price_usd: 999, performance_score: 80, cpu: "AMD Ryzen 7 7840U", battery_hours: 13, release_year: 2024 },
        { id: 6, brand: "Acer", model: "Swift 5", price_usd: 749, performance_score: 75, cpu: "Intel i5-1335U", battery_hours: 11, release_year: 2023 },
        { id: 7, brand: "Microsoft", model: "Surface Laptop 5", price_usd: 999, performance_score: 78, cpu: "Intel i5-1240P", battery_hours: 11.5, release_year: 2023 },
        { id: 8, brand: "Razer", model: "Blade 15", price_usd: 2199, performance_score: 92, cpu: "Intel i9-13900H", battery_hours: 6, release_year: 2024 },
        { id: 9, brand: "MSI", model: "Stealth 16", price_usd: 1799, performance_score: 90, cpu: "Intel i7-13700H", battery_hours: 7, release_year: 2024 },
        { id: 10, brand: "LG", model: "Gram 17", price_usd: 1499, performance_score: 79, cpu: "Intel i7-1260P", battery_hours: 19, release_year: 2023 },
        { id: 11, brand: "Huawei", model: "MateBook X Pro", price_usd: 1299, performance_score: 81, cpu: "Intel i7-1260U", battery_hours: 11, release_year: 2022 },
        { id: 12, brand: "Samsung", model: "Galaxy Book 3 Pro 360", price_usd: 1399, performance_score: 82, cpu: "Intel i7-13700P", battery_hours: 12, release_year: 2024 },
        { id: 13, brand: "Dell", model: "G15 Ryzen Edition", price_usd: 999, performance_score: 88, cpu: "AMD Ryzen 9 7945HS", battery_hours: 8, release_year: 2024 },
        { id: 14, brand: "Asus", model: "ROG Zephyrus G14", price_usd: 1299, performance_score: 91, cpu: "AMD Ryzen 9 7940HS", battery_hours: 9, release_year: 2023 },
        { id: 15, brand: "Lenovo", model: "Legion Slim 7", price_usd: 1499, performance_score: 89, cpu: "Intel i7-13800H", battery_hours: 7.5, release_year: 2024 },
        { id: 16, brand: "HP", model: "Envy 16", price_usd: 1199, performance_score: 83, cpu: "Intel i7-12700H", battery_hours: 10, release_year: 2023 },
        { id: 17, brand: "Acer", model: "Predator Helios 16", price_usd: 1699, performance_score: 90, cpu: "Intel i9-13980HX", battery_hours: 5.5, release_year: 2024 },
        { id: 18, brand: "Huawei", model: "MateBook 14s", price_usd: 899, performance_score: 77, cpu: "Intel i5-12450H", battery_hours: 12.5, release_year: 2022 },
        { id: 19, brand: "Apple", model: "MacBook Pro 14 M3", price_usd: 1999, performance_score: 95, cpu: "Apple M3 Pro", battery_hours: 17, release_year: 2024 },
        { id: 20, brand: "Framework", model: "Framework Laptop 13", price_usd: 999, performance_score: 76, cpu: "Intel i5-1240P", battery_hours: 10, release_year: 2023 },
    ];

    const columns = [
        { key: "id", header: "ID" },
        { key: "brand", header: "Brand" },
        { key: "model", header: "Model" },
        { key: "price_usd", header: "Price (USD)" },
        { key: "performance_score", header: "Performance Score" },
        { key: "cpu", header: "CPU" },
        { key: "battery_hours", header: "Battery (hrs)" },
        { key: "release_year", header: "Release Year" },
    ];

    const [data] = useState(`1) Objective Guess:
- Show all records from the "laptops" table.

2) Steps to Achieve This:
- Retrieve the entire dataset from the single "laptops" table.
- Include all columns (id, brand, model, price_usd, performance_score, cpu, battery_hours, release_year).
- Do not apply any filters or transformations.

3) Tables and Relationships:
- There is only one table ("laptops") in this schema.
- No relationships exist with other tables since no additional tables are defined.

4) SQLite Query:
sql
SELECT * FROM laptops;`);

    return (
        <div className="p-4 my-[40px]">
            <h1
                className={`text-2xl mb-3 font-semibold ${isDark ? "text-gray-100" : "text-gray-800"
                    }`}
            >
                Generated Output
            </h1>
            <textarea
                value={data}
                readOnly
                rows={12}
                className={`w-full p-4 rounded-2xl font-mono text-sm outline-none  overflow-y-auto 
    ${isDark
                        ? "bg-[#1c1d1e] text-gray-100 border border-gray-700 dark-scrollbar"
                        : "bg-gray-50 text-gray-900 border border-gray-300 light-scrollbar"
                    }`}
            />

            <Table columns={columns} data={Dummydata} isDark={isDark} />

        </div>
    );
};

export default GeneratedOutput;
