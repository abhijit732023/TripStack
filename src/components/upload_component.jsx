import React, { useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

const docTypes = [
  "Aadhar",
  "PAN",
  "Driver_License",
  "RC",
  "Permit",
  "Insurance",
  "Fitness",
  "PUC",
  "Car_Photo",
];

export default function FolderDocumentUploader({ folder, onClose }) {
  const [files, setFiles] = useState({});

  const handleFileChange = (e, type) => {
    setFiles((prev) => ({ ...prev, [type]: e.target.files[0] }));
  };

  const handleDrop = useCallback(
    (acceptedFiles, type) => {
      if (acceptedFiles.length) {
        setFiles((prev) => ({ ...prev, [type]: acceptedFiles[0] }));
      }
    },
    [setFiles]
  );

  const handleUpload = async () => {
    if (!folder) return alert("No folder selected!");

    const formData = new FormData();
    formData.append("folderName", folder);

    for (let type of docTypes) {
      if (files[type]) formData.append(type, files[type]);
    }

    try {
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(res.data.message);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-gray-900 text-gray-100 rounded-2xl shadow-2xl w-full max-w-6xl p-6 relative animate-fadeIn">
        <h2 className="text-xl font-bold mb-6 text-center">
          Upload Documents for {folder}
        </h2>

        <button
          className="absolute top-4 right-4 px-3 py-1 bg-gray-700 rounded-full hover:bg-gray-600 transition"
          onClick={onClose}
        >
          X
        </button>

        {/* File Inputs Grid */}
        <div className="grid grid-cols-3 gap-6">
          {docTypes.map((type) => {
            const { getRootProps, getInputProps, isDragActive } = useDropzone({
              onDrop: (acceptedFiles) => handleDrop(acceptedFiles, type),
              multiple: false,
            });

            return (
              <div key={type} className="flex flex-col">
                <label className="font-semibold mb-2">{type}:</label>

                <div
                  {...getRootProps()}
                  className={`w-full h-16 flex items-center justify-center border-2 rounded-xl cursor-pointer transition ${
                    isDragActive
                      ? "border-blue-400 bg-blue-900"
                      : files[type]
                      ? "border-green-500 bg-green-900"
                      : "border-gray-600 bg-gray-800"
                  }`}
                >
                  <input {...getInputProps()} />
                  <span className="text-gray-200 text-sm">
                    {files[type]
                      ? files[type].name
                      : isDragActive
                      ? "Drop here..."
                      : "Drag & drop or click"}
                  </span>
                </div>

                {files[type] && (
                  <span className="text-green-500 text-sm mt-1">Selected ✅</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          className="w-full mt-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-2xl transition"
        >
          Upload Files
        </button>
      </div>
    </div>
  );
}
