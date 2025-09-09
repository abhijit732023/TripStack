import { useOutletContext } from "react-router-dom";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";
import TripInvoice from "../invoice/invoice";
import { FaPen, FaTrash, FaFileInvoice } from "react-icons/fa";

export default function AdminDashboard() {
  // ✅ Get filter from parent Dashboard
  const { statusFilter = 'All' } = useOutletContext();

  const [selectedDate, setSelectedDate] = useState(null);
  const [tripsDatas, setTripsData] = useState([]);
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();

  // ✅ Detect screen width
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 390);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // ✅ Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://www.agnicarrental.com/agni_event_duty/passenger_booking.php"
        );
        setTripsData(response.data);
      } catch (error) {
        console.error("Error fetching trip data:", error);
      }
    };
    fetchData();
  }, []);

  // ✅ Date formatting helpers
  const formatDateLocal = (date) => {
    if (!date) return null;
    if (typeof date === "string") return date;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTableDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${parseInt(day, 10)}/${parseInt(month, 10)}/${year.slice(2)}`;
  };

  // ✅ Filter trips
  const filteredTrips = tripsDatas.filter((t) => {
    const matchesDate = selectedDate
      ? t.from_date === formatDateLocal(selectedDate)
      : true;
    const matchesStatus =
      statusFilter === "All" ? true : t.booking_status === statusFilter;
    return matchesDate && matchesStatus;
  });

  // ✅ Export Excel
  // ✅ Export Excel (selected trips only)
  const exportToExcel = () => {
    if (selectedTrips.length === 0) {
      alert("No trips selected for export!");
      return;
    }

    // Map selectedTrip IDs to actual trip objects
    const tripsToExport = tripsDatas.filter((trip) =>
      selectedTrips.includes(trip.id)
    );

    const worksheet = XLSX.utils.json_to_sheet(tripsToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Trips");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "SelectedTrips.xlsx");
  };

  const handleChange = (e) => { if (e.target.value) { navigate(e.target.value); } };
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedTrips([]);
    } else {
      setSelectedTrips(filteredTrips.map((trip) => trip.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleTripSelection = (tripId) => {
    if (selectedTrips.includes(tripId)) {
      setSelectedTrips(selectedTrips.filter((id) => id !== tripId));
    } else {
      setSelectedTrips([...selectedTrips, tripId]);
    }
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-auto w-[86rem] overflow-x-hidden">
      {/* ✅ Top Action Bar */}
      <div className="flex  gap-2 justify-end items-center px-4 py-2 bg-white shadow-sm border-b w-full">
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded-full shadow hover:bg-green-700 text-sm"
        >
          Export Excel
        </button>
        <select onChange={handleChange} className="px-4 py-2 max-sm:w-full bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 text-sm" > 
          <option value="">Select Option</option> 
          <option value="/passenger-form">Passenger Registration</option> 
          <option value="/customer-form">Customer Registration</option> 
          <option value="/passenger/one-way">Passenger One way</option>
           <option value="/passenger/local-duty">Passenger Local Duty</option> 
           <option value="/passenger/round-trip">Passenger Round Trip</option> 
           <option value="/date/one-way">Date One way</option> 
           <option value="/date/local-duty">Date Local Duty</option> 
           <option value="/date/round-trip">Date Round Trip</option> 
           <option value="/destination/one-way">Destination One way</option> 
           <option value="/destination/local-duty">Destination Local Duty</option> 
           <option value="/destination/round-trip">Destination Round Trip</option> 
           <option value="/solo/one-way">Solo One way</option> 
           <option value="/solo/local-duty">Solo Local Duty</option> 
           <option value="/solo/round-trip">Solo Round Trip</option> 
           </select>

      </div>

      {/* ✅ Content Section */}
      <div className="flex flex-col md:flex-row gap-4  w-full">
        {/* Calendar / Date input */}
        <div className="w-full md:w-[280px] bg-white py-2 px-4 rounded-lg shadow-md border border-slate-200">
          <h3 className="text-sm font-semibold mb-2 text-slate-600">
            Select Date
          </h3>
          {isMobile ? (
            <input
              type="date"
              value={selectedDate ? formatDateLocal(selectedDate) : ""}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border px-2 py-2 rounded-md shadow-sm"
            />
          ) : (
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              className="rounded-lg shadow border border-slate-200 w-full"
            />
          )}
        </div>

        {/* ✅ Trips Table */}
        <div className="flex-1 w-full bg-white px-2 md:px-4 py-2 rounded-lg shadow-md border border-slate-200 overflow-hidden">
          <h3 className="font-semibold text-slate-800 text-base mb-3">
            {selectedDate
              ? `Trips on ${typeof selectedDate === "string"
                ? formatTableDate(selectedDate)
                : formatTableDate(formatDateLocal(selectedDate))
              }`
              : "All Trips"}
          </h3>

          <div className="overflow-x-auto max-h-[400px] rounded-lg border border-slate-300 w-full shadow-sm">
            <table className="w-full text-sm border border-slate-300 border-collapse">
              {/* Header */}
              <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs uppercase sticky top-0 shadow-sm max-sm:hidden">
                <tr>
                  <th className="px-2 py-3 text-left border border-slate-300">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                      className="accent-white w-4 h-4 mr-1"
                    />
                    ID
                  </th>
                  <th className="px-2 py-3 text-left border border-slate-300">
                    Trip
                  </th>
                  <th className="px-2 py-3 text-left border border-slate-300">
                    Passenger
                  </th>
                  <th className="px-2 py-3 text-left border border-slate-300">
                    From
                  </th>
                  <th className="px-2 py-3 text-left border border-slate-300">
                    To
                  </th>
                  <th className="px-2 py-3 text-left border border-slate-300">
                    Date
                  </th>
                  <th className="px-2 py-3 text-left border border-slate-300">
                    Time
                  </th>
                  <th className="px-2 py-3 text-left border border-slate-300">
                    Vehicle
                  </th>
                  <th className="px-2 py-3 text-left border border-slate-300">
                    Fare
                  </th>
                  <th className="px-2 py-3 text-left border border-slate-300">
                    Status
                  </th>
                  <th className="px-2 py-3 text-left border border-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {filteredTrips.length > 0 ? (
                  filteredTrips.map((trip) => (
                    <tr
                      key={trip.id}
                      className="hover:bg-blue-50 transition-colors duration-150 max-sm:w-full max-sm:grid max-sm:border-blue-500 max-sm:mb-8 max-sm:grid-cols-1 max-sm:rounded-lg max-sm:shadow-sm border border-slate-300"
                    >
                      <td className="px-2 py-2 flex items-center gap-2  ">
                        <input
                          type="checkbox"
                          checked={selectedTrips.includes(trip.id)}
                          onChange={() => toggleTripSelection(trip.id)}
                          className="accent-blue-600 w-3 h-3"
                        />
                        <span className="font-medium text-slate-700">
                          {trip.id}
                        </span>
                      </td>

                      <td className="px-2 py-2 bg-slate-50/50 text-sm font-semibold text-blue-700 border border-slate-300">
                        {trip.trip_type}
                      </td>
                      <td className="px-2 py-2 border border-slate-300">
                        {trip.passenger_name}
                      </td>
                      <td className="px-2 py-2 sm:max-w-[80px] truncate text-slate-700 border border-slate-300">
                        {trip.from_destination}
                      </td>
                      <td className="px-2 py-2 sm:max-w-[80px] truncate text-slate-700 border border-slate-300">
                        {trip.to_destination}
                      </td>
                      <td className="px-2 py-2 border border-slate-300">
                        {formatTableDate(trip.from_date)}
                      </td>
                      <td className="px-2 py-2 border border-slate-300">
                        {trip.from_time}
                      </td>
                      <td className="px-2 py-2 border border-slate-300">
                        {trip.vehicle_type}
                      </td>
                      <td className="px-2 py-2 text-green-600 font-semibold border border-slate-300">
                        ₹{trip.one_way_cust_fare}
                      </td>
                      <td className="px-2 py-2 border border-slate-300">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${trip.booking_status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : trip.booking_status === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {trip.booking_status}
                        </span>
                      </td>

                      {/* ✅ Actions */}
                      <td className="px-2 py-2 flex gap-2 border border-slate-300">
                        <button className="px-2 py-2 bg-yellow-500 text-white text-xs rounded-lg shadow hover:bg-yellow-600 transition w-full sm:w-auto flex items-center justify-center">
                          <FaPen size={14} />
                        </button>
                        <button className="px-2 py-2 bg-red-500 text-white text-xs rounded-lg shadow hover:bg-red-600 transition w-full sm:w-auto flex items-center justify-center">
                          <FaTrash size={14} />
                        </button>
                        <button
                          onClick={() => setSelectedTrip(trip)}
                          className="px-2 py-2 bg-blue-500 text-white text-xs rounded-lg shadow hover:bg-blue-600 transition w-full sm:w-auto flex items-center justify-center"
                        >
                          <FaFileInvoice size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={12}
                      className="text-center text-slate-500 py-4 border border-slate-300"
                    >
                      No trips found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ Invoice Modal */}
      {selectedTrip && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedTrip(null)}
        >
          <div
            className="bg-transparent w-full max-w-2xl p-6 rounded-lg shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedTrip(null)}
              className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
            >
              ✕
            </button>
            <TripInvoice trip={selectedTrip} />
          </div>
        </div>
      )}
    </div>
  );
}
