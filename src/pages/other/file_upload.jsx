import React, { useState } from "react";
import axios from "axios";

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

export default function DocumentUploader({ ownerId }) {
  const [folderName, setFolderName] = useState(ownerId || "");
  const [files, setFiles] = useState({});

  const handleFileChange = (e, type) => {
    setFiles((prev) => ({ ...prev, [type]: e.target.files[0] }));
  };

  const handleUpload = async () => {
    if (!folderName) return alert("Folder name missing");

    const formData = new FormData();
    formData.append("folderName", folderName);

    for (let type of docTypes) {
      if (files[type]) formData.append(type, files[type]);
    }

    try {
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-6xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Upload Documents</h2>

        {/* Folder Name */}
        <div className="mb-6">
          <label className="font-semibold mb-2 block">Folder Name (Owner ID):</label>
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-gray-50 text-gray-600"
            disabled
          />
        </div>

        {/* File Inputs Grid */}
        <div className="grid grid-cols-4 gap-6">
          {docTypes.map((type) => (
            <div key={type} className="flex flex-col">
              <label className="font-semibold mb-2">{type}:</label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, type)}
                className={`w-full border rounded-lg px-2 py-1 cursor-pointer ${
                  files[type]
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 bg-white"
                }`}
              />
              {files[type] && (
                <span className="text-green-600 text-sm mt-1">Selected ✅</span>
              )}
            </div>
          ))}
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          className="w-full mt-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-2xl transition"
        >
          Upload 
        </button>
      </div>
    </div>
  );
}
