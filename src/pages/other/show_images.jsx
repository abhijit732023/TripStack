import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Folder, FileText, Search, X } from "lucide-react";
import FolderDocumentUploader from "../../components/upload_component"; // Upload modal

/* Section wrapper */
function Section({ title, children, onClick }) {
  return (
    <div
      className="bg-[#40404047] p-6 rounded-2xl mb-6 border border-gray-600 cursor-pointer"
      onClick={onClick}
    >
      <h4 className="text-lg font-semibold mb-3 border-b border-gray-600 pb-1">
        {title}
      </h4>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

/* InputField component */
function InputField({ label, name, value, onChange, onFocus, type = "text" }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-400">{label}</label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        onFocus={onFocus}
        className="px-3 py-2 rounded-lg bg-[#4c4c4c] border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
      />
    </div>
  );
}

export default function FolderImageTable() {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [carData, setCarData] = useState(null);
  const [formState, setFormState] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadFolder, setUploadFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;


  const imageRefs = useRef({});

  // field → keyword mapping
  const fieldFileMap = {
    rc_no: "rc",
    rc_name: "rc",
    rc_manufecture_date: "rc",

    insurance_number: "insurance",
    insurance_doe: "insurance",
    puc_doi: "puc",
    texi_permit_no: "permit",
    texi_permit_doe: "permit",

    fitness_certificate_no: "fitness",
    fitness_certificate_doi: "fitness",
    fitness_certificate_doe: "fitness",
  };

  // section → keyword mapping
  const sectionFileMap = {
    "RC Details": "rc",
    "Fitness Certificate": "fitness",
  };

  // fetch car data
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await axios.get(
          "https://agnicarrental.com/agni_event_duty/car_details_update.php"
        );
        console.log(res.data);

        if (res.data.status === "success") {
          const carFolders = res.data.cardata.map((car) => ({
            folder: car.owner_id,
            files: [],
            car,
          }));
          setFolders(carFolders);
        } else {
          setError("No cars found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch car data");
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const filteredFolders = folders.filter((folder) =>
    folder.folder.toLowerCase().includes(searchTerm.toLowerCase())
  );
    const totalPages = Math.ceil(filteredFolders.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredFolders.slice(startIndex, startIndex + rowsPerPage);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    console.log("Updated car data:", formState);
  };

  const handleRowClick = async (folder) => {
    setSelectedFolder(folder);
    setCarData(folder.car);
    setFormState(folder.car || {});
    try {
      const res = await axios.get(
        `http://localhost:5000/images?owner_id=${folder.folder}`
      );
      setSelectedFolder({ ...folder, files: res.data.files || [] });
    } catch (err) {
      console.error(err);
      setSelectedFolder({ ...folder, files: [] });
    }
  };

  // preview image dynamically (field or section)
  const showImageByKeyword = (keyword) => {
    if (selectedFolder && selectedFolder.files) {
      const matchedFile = selectedFolder.files.find((file) =>
        file.toLowerCase().includes(keyword.toLowerCase())
      );
      if (matchedFile) {
        setPreviewImage(
          `http://localhost:5000/uploads/${selectedFolder.folder}/${matchedFile}`
        );
      }
    }
  };

  const handleFieldFocus = (fieldName) => {
    const keyword = fieldFileMap[fieldName];
    if (keyword) showImageByKeyword(keyword);
  };

  const handleSectionClick = (sectionTitle) => {
    const keyword = sectionFileMap[sectionTitle];
    if (keyword) showImageByKeyword(keyword);
  };

  const closeModal = () => {
    setSelectedFolder(null);
    setCarData(null);
    setPreviewImage(null);
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-lg text-gray-200">Loading cars...</p>
    );
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="min-h-full bg-gray-900 p-6 text-gray-200">
      <h2 className="text-3xl font-bold text-center mb-8">All Cars</h2>

      {/* Search */}
      <div className="mb-6 flex justify-center">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by owner ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 border border-gray-600 rounded-2xl px-4 py-2 bg-white/10 text-gray-100 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Table */}
<div className="bg-white/10 h-[60vh] backdrop-blur-lg shadow-2xl rounded-2xl border border-gray-700 overflow-hidden">
  {/* Table header */}
  <table className="w-full border-collapse table-fixed">
    <thead className="bg-gray-800/80 text-gray-100 sticky top-0 z-10">
      <tr>
        <th className="px-4 py-2 text-left border-r border-gray-700 max-w-[120px] truncate">
          Owner ID
        </th>
        <th className="px-4 py-2 text-left border-r border-gray-700 max-w-[120px] truncate">
          Vehicle No
        </th>
        {/* Hide on small, show from lg */}
        <th className="px-4 py-2 text-left border-r border-gray-700 max-w-[150px] truncate hidden lg:table-cell">
          Vehicle Name
        </th>
        <th className="px-4 py-2 text-left border-r border-gray-700 max-w-[100px] truncate hidden lg:table-cell">
          Fuel Type
        </th>
        <th className="px-4 py-2 text-left border-r border-gray-700 max-w-[140px] truncate hidden lg:table-cell">
          RC No
        </th>
        <th className="px-4 py-2 text-left border-r border-gray-700 max-w-[100px] truncate">
          Status
        </th>
        <th className="px-4 py-2 text-center max-w-[120px] truncate">
          Actions
        </th>
      </tr>
    </thead>
  </table>

  {/* Scrollable body */}
  <div className="max-h-full overflow-y-auto">
    <table className="w-full border-collapse table-fixed">
      <tbody>
        {currentData.map((folder, idx) => {
          const car = folder.car;
          return (
            <tr
              key={idx}
              className={idx % 2 === 0 ? "bg-gray-900/50" : "bg-gray-800/50"}
            >
              <td className="px-6 py-2 border-t border-r border-gray-700 truncate">
                {folder.folder}
              </td>
              <td className="px-6 py-2 border-t border-r border-gray-700 truncate">
                {car.vehicle_number}
              </td>
              {/* Hide below lg */}
              <td className="px-6 py-2 border-t border-r border-gray-700 truncate hidden lg:table-cell">
                {car.vehicle_name}
              </td>
              <td className="px-6py-2 border-t border-r border-gray-700 truncate hidden lg:table-cell">
                {car.fuel_type}
              </td>
              <td className="px-6 py-2 border-t border-r border-gray-700 truncate hidden lg:table-cell">
                {car.rc_no}
              </td>
              <td className="px-6 py-2 border-t border-r border-gray-700 truncate">
                {car.status}
              </td>
              <td className="px-6 py-2 border-t border-gray-700 flex gap-2 justify-center">
                <button
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl"
                  onClick={() => handleRowClick(folder)}
                >
                  Verify
                </button>
                <button
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-2xl"
                  onClick={() => setUploadFolder(folder.folder)}
                >
                  Upload
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div>
     <div className="flex justify-center items-center gap-2 p-4 bg-gray-900/60 border-t border-gray-700 mt-2 rounded-b-2xl">
  {/* Prev */}
  <button
    className="px-3 py-1 bg-gray-700 text-white rounded-lg disabled:opacity-40"
    disabled={currentPage === 1}
    onClick={() => setCurrentPage((p) => p - 1)}
  >
    Prev
  </button>

  {/* Page numbers */}
  {Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((page) => {
      if (page === 1) return true; // Always show first
      if (page === totalPages) return true; // Always show last
      if (page >= currentPage - 1 && page <= currentPage + 1) return true; // Show current -1, current, current+1
      return false;
    })
    .map((page, i, arr) => {
      const prevPage = arr[i - 1];
      return (
        <React.Fragment key={page}>
          {/* Ellipsis if gap */}
          {prevPage && page - prevPage > 1 && (
            <span className="px-2 text-gray-400">...</span>
          )}

          <button
            className={`px-3 py-1 rounded-lg ${
              currentPage === page
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        </React.Fragment>
      );
    })}

  {/* Next */}
  <button
    className="px-3 py-1 bg-gray-700 text-white rounded-lg disabled:opacity-40"
    disabled={currentPage === totalPages}
    onClick={() => setCurrentPage((p) => p + 1)}
  >
    Next
  </button>
</div>





      {/* Modal: form + images */}
      {selectedFolder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl flex overflow-hidden">
            {/* Left: form */}
            <div className="w-1/2 p-6 overflow-y-auto max-h-[90vh] border-r border-gray-700">
              <div className="flex justify-between mb-4">
                <h3 className="text-xl font-bold">Car Details</h3>
              </div>
              {carData ? (
                <form onSubmit={handleUpdate} className="space-y-6">
                  {/* RC Section */}
                  <Section
                    title="RC Details"
                    onClick={() => handleSectionClick("RC Details")}
                  >
                    <InputField
                      label="RC Number"
                      name="rc_no"
                      value={formState.rc_no}
                      onChange={handleChange}
                      onFocus={() => handleFieldFocus("rc_no")}
                    />
                    <InputField
                      label="RC Name"
                      name="rc_name"
                      value={formState.rc_name}
                      onChange={handleChange}
                      onFocus={() => handleFieldFocus("rc_name")}
                    />
                    <InputField
                      label="RC Manufacturing Date"
                      name="rc_manufecture_date"
                      type="date"
                      value={formState.rc_manufecture_date}
                      onChange={handleChange}
                      onFocus={() => handleFieldFocus("rc_manufecture_date")}
                    />
                  </Section>

                  {/* Insurance & Permits */}
                  <Section
                    title="Insurance & Permits"
                    onClick={() => handleSectionClick("Insurance & Permits")}
                  >
                    <InputField
                      label="Insurance Number"
                      name="insurance_number"
                      value={formState.insurance_number}
                      onChange={handleChange}
                      onFocus={() => handleFieldFocus("insurance_number")}
                    />
                    <InputField
                      label="Insurance DOE"
                      name="insurance_doe"
                      type="date"
                      value={formState.insurance_doe}
                      onChange={handleChange}
                      onFocus={() => handleFieldFocus("insurance_doe")}
                    />
                    <InputField
                      label="PUC DOI"
                      name="puc_doi"
                      type="date"
                      value={formState.puc_doi}
                      onChange={handleChange}
                      onFocus={() => handleFieldFocus("puc_doi")}
                    />
                    <InputField
                      label="Taxi Permit No"
                      name="texi_permit_no"
                      value={formState.texi_permit_no}
                      onChange={handleChange}
                      onFocus={() => handleFieldFocus("texi_permit_no")}
                    />
                    <InputField
                      label="Taxi Permit DOE"
                      name="texi_permit_doe"
                      type="date"
                      value={formState.texi_permit_doe}
                      onChange={handleChange}
                      onFocus={() => handleFieldFocus("texi_permit_doe")}
                    />
                  </Section>

                  {/* Fitness */}
                  <Section
                    title="Fitness Certificate"
                    onClick={() => handleSectionClick("Fitness Certificate")}
                  >
                    <InputField
                      label="Certificate Number"
                      name="fitness_certificate_no"
                      value={formState.fitness_certificate_no}
                      onChange={handleChange}
                      onFocus={() => handleFieldFocus("fitness_certificate_no")}
                    />
                    <InputField
                      label="Certificate DOI"
                      name="fitness_certificate_doi"
                      type="date"
                      value={formState.fitness_certificate_doi}
                      onChange={handleChange}
                      onFocus={() =>
                        handleFieldFocus("fitness_certificate_doi")
                      }
                    />
                    <InputField
                      label="Certificate DOE"
                      name="fitness_certificate_doe"
                      type="date"
                      value={formState.fitness_certificate_doe}
                      onChange={handleChange}
                      onFocus={() =>
                        handleFieldFocus("fitness_certificate_doe")
                      }
                    />
                  </Section>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-green-700 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold transition"
                    >
                      Update
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-gray-400">No car details found</p>
              )}
            </div>

            {/* Right: images */}
            <div className="w-1/2 p-6 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-4 ">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Folder size={18} /> {selectedFolder.folder} Documents
                </h3>
                <button
                  onClick={closeModal}
                  className="px-2 py-2 bg-gray-700 rounded-full hover:bg-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              {selectedFolder.files && selectedFolder.files.length > 0 ? (
                <ul className="divide-y divide-gray-700">
                  {selectedFolder.files.map((file) => {
                    const fileUrl = `http://localhost:5000/uploads/${selectedFolder.folder}/${file}`;
                    return (
                      <li
                        key={file}
                        onClick={() => setPreviewImage(fileUrl)}
                        className="px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-gray-800/50 transition"
                      >
                        <FileText size={18} className="text-gray-400" />
                        <span className="text-gray-200 text-sm truncate">
                          {file}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-400">No documents uploaded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image preview */}
      {previewImage && (
        <div className="fixed top-0 bottom-0 right-0 z-50 flex w-[50vw] items-center justify-center bg-black/80 p-4">
          <div className="relative w-auto h-full flex items-center justify-center rounded-sm">
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-[60vh] object-contain rounded-2xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-2 bg-gray-800 text-white rounded-full hover:bg-gray-600 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadFolder && (
        <FolderDocumentUploader
          folder={uploadFolder}
          onClose={() => setUploadFolder(null)}
        />
      )}
    </div>
  );
}
