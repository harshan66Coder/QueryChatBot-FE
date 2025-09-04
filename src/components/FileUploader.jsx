import React, { useState } from "react";

const FileUploader = () => {
    const [files, setFiles] = useState([]);

        const handleDrop = (event) => {
            event.preventDefault();
            const droppedFiles = Array.from(event.dataTransfer.files);
            setFiles((prev) => [...prev, ...droppedFiles]);
        };
        const handleDragOver = (event) => {
            event.preventDefault();
        };

        const handleFileSelect = (event) => {
            const selectedFiles = Array.from(event.target.files);
            setFiles((prev) => [...prev, ...selectedFiles]);
        };

        console.log(files);

        return (
            <div style={{ padding: "20px" }}>
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    style={{
                        border: "2px dashed #888",
                        borderRadius: "10px",
                        padding: "40px",
                        textAlign: "center",
                        cursor: "pointer",
                        marginBottom: "20px",
                    }}
                >

                    <p>Drag & Drop files here or click to upload</p>


                    <input
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                        id="fileUpload"
                    />
                    <label htmlFor="fileUpload" style={{ cursor: "pointer", color: "blue" }}>
                        Browse Files
                    </label>
                </div>

                {files.length > 0 && (
                    <div>
                        <h4>Uploaded Files:</h4>
                        <ul>
                            {files.map((file, index) => (
                                <li key={index}>
                                    {file.name} ({Math.round(file.size / 1024)} KB)
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

export default FileUploader;