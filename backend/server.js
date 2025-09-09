const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

// Serve static files from the uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ---------------- Multer Storage ----------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folderName = req.body.folderName?.trim();
    if (!folderName) return cb(new Error("Folder name is required"));
    const uploadPath = path.join(__dirname, "uploads", folderName);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const docType = file.fieldname;
    const ext = path.extname(file.originalname);
    cb(null, `${docType}${ext}`);
  },
});

const docFields = [
  { name: "Aadhar", maxCount: 1 },
  { name: "PAN", maxCount: 1 },
  { name: "Driver_License", maxCount: 1 },
  { name: "RC", maxCount: 1 },
  { name: "Permit", maxCount: 1 },
  { name: "Insurance", maxCount: 1 },
  { name: "Fitness", maxCount: 1 },
  { name: "PUC", maxCount: 1 },
  { name: "Car_Photo", maxCount: 1 },
];

const upload = multer({ storage });

// ---------------- Upload Route ----------------
app.post("/upload", upload.fields(docFields), (req, res) => {
  try {
    const folderName = req.body.folderName;
    const uploadedFiles = Object.keys(req.files).map(
      (key) => req.files[key][0].filename
    );
    return res.json({
      message: "Files uploaded successfully!",
      folder: folderName,
      files: uploadedFiles,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// ---------------- GET All Images ----------------
// Returns all folders and files inside "uploads"
app.get("/images", (req, res) => {
  const uploadsDir = path.join(__dirname, "uploads");
  const ownerId = req.query.owner_id; // get owner_id query

  if (!fs.existsSync(uploadsDir)) {
    return res.json({ files: [] });
  }

  // If owner_id is provided, return files only for that folder
  if (ownerId) {
    const folderPath = path.join(uploadsDir, ownerId);
    if (!fs.existsSync(folderPath)) {
      return res.json({ files: [] }); // folder doesn't exist
    }
    const files = fs.readdirSync(folderPath);
    return res.json({ files }); // return only files array
  }

  // Otherwise return all folders
  const folders = fs.readdirSync(uploadsDir).map((folder) => {
    const folderPath = path.join(uploadsDir, folder);
    const files = fs.readdirSync(folderPath);
    return { folder, files };
  });

  res.json({ folders });
});

// ---------------- Start Server ----------------
app.listen(5000, () => console.log("Server running on port 5000"));
