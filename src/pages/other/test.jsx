import React, { useState } from "react";
import { Home, Car, Wallet, User, Menu } from "lucide-react";

export default function CarBookingApp() {
  const [activeTab, setActiveTab] = useState("oneway");
  const [activeMenu, setActiveMenu] = useState("home");

  const bookingTabs = [
    { key: "oneway", label: "One Way" },
    { key: "roundtrip", label: "Round Trip" },
    { key: "localduty", label: "Local Duty" },
    { key: "localtaxi", label: "Local Taxi" },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">RideNow</h1>
        <Menu className="w-6 h-6" />
      </header>

      {/* Booking Tabs */}
      <div className="flex justify-around bg-white shadow-md">
        {bookingTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 font-semibold ${
              activeTab === tab.key ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Booking Form */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "oneway" && (
          <BookingForm title="One Way Trip" fields={["Pickup Location", "Drop Location", "Date", "Time"]} />
        )}
        {activeTab === "roundtrip" && (
          <BookingForm title="Round Trip" fields={["Pickup Location", "Destination", "Start Date", "Return Date"]} />
        )}
        {activeTab === "localduty" && (
          <BookingForm title="Local Duty" fields={["Pickup Location", "Hours", "Date", "Time"]} />
        )}
        {activeTab === "localtaxi" && (
          <BookingForm title="Local Taxi" fields={["Pickup Location", "Drop Location", "Date", "Time"]} />
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-white shadow-inner border-t flex justify-around py-2">
        <NavItem icon={<Home />} label="Home" active={activeMenu === "home"} onClick={() => setActiveMenu("home")} />
        <NavItem icon={<Car />} label="Rides" active={activeMenu === "rides"} onClick={() => setActiveMenu("rides")} />
        <NavItem
          icon={<Wallet />}
          label="Wallet"
          active={activeMenu === "wallet"}
          onClick={() => setActiveMenu("wallet")}
        />
        <NavItem
          icon={<User />}
          label="Profile"
          active={activeMenu === "profile"}
          onClick={() => setActiveMenu("profile")}
        />
      </nav>
    </div>
  );
}

/* Booking Form Component */
function BookingForm({ title, fields }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4">
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      {fields.map((field, index) => (
        <div key={index} className="mb-3">
          <label className="block text-gray-600 text-sm mb-1">{field}</label>
          <input
            type="text"
            placeholder={`Enter ${field}`}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-blue-500"
          />
        </div>
      ))}
      <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
        Book Now
      </button>
    </div>
  );
}

/* Bottom Nav Item */
function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center ${
        active ? "text-blue-600" : "text-gray-500"
      }`}
    >
      <div className="w-6 h-6">{icon}</div>
      <span className="text-xs">{label}</span>
    </button>
  );
}
