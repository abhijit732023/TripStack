import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import { Car, Route, RefreshCw } from "lucide-react";
import {
  DashboardLayout,
  PassengerBookingForm,
  LocalDutyForm,
  MultiPassengerForm,
  Destination_booking,
  Solo_booking,
} from "../../File_Path/file_path.js";

// ---------- Passenger Booking Selector ----------
function PassengerSelectionPage() {
  const [selectedForm, setSelectedForm] = useState(null);

  const handleBack = () => setSelectedForm(null);

  if (selectedForm) {
    return (
      <div className="h-full w-full p-3 bg-gradient-to-r from-blue-50 to-indigo-100 overflow-y-auto">
        <div className="flex justify-between mb-4">
          <button
            onClick={handleBack}
            className="px-5 py-2 rounded-lg text-gray-700 font-medium hover:bg-blue-500 hover:text-white transition"
          >
            ← Back
          </button>
        </div>

        {selectedForm === "PassengerBooking" && <PassengerBookingForm />}
        {selectedForm === "RoundTrip" && <PassengerBookingForm tripType="round" />}
        {selectedForm === "LocalDuty" && <LocalDutyForm />}
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Select Trip Type
        </h2>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => setSelectedForm("PassengerBooking")}
            className="flex items-center gap-3 bg-blue-50 hover:bg-blue-100 p-4 rounded-xl shadow-md transition"
          >
            <Car className="text-blue-600 w-6 h-6" />
            <span className="font-medium text-gray-800">One Way Trip</span>
          </button>

          <button
            onClick={() => setSelectedForm("RoundTrip")}
            className="flex items-center gap-3 bg-green-50 hover:bg-green-100 p-4 rounded-xl shadow-md transition"
          >
            <RefreshCw className="text-green-600 w-6 h-6" />
            <span className="font-medium text-gray-800">Round Trip</span>
          </button>

          <button
            onClick={() => setSelectedForm("LocalDuty")}
            className="flex items-center gap-3 bg-yellow-50 hover:bg-yellow-100 p-4 rounded-xl shadow-md transition"
          >
            <Route className="text-yellow-600 w-6 h-6" />
            <span className="font-medium text-gray-800">Local Duty</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Main Booking Page ----------
export default function BookingPage() {
  const [activeTab, setActiveTab] = useState("Passenger Booking");

  const menuItems = [
    { name: "Passenger Booking", component: <PassengerSelectionPage /> },
    { name: "Date Booking", component: <MultiPassengerForm /> },
    { name: "Destination Booking", component: <Destination_booking /> },
    { name: "Solo Booking", component: <Solo_booking /> },
  ];

  const activeComponent =
    menuItems.find((item) => item.name === activeTab)?.component || null;

  return (
    <DashboardLayout
      menuItems={menuItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <div className="h-auto bg-gray-100 flex flex-col">
        {/* Clean Header */}
        <nav className="bg-blue-600 text-white px-4 py-3 shadow-md">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <h1 className="text-lg md:text-xl font-bold">Booking Page</h1>
            {/* Sidebar toggle only - no trip menu here */}
            <button className="md:hidden text-white">
              <FaBars size={22} />
            </button>
          </div>
        </nav>

        {/* Content Section */}
        <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
          {activeComponent}
        </div>
      </div>
    </DashboardLayout>
  );
}
