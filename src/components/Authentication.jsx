import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function Authentication({ isDark }) {
    const [modelName, setModelName] = useState("");
    const [apiKey, setApiKey] = useState("");

    useEffect(() => {
        const storedModel = localStorage.getItem("modelName");
        const storedApiKey = localStorage.getItem("apiKey");
        if (storedModel) setModelName(storedModel);
        if (storedApiKey) setApiKey(storedApiKey);
    }, []);

    const handleAdd = () => {
        localStorage.setItem("modelName", modelName);
        localStorage.setItem("apiKey", apiKey);
        toast.success("Successfully Added");
    };

    const handleClear = () => {
        setModelName("");
        setApiKey("");
        toast.success("Cleared");
        localStorage.removeItem("modelName");
        localStorage.removeItem("apiKey");
    };

    return (
        <div
            className={`max-w-full mx-auto p-6 mt-10 rounded-md shadow-sm transition-colors duration-300 ${isDark ? "bg-[#1c1d1e] text-white" : "bg-white text-black"
                }`}
        >

            <div className="flex flex-col md:flex-row md:space-x-6 items-start md:items-center">
                <div className="flex flex-col md:flex-row md:space-x-4 flex-1 w-full">
                    <label className="flex flex-col mb-4 md:mb-0 flex-1">
                        <span className={`font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            Model Name
                        </span>
                        <input
                            type="text"
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                                ? "bg-gray-800 text-white border-gray-600"
                                : "bg-white text-black border-gray-300"
                                }`}
                            placeholder="Enter model name"
                        />
                    </label>

                    <label className="flex flex-col flex-1">
                        <span className={`font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            API Key
                        </span>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                                ? "bg-gray-800 text-white border-gray-600"
                                : "bg-white text-black border-gray-300"
                                }`}
                            placeholder="Enter API key"
                        />
                    </label>
                </div>

                <div className="flex space-x-4 mt-4 md:mt-5">
                    <button
                        onClick={handleAdd}
                        className={`px-6 py-2 rounded-md transition ${isDark
                            ? "bg-blue-700 text-white hover:bg-blue-800"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                    >
                        Add
                    </button>

                    <button
                        onClick={handleClear}
                        className={`px-6 py-2 rounded-md transition ${isDark
                            ? "bg-gray-700 text-white hover:bg-gray-600"
                            : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                            }`}
                    >
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
}
