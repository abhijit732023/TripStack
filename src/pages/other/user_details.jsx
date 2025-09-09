import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, X, FileText } from "lucide-react";
import FolderDocumentUploader from "../../components/upload_component";
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

export default function DriverTable() {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [formState, setFormState] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadDriver, setUploadDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadFolder, setUploadFolder] = useState(null);

  // Mapping field names → file keywords
  const fieldFileMap = {
    phone_number: "profile",
    full_name: "profile",
    email: "profile",
    date_of_birth: "aadhar",
    driver_address: "aadhar",
    driver_city: "aadhar",
    pin_code: "aadhar",

    license_no: "license",
    license_doe: "license",
    license_type: "license",

    adhaar_card_no: "aadhar",
    pan_card_no: "pan",

    userType: "profile",
  };

  // Section to file keyword mapping
  const sectionFileMap = {
    "Personal Info": "aadhar",
    "License Details": "license",
    "User Type": "profile",
  };

  // Fetch all drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await axios.get(
          "https://agnicarrental.com/agni_event_duty/driver_details_update.php"
        );
        console.log(res.data);

        if (res.data.status === "success") {
          setDrivers(res.data.drivers || []);
        } else {
          setError("No drivers found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch drivers");
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  const filteredDrivers = drivers.filter((driver) =>
    driver.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        "https://agnicarrental.com/agni_event_duty/driver_details_update.php",
        formState
      );
      alert(res.data.message || "Updated");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const handleRowClick = async (driver) => {
    try {
      setSelectedDriver(driver);
      setFormState(driver);

      const driverRes = await axios.get(
        `https://agnicarrental.com/agni_event_duty/driver_details_update.php?phone_number=${driver.phone_number}`
      );
      const driverData = driverRes.data.driver || driver;

      const filesRes = await axios.get(
        `http://localhost:5000/images?owner_id=${driverData.phone_number}`
      );

      setSelectedDriver({
        ...driverData,
        files: filesRes.data.files || [],
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      setSelectedDriver({ ...driver, files: [] });
    }
  };

  // Dynamically show image when input field is focused
  const handleFieldFocus = (fieldName) => {
    if (selectedDriver && selectedDriver.files) {
      const keyword = fieldFileMap[fieldName] || fieldName;
      const matchedFile = selectedDriver.files.find((file) =>
        file.toLowerCase().includes(keyword.toLowerCase())
      );
      if (matchedFile) {
        setPreviewImage(
          `http://localhost:5000/uploads/${selectedDriver.phone_number}/${matchedFile}`
        );
      } else {
        setPreviewImage(null);
      }
    }
  };

  // Show image when section is clicked
  const handleSectionClick = (sectionTitle) => {
    if (selectedDriver && selectedDriver.files) {
      const keyword = sectionFileMap[sectionTitle];
      if (!keyword) return;

      const matchedFile = selectedDriver.files.find((file) =>
        file.toLowerCase().includes(keyword.toLowerCase())
      );
      if (matchedFile) {
        setPreviewImage(
          `http://localhost:5000/uploads/${selectedDriver.phone_number}/${matchedFile}`
        );
      } else {
        setPreviewImage(null);
      }
    }
  };

  const closeModal = () => {
    setSelectedDriver(null);
    setPreviewImage(null);
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-lg text-gray-200">
        Loading drivers...
      </p>
    );
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="min-h-full bg-gray-900 p-6 text-gray-200 overflow-hidden">
      <h2 className="text-3xl font-bold text-center mb-8">All Drivers</h2>

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
<div className="bg-white/10 backdrop-blur-lg shadow-2xl sm:h-[400px] h-auto rounded-2xl overflow-hidden border border-gray-700">
  <div className="h-full overflow-y-scroll overflow-x-auto">
    <table className="w-full table-auto border-collapse">
      <thead className="bg-gray-800/80 text-gray-100">
        <tr>
          <th className="px-6 py-1 text-left border-r border-gray-700">
            Phone Number
          </th>
          <th className="px-6 py-3 text-left border-r border-gray-700">
            Full Name
          </th>
          {/* Hide City column on <lg */}
          <th className="px-6 py-3 text-left border-r border-gray-700 hidden lg:table-cell">
            City
          </th>
          <th className="px-6 py-3 text-left border-r border-gray-700">
            Status
          </th>
          {/* Hide Created At column on <lg */}
          <th className="px-6 py-3 text-left border-r border-gray-700 hidden lg:table-cell">
            Created At
          </th>
          <th className="px-6 py-3 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredDrivers.map((driver, idx) => (
          <tr
            key={idx}
            className={idx % 2 === 0 ? "bg-gray-900/50" : "bg-gray-800/50"}
          >
            <td className="px-6 py-3 border-t border-r border-gray-700">
              {driver.phone_number}
            </td>
            <td className="px-6 py-3 border-t border-r border-gray-700">
              {driver.full_name || "-"}
            </td>
            {/* Hide City cell on <lg */}
            <td className="px-6 py-3 border-t border-r border-gray-700 hidden lg:table-cell">
              {driver.driver_city || "-"}
            </td>
            <td className="px-6 py-3 border-t border-r border-gray-700">
              {driver.status}
            </td>
            {/* Hide Created At cell on <lg */}
            <td className="px-6 py-3 border-t border-r border-gray-700 hidden lg:table-cell">
              {driver.created_at}
            </td>
            <td className="px-6 py-3 border-t border-gray-700 flex gap-2 justify-center">
              <button
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl"
                onClick={() => handleRowClick(driver)}
              >
                Verify
              </button>
              <button
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-2xl"
                onClick={() => setUploadFolder(driver.phone_number)}
              >
                Upload
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

      {/* Driver Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          <div className="bg-gray-900 rounded-2xl shadow-2xl w-full  flex overflow-hidden">
            {/* Left: Form */}
            <div className="w-1/2 p-3 overflow-y-auto max-h-[90vh] border-r border-gray-700">
              <div className="flex justify-between mb-4 px-4 pt-4">
                <h3 className="text-xl font-bold">Driver Details</h3>
              </div>
              <form onSubmit={handleUpdate} className="space-y-1">
                {/* Section 1: Personal Info */}
                <Section
                  title="Personal Info"
                  onClick={() => handleSectionClick("Personal Info")}
                >
                  <InputField
                    label="Phone Number"
                    name="phone_number"
                    value={formState.phone_number}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("phone_number")}
                  />
                  <InputField
                    label="Full Name"
                    name="full_name"
                    value={formState.full_name}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("full_name")}
                  />
                  <InputField
                    label="Email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("email")}
                  />
                  <InputField
                    label="Date of Birth"
                    type="date"
                    name="date_of_birth"
                    value={formState.date_of_birth}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("date_of_birth")}
                  />
                  <InputField
                    label="Address"
                    name="driver_address"
                    value={formState.driver_address}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("driver_address")}
                  />
                  <InputField
                    label="City"
                    name="driver_city"
                    value={formState.driver_city}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("driver_city")}
                  />
                  <InputField
                    label="Pincode"
                    name="pin_code"
                    value={formState.pin_code}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("pin_code")}
                  />
                </Section>

                {/* Section 2: License Details */}
                <Section
                  title="License Details"
                  onClick={() => handleSectionClick("License Details")}
                >
                  <InputField
                    label="License No"
                    name="license_no"
                    value={formState.license_no}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("license_no")}
                  />
                  <InputField
                    label="License DOE"
                    type="date"
                    name="license_doe"
                    value={formState.license_doe}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("license_doe")}
                  />
                  <InputField
                    label="License Type"
                    name="license_type"
                    value={formState.license_type}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("license_type")}
                  />
                </Section>

                {/* Section 3: Identification */}
                <Section
                  title="Identification"
                  onClick={() => handleSectionClick("Identification")}
                >
                  <InputField
                    label="Aadhar Card Number"
                    name="adhaar_card_no"
                    value={formState.adhaar_card_no}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("adhaar_card_no")}
                  />
                  <InputField
                    label="PAN Card Number"
                    name="pan_card_no"
                    value={formState.pan_card_no}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("pan_card_no")}
                  />
                </Section>

                {/* Section 4: User Type */}
                <Section
                  title="User Type"
                  onClick={() => handleSectionClick("User Type")}
                >
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="userType"
                        value="Driver"
                        checked={formState.userType === "Driver"}
                        onChange={handleChange}
                        onFocus={() => handleFieldFocus("userType")}
                      />
                      <span className="ml-2">Driver</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="userType"
                        value="Vendor"
                        checked={formState.userType === "Vendor"}
                        onChange={handleChange}
                        onFocus={() => handleFieldFocus("userType")}
                      />
                      <span className="ml-2">Vendor</span>
                    </label>
                  </div>
                </Section>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Driver Files */}
            <div className="w-1/2 p-6 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-bold mb-4">Driver Documents</h3>
                <button
                  onClick={closeModal}
                  className="px-3 py-1 bg-gray-700 rounded-full hover:bg-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {selectedDriver.files && selectedDriver.files.length > 0 ? (
                <ul className="divide-y divide-gray-700">
                  {selectedDriver.files.map((file, idx) => (
                    <li
                      key={idx}
                      onClick={() =>
                        setPreviewImage(
                          `http://localhost:5000/uploads/${selectedDriver.phone_number}/${file}`
                        )
                      }
                      className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-800/50 transition"
                    >
                      <FileText size={18} className="text-gray-400" />
                      <span className="text-gray-200 text-sm truncate">
                        {file}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No documents uploaded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div className="fixed top-0 bottom-0 right-0 z-50 w-[50vw] flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-auto h-full flex items-center justify-center rounded-sm">
            <img
              src={previewImage}
              alt="Preview"
              className="w-full object-contain rounded-2xl"
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
      {uploadFolder && (
        <FolderDocumentUploader
          folder={uploadFolder}
          onClose={() => setUploadFolder(null)}
        />
      )}
    </div>
  );
}
