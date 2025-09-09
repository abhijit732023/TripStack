import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import * as chrono from "chrono-node";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import LocationInput from "./gmap";
import { X, Check } from "lucide-react";

const mapContainerStyle = { width: "100%", height: "300px" };

export default function BookingForm({ senderPhone }) {
  const tripMessageRef = useRef(null);
  const { register, handleSubmit, setValue, reset, watch } = useForm();

  // ---------------- States ----------------
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [translatedMessage, setTranslatedMessage] = useState("");
  const [extracted, setExtracted] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [popupVisible, setPopupVisible] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [sourceLang, setSourceLang] = useState("mr");

  // Selection menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");
  const menuRef = useRef(null);

  const pickupLocation = watch("pickup_location");

  // ---------------- Google Maps ----------------
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyCZkOB0WSoPjjdf8gRUj9GcXXJuWvpj5Mo",
    libraries: ["places"],
  });

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
    const clean = normalizeText(text);
    const match = clean.match(
      /(\+91[-\s()]?\d{5}[-\s()]?\d{5}|\+91[-\s()]?\d{10}|\b\d{10}\b|\(\d{3,5}\)\d{5,7})/
    );
    return match ? match[0].replace(/[-\s()]/g, "") : "";
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
      console.error("Translation error:", err);
      alert("Failed to translate. Try again later.");
    }
    setTranslating(false);
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

  // Selection handler (works on <div>)
  const handleTextSelection = (e) => {
    const selection = window.getSelection().toString();
    if (selection && selection.trim().length > 0) {
      setSelectedText(selection.trim());
      setMenuPos({ x: e.clientX, y: e.clientY - 30 });
      setMenuVisible(true);
    } else {
      setMenuVisible(false);
    }
  };

  // Option selection
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div className="min-h-full bg-blue-50 flex items-center justify-center p-6 relative">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
          WhatsApp Booking Form
        </h2>

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
      </div>
    </div>
  );
}
