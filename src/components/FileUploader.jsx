import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

const FileUploader = () => {
    const [files, setFiles] = useState([]);

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
                        onClick={handleUpload}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Upload to Server
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileUploader;
