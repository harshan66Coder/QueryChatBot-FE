import React, { useState } from "react";
import toast from "react-hot-toast";

const FileUploader = () => {
    const [files, setFiles] = useState([]);

    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFiles = Array.from(event.dataTransfer.files);
        const model = localStorage.getItem("modelName");

        if (!model) {
            return toast.error('Please enter a (Model and Apikey)');
        }

        setFiles((prev) => [...prev, ...droppedFiles]);
        toast.success("File upload successfully")
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleFileSelect = (event) => {
        const selectedFiles = Array.from(event.target.files);
        const model = localStorage.getItem("modelName");

        if (!model) {
            return toast.error('Please enter a (Model and Apikey)');
        }

        setFiles((prev) => [...prev, ...selectedFiles]);
        toast.success("File upload successfully")

    };

    const handleRemoveFile = (file) => {
        setFiles((prevFiles) => prevFiles.filter((prevfile) => prevfile.id !== file.id));
        toast.success(`${file.name}file has been deleted Successfully`)
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
                <div>
                    <ul>
                        {files.map((file, index) => (
                            <li key={index} style={{ marginBottom: "8px" }}>
                                <span className="text-green-700">{file.name}  ({Math.round(file.size / 1024)} KB)</span>
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
                </div>
            )}



        </div>
    );
};

export default FileUploader;
