import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import * as chrono from "chrono-node";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import LocationInput from "./gmap";
import { X, Check, Trash2 } from "lucide-react";

const mapContainerStyle = { width: "100%", height: "300px" };

export default function BookingForm({ senderPhone }) {
  const tripMessageRef = useRef(null);
  const { register, handleSubmit, setValue, reset, watch } = useForm();
   const [deletingId, setDeletingId] = useState(null);

  // ---------------- States ----------------
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [translatedMessage, setTranslatedMessage] = useState("");
  const [extracted, setExtracted] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [popupVisible, setPopupVisible] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [sourceLang, setSourceLang] = useState("mr");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");
  const menuRef = useRef(null);
  const [todayCount, setTodayCount] = useState(0);
  const [trips, setTrips] = useState([]);
  const [online_driver, setOnline_driver] = useState(null);


  // 🚨 Duplicate check state
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const pickupLocation = watch("pickup_location");
  const mobileNumber = watch("mobile_number");
  const fromDate = watch("from_date");
const [currentPage, setCurrentPage] = useState(1);
const rowsPerPage = 15;

// ---------- Pagination logic ----------
const totalPages = Math.ceil(trips.length / rowsPerPage);
const currentTrips = trips.slice(
  (currentPage - 1) * rowsPerPage,
  currentPage * rowsPerPage
);

const getPageNumbers = () => {
  const pageNumbers = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1, 2, 3, "...", totalPages);
  }
  return pageNumbers;
};

  // ---------------- Google Maps ----------------
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyCZkOB0WSoPjjdf8gRUj9GcXXJuWvpj5Mo",
    libraries: ["places"],
  });
const fetchTodayBookings = async () => {
  try {
    const res = await axios.get(
      "https://www.agnicarrental.com/whatsapp_trips/whatsapp_trips.php"
    );
    console.log('bookings',res.data.data);
    
    const onlinedriver = await axios.get('https://www.agnicarrental.com/whatsapp_trips/online_driver_count.php')
    console.log('online driver',onlinedriver.data.data.length);
    setOnline_driver(onlinedriver.data.data.length);
    

    if (Array.isArray(res.data.data)) {
      const today = new Date().toISOString().split("T")[0];
      const count = res.data.data.filter(
        (b) => b.pickup_date === today || b.created_at === today
      ).length;
      setTodayCount(count);

      // ✅ Save trips to state
      setTrips(res.data.data);
    }

    return res.data.data || [];
  } catch (err) {
    console.error("Error fetching bookings:", err);
    return [];
  }
};
  const handleDelete = async (trip_id) => {
    if (!window.confirm("Are you sure you want to delete this trip?")) return;

    try {
      setDeletingId(trip_id);

      const response = await axios.delete(
        "https://www.agnicarrental.com/whatsapp_trips/whatsapp_trips.php",
        {
          data: { trip_id },
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        alert("Trip deleted successfully ✅");
        // update parent state
        onDeleteSuccess(trip_id);
      } else {
        alert(response.data.message || "Failed to delete trip ❌");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Something went wrong while deleting ❌");
    } finally {
      setDeletingId(null);
    }
  };


  useEffect(() => {
    fetchTodayBookings();
  }, []);

  // ---------------- Duplicate Trip Watcher ----------------
  useEffect(() => {
    const checkDuplicate = async () => {
      if (!mobileNumber || !fromDate) {
        setDuplicateWarning(null);
        return;
      }
      const bookings = await fetchTodayBookings();
      const duplicate = bookings.find(
        (b) =>
          b.mobile_number?.slice(-10) === mobileNumber.slice(-10) &&
          b.pickup_date === fromDate
      );
      if (duplicate) {
        console.log("Duplicate found:", duplicate);

        if (duplicate) {
          console.log("Duplicate found:", duplicate);

          setDuplicateWarning(
            `⚠️ A trip already exists for\n${mobileNumber}\n${fromDate}\n${duplicate.trip_message}`
          );
        }
      } else {
        setDuplicateWarning(null);
      }
    };
    checkDuplicate();
  }, [mobileNumber, fromDate]);

  // ---------------- Normalizer ----------------
  const normalizeText = (text) => {
    return text
      .normalize("NFKD")
      .replace(/[\u{1F600}-\u{1F64F}]/gu, "")
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, "")
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, "")
      .replace(/[\u{2600}-\u{26FF}]/gu, "")
      .replace(/[\u{2700}-\u{27BF}]/gu, "")
      .replace(/[^\x00-\x7F\u0900-\u097F\s\-]/g, "");
  };

  // ---------------- Parsers ----------------
  const parseDate = (text) => {
    const clean = normalizeText(text);
    const numeric = clean.match(/(\d{1,2})[-\/. ](\d{1,2})[-\/. ](\d{2,4})/);
    if (numeric) {
      let [d, m, y] = numeric.slice(1, 4).map(Number);
      if (y < 100) y += 2000;
      if (m > 12 && d <= 12) [d, m] = [m, d];
      const dt = new Date(y, m - 1, d);
      if (!isNaN(dt)) {
        const yyyy = dt.getFullYear();
        const mm = String(dt.getMonth() + 1).padStart(2, "0");
        const dd = String(dt.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      }
    }
    const chronoDate = chrono.parseDate(clean);
    if (chronoDate) {
      const yyyy = chronoDate.getFullYear();
      const mm = String(chronoDate.getMonth() + 1).padStart(2, "0");
      const dd = String(chronoDate.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
    return "";
  };

  const parseMobile = (text) => {
    if (!text) return "";

    // 1. Remove emojis & special chars using your normalizeText
    let clean = normalizeText(text);

    // 2. Remove everything except digits
    let digitsOnly = clean.replace(/\D/g, "");

    // 3. If more than 10 digits, take last 10 (common for +91 or formats like 09123456789)
    if (digitsOnly.length >= 10) {
      return digitsOnly.slice(-10);
    }

    return "";
  };

  const parsePickupLocation = (text) => {
    const cleanText = normalizeText(text);
    const regexKeywords =
      /\b(?:Pickup|Pick\s*Up|Pickup\s*Location|From|Boarding|Origin)\b\s*[:\-➡️]?\s*([\w\s\(\)\-\/,]+)/i;
    const matchKeywords = cleanText.match(regexKeywords);
    if (matchKeywords) return matchKeywords[1].trim();

    const regexRoute =
      /([\w\s\(\)\-\/,]+?)\s*(?:to|→|-|–)\s*([\w\s\(\)\-\/,]+)/i;
    const matchRoute = cleanText.match(regexRoute);
    if (matchRoute) return matchRoute[1].trim();

    const lines = cleanText.split(/\n+/);
    for (let line of lines) {
      line = line.trim();
      if (
        line.length > 2 &&
        !line.toLowerCase().includes("drop") &&
        line.match(/[\w\u0900-\u097F]/)
      ) {
        return line;
      }
    }
    return "";
  };

  const parseTripMessage = (text) => normalizeText(text.trim());

  // ---------------- Translation ----------------
  const translateMessage = async () => {
    if (!message.trim()) return;
    setTranslating(true);
    try {
      const res = await axios.get("https://api.mymemory.translated.net/get", {
        params: { q: message, langpair: `${sourceLang}|en` },
      });
      const translatedText =
        res.data.responseData.translatedText || "Translation failed";
      setTranslatedMessage(translatedText);
      setMessage(translatedText);
    } catch (err) {
      alert("Failed to translate. Try again later.");
    }
    setTranslating(false);
  };
  const handleOptionSelect = (option) => {
    if (!selectedText) return;
    if (option === "mobile_number") {
      setValue("mobile_number", selectedText);
    } else if (option === "pickup_location") {
      setValue("pickup_location", selectedText);
    } else if (option === "from_date") {
      setValue("from_date", parseDate(selectedText));
    }
    setMenuVisible(false);
    setSelectedText("");
  };

  // ---------------- Extract details ----------------
  const extractDetails = () => {
    const rawText = translatedMessage || message;
    const date = parseDate(rawText);
    const mobile = parseMobile(rawText) || senderPhone || "";
    const pickupLoc = parsePickupLocation(rawText) || "";
    const newData = {
      trip_message: parseTripMessage(rawText),
      from_date: date,
      mobile_number: mobile,
      pickup_location: pickupLoc,
      latitude: null,
      longitude: null,
    };

    const errors = {};
    if (!mobile) errors.mobile_number = false;
    if (!pickupLoc) errors.pickup_location = false;
    if (!date) errors.from_date = false;

    setFieldErrors(errors);
    setExtracted(newData);
    Object.keys(newData).forEach((key) => setValue(key, newData[key]));
    if (Object.keys(errors).length > 0) setPopupVisible(true);
  };
  const handleUseCurrentDate = (use) => {
    if (use) {
      const today = new Date().toISOString().split("T")[0];
      setExtracted((prev) => {
        const updated = { ...(prev || {}), from_date: today };
        Object.keys(updated).forEach((key) => setValue(key, updated[key]));
        return updated;
      });
    }
    setPopupVisible(false);
  };

  const handleTextSelection = (e) => {
    const selection = window.getSelection().toString();
    if (selection && selection.trim().length > 0) {
      setSelectedText(selection.trim());
      setMenuPos({ x: e.clientX, y: e.clientY-30 });
      setMenuVisible(true);
    } else {
      setMenuVisible(false);
    }
  };

  // ---------------- Submit ----------------
  const onSubmit = async (formData) => {
    if (
      !formData.mobile_number ||
      !formData.pickup_location ||
      !formData.from_date
    ) {
      alert("Please fill all required fields before submitting.");
      return;
    }
    if (!extracted?.latitude || !extracted?.longitude) {
      alert("Please select a valid pickup location on the map.");
      return;
    }

    try {
      const payload = {
        trip_message: formData.trip_message,
        mobile_number: formData.mobile_number.slice(-10),
        pickup_date: formData.from_date,
        pickup_location: formData.pickup_location,
        latitude: extracted.latitude,
        longitude: extracted.longitude,
        status: "active",
      };

      await axios.post(
        "https://www.agnicarrental.com/whatsapp_trips/whatsapp_trips.php",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      alert("Data submitted successfully!");
      reset();
      setMessage("");
      setTranslatedMessage("");
      setExtracted(null);
      setFieldErrors({});
    } catch (err) {
      alert("Error submitting form. Please try again.");
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-full bg-blue-50 flex flex-col items-center justify-center p-6 relative">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
          WhatsApp Booking Form
        </h2>
       <div>
         <p className="text-center text-xl mb-4 text-gray-600">
          Today's Bookings :
          <span className="font-semibold text-xl text-blue-600">
            {todayCount}
          </span>
        </p>
         <p className="text-center text-xl mb-4 text-gray-600">
          Online Driver :
          <span className="font-semibold text-xl text-blue-600">
            {online_driver?online_driver:0}
          </span>
        </p>
       </div>

        {/* 🚨 Duplicate Warning */}
        {duplicateWarning && (
          <div className="bg-red-100 border border-red-500 text-red-900 px-4 py-2 rounded-xl mb-4 whitespace-pre-line">
            {duplicateWarning}
          </div>
        )}

        {!isLoaded ? (
          <p className="text-center text-blue-600">Loading Maps...</p>
        ) : (
          <>
            {!extracted && (
              <div className="mb-4">
                <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Paste WhatsApp booking message here..."
                  className="w-full border border-blue-300 bg-blue-50 rounded-2xl p-3"
                />

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={translateMessage}
                    disabled={translating}
                    className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl font-semibold transition"
                  >
                    {translating ? "Translating..." : "Translate to English"}
                  </button>
                  <button
                    onClick={extractDetails}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold transition"
                  >
                    Extract Data
                  </button>
                </div>
              </div>
            )}

            {/* Popup */}

            {popupVisible && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Missing/Invalid Fields
                  </h3>

                  <table className="w-full table-auto border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-2 py-1 text-left text-gray-700">
                          Field
                        </th>
                        <th className="border px-2 py-1 text-left text-gray-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(fieldErrors).map(([key, value]) => (
                        <tr key={key} className="hover:bg-gray-50">
                          <td className="border px-2 py-1">{key}</td>
                          <td className="border px-2 py-1 flex items-center gap-1">
                            {value === false ? (
                              <>
                                <X size={18} className="text-red-600" />
                                <span className="text-red-600">Missing</span>
                              </>
                            ) : (
                              <>
                                <Check size={18} className="text-green-600" />
                                <span className="text-green-600">OK</span>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition"
                      onClick={() => handleUseCurrentDate(true)}
                    >
                      Use Today for Date
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-300 rounded-2xl hover:bg-gray-400 transition"
                      onClick={() => setPopupVisible(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Extracted Form */}
            {extracted && (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5 mt-4"
              >
                <div>
                  <label className="font-semibold text-blue-700">
                    Trip Message
                  </label>
                  <textarea
                    ref={tripMessageRef}
                    {...register("trip_message")}
                    rows={4}
                    placeholder="Paste the trip message here..."
                    onMouseUp={handleTextSelection}
                    className="w-full border border-blue-300 bg-blue-50 h-[220px] rounded-2xl px-3 py-2"
                  />
                </div>

                {/* Floating Menu */}
                {menuVisible && (
                  <div
                    ref={menuRef}
                    className="absolute bg-white shadow-lg border rounded-lg z-50 p-2"
                    style={{ top: menuPos.y, left: menuPos.x }}
                  >
                    <p className="text-sm font-semibold mb-2">
                      Use "{selectedText}" as:
                    </p>
                    <ul className="space-y-1">
                      <li>
                        <button
                          type="button"
                          className="w-full text-left hover:bg-blue-100 px-2 py-1 rounded"
                          onClick={() => handleOptionSelect("mobile_number")}
                        >
                          📱 Mobile Number
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="w-full text-left hover:bg-blue-100 px-2 py-1 rounded"
                          onClick={() => handleOptionSelect("pickup_location")}
                        >
                          📍 Pickup Location
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="w-full text-left hover:bg-blue-100 px-2 py-1 rounded"
                          onClick={() => handleOptionSelect("from_date")}
                        >
                          📅 Date
                        </button>
                      </li>
                    </ul>
                  </div>
                )}

                {/* Floating Menu */}
                {menuVisible && (
                  <div
                    ref={menuRef}
                    className="absolute bg-white shadow-lg border rounded-lg z-50 p-2"
                    style={{ top: menuPos.y, left: menuPos.x }}
                  >
                    <p className="text-sm font-semibold mb-2">
                      Use "{selectedText}" as:
                    </p>
                    <ul className="space-y-1">
                      <li>
                        <button
                          type="button"
                          className="w-full text-left hover:bg-blue-100 px-2 py-1 rounded"
                          onClick={() => handleOptionSelect("mobile_number")}
                        >
                          📱 Mobile Number
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="w-full text-left hover:bg-blue-100 px-2 py-1 rounded"
                          onClick={() => handleOptionSelect("pickup_location")}
                        >
                          📍 Pickup Location
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="w-full text-left hover:bg-blue-100 px-2 py-1 rounded"
                          onClick={() => handleOptionSelect("from_date")}
                        >
                          📅 Date
                        </button>
                      </li>
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-blue-700">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      {...register("mobile_number")}
                      className="w-full border border-blue-300 bg-blue-50 rounded-2xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-blue-700">Date</label>
                    <input
                      type="date"
                      {...register("from_date")}
                      className="w-full border border-blue-300 bg-blue-50 rounded-2xl px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-blue-700">
                    Pickup Location
                  </label>
                  <LocationInput
                    value={pickupLocation}
                    placeholder="Select pickup location"
                    onSelect={(address, lat, lng) => {
                      setValue("pickup_location", address);
                      setExtracted((prev) => ({
                        ...prev,
                        pickup_location: address,
                        latitude: lat,
                        longitude: lng,
                      }));
                    }}
                  />
                </div>

                {extracted.latitude && extracted.longitude && (
                  <div className="mt-4 border border-blue-200 rounded-2xl overflow-hidden">
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      zoom={14}
                      center={{
                        lat: extracted.latitude,
                        lng: extracted.longitude,
                      }}
                    >
                      <Marker
                        position={{
                          lat: extracted.latitude,
                          lng: extracted.longitude,
                        }}
                      />
                    </GoogleMap>
                  </div>
                )}

                <div className="flex gap-4 w-full">
                  <button
                    type="submit"
                    className="w-1/2 py-2 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-semibold transition"
                  >
                    Submit Booking
                  </button>
                  <button
                    type="submit"
                    onClick={() => {
                      reset();
                      setMessage("");
                      setTranslatedMessage("");
                      setExtracted(null);
                      setFieldErrors({});
                    }}
                    className="w-1/2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-semibold transition"
                  >
                    reset
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* rest of your existing UI stays same ... */}
      </div>
      {/* 🚖 Trips Table */}
{/* 🚖 Trips Table */}
<div className="mt-8 w-full ">
  <h3 className="text-lg font-semibold text-blue-700 mb-3">All Trips</h3>
  <div className="overflow-x-auto border rounded-2xl w-full shadow-md">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="border px-3 py-2">Sr/No</th>
            <th className="border px-3 py-2">Trip Message</th>
            <th className="border px-3 py-2 text-center">Click Counter</th>
            <th className="border px-3 py-2">Pickup Location</th>
            <th className="border px-3 py-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentTrips.map((trip, index) => (
            <tr key={trip.id} className="hover:bg-gray-50">
              <td className="border px-3 py-2">
                {(currentPage - 1) * rowsPerPage + index + 1}
              </td>
              <td className="border px-3 py-2 max-w-xs truncate">
                {trip.trip_message}
              </td>
              <td
                className={`border px-3 py-2 text-center font-semibold ${
                  trip.drivers_click_counter > 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                } rounded-lg`}
              >
                {trip.drivers_click_counter}
              </td>
              <td className="border px-3 py-2">{trip.pickup_location}</td>
              <td className="border px-3 py-2 text-center">
                <button
                  onClick={() => handleDelete(trip.id)}
                  disabled={deletingId === trip.id}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1 mx-auto disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  {deletingId === trip.id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  {/* Pagination */}
  <div className="flex justify-center gap-2 mt-4">
    <button
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-40"
      disabled={currentPage === 1}
    >
      Prev
    </button>

    {getPageNumbers().map((page, idx) => (
      <button
        key={idx}
        onClick={() => typeof page === "number" && setCurrentPage(page)}
        className={`px-3 py-1 rounded-lg hover:bg-blue-100 ${
          page === currentPage ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
        disabled={page === "..."}
      >
        {page}
      </button>
    ))}

    <button
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-40"
      disabled={currentPage === totalPages}
    >
      Next
    </button>
  </div>
</div>


    </div>
  );
}
