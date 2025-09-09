import React, { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";

import {
  FaUser,
  FaPlus,
  FaCalendarAlt,
  FaCar,
  FaBars,
  FaSignOutAlt,
  FaChevronDown,
} from "react-icons/fa";
import axios from "axios";

export default function DashboardLayout({ title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [tripsDatas, setTripsData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");

  const [openMenus, setOpenMenus] = useState({
    addTrip: false,
    bookingForm: false,
    passengerBooking: false,
    dateBooking: false,
    destinationBooking: false,
    soloBooking: false,
    whatsappbooking: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://www.agnicarrental.com/agni_event_duty/passenger_booking.php"
        );
        console.log("dashboard", response.data);
        setTripsData(response.data);
      } catch (error) {
        console.error("Error fetching trip data:", error);
      }
    };

    fetchData();
  }, []);

  const [bookingStats, setBookingStats] = useState({
    booked: 0,
    cancelled: 0,
    completed: 0,
    picked: 0,
    started: 0,
    dropped: 0,
  });

  useEffect(() => {
    if (tripsDatas.length > 0) {
      setBookingStats({
        booked: tripsDatas.filter((trip) => trip.booking_status === "Booked")
          .length,
        cancelled: tripsDatas.filter(
          (trip) => trip.booking_status === "Cancelled"
        ).length,
        completed: tripsDatas.filter(
          (trip) => trip.booking_status === "Completed"
        ).length,
        picked: tripsDatas.filter((trip) => trip.booking_status === "Picked")
          .length,
        started: tripsDatas.filter((trip) => trip.booking_status === "Started")
          .length,
        dropped: tripsDatas.filter((trip) => trip.booking_status === "Dropped")
          .length,
      });
    }
  }, [tripsDatas]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen && isMobile ? "hidden" : "";
  }, [sidebarOpen, isMobile]);

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => {
      // reset everything except addTrip
      const resetMenus = Object.keys(prev).reduce((acc, key) => {
        acc[key] = key === "addTrip" ? prev[key] : false;
        return acc;
      }, {});

      // toggle only the clicked one (except addTrip)
      return {
        ...resetMenus,
        [menu]: menu === "addTrip" ? !prev[menu] : !prev[menu],
      };
    });
  };
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    localStorage.removeItem("email");

    if (window.confirm("Are you sure you want to log out?")) {
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside
        className={`fixed z-20 inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 lg:relative lg:translate-x-0 w-56 bg-gray-900 text-white shadow-lg flex flex-col`}
      >
        {/* Sidebar Content (scrollable) */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
            <h1 className="text-lg font-bold">Menu</h1>
            <button
              className="lg:hidden text-gray-300"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Navigation (all navlinks will be visible via scroll) */}

          <nav className="mt-4 flex flex-col gap-1">
            {/* Dashboard */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm hover:bg-blue-600 transition ${
                  isActive ? "bg-blue-700" : ""
                }`
              }
            >
              <FaCar size={18} /> Dashboard
            </NavLink>

            {/* Add Trip */}
            <div className="flex flex-col">
              <button
                onClick={() => toggleMenu("addTrip")}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-blue-600 transition"
              >
                <span className="flex items-center gap-3">
                  <FaPlus size={18} /> Add Trip
                </span>
                <FaChevronDown
                  size={14}
                  className={`transition-transform ${
                    openMenus.addTrip ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Add Trip Submenu */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openMenus.addTrip ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="flex flex-col gap-1 ml-6">
                  <NavLink
                    to="/customer-form"
                    className={({ isActive }) =>
                      `px-3 py-2 text-sm hover:bg-blue-700 rounded ${
                        isActive ? "bg-blue-800" : ""
                      }`
                    }
                  >
                    Customer Form
                  </NavLink>

                  <NavLink
                    to="/passenger-form"
                    className={({ isActive }) =>
                      `px-3 py-2 text-sm hover:bg-blue-700 rounded ${
                        isActive ? "bg-blue-800" : ""
                      }`
                    }
                  >
                    Passenger Form
                  </NavLink>

                  {/* Passenger Booking */}
                  <button
                    onClick={() => toggleMenu("passengerBooking")}
                    className="flex items-center justify-between px-3 py-2 text-sm hover:bg-blue-700 rounded"
                  >
                    Passenger Booking
                    <FaChevronDown
                      size={12}
                      className={`transition-transform ${
                        openMenus.passengerBooking ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openMenus.passengerBooking ? "max-h-40" : "max-h-0"
                    }`}
                  >
                    <div className="flex flex-col gap-1 ml-6">
                      <NavLink
                        to="/passenger/local-duty"
                        className={({ isActive }) =>
                          `px-3 py-2 text-sm hover:bg-blue-600 rounded ${
                            isActive ? "bg-blue-800" : ""
                          }`
                        }
                      >
                        Local Trip
                      </NavLink>
                      <NavLink
                        to="/passenger/one-way"
                        className={({ isActive }) =>
                          `px-3 py-2 text-sm hover:bg-blue-600 rounded ${
                            isActive ? "bg-blue-800" : ""
                          }`
                        }
                      >
                        One Way
                      </NavLink>
                      <NavLink
                        to="/passenger/round-trip"
                        className={({ isActive }) =>
                          `px-3 py-2 text-sm hover:bg-blue-600 rounded ${
                            isActive ? "bg-blue-800" : ""
                          }`
                        }
                      >
                        Round Trip
                      </NavLink>
                    </div>
                  </div>

                  {/* Date Booking */}
                  <button
                    onClick={() => toggleMenu("dateBooking")}
                    className="flex items-center justify-between px-3 py-2 text-sm hover:bg-blue-700 rounded"
                  >
                    Date Booking
                    <FaChevronDown
                      size={12}
                      className={`transition-transform ${
                        openMenus.dateBooking ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openMenus.dateBooking ? "max-h-40" : "max-h-0"
                    }`}
                  >
                    <div className="flex flex-col gap-1 ml-6">
                      <NavLink
                        to="/date/local-duty"
                        className={({ isActive }) =>
                          `px-3 py-2 text-sm hover:bg-blue-600 rounded ${
                            isActive ? "bg-blue-800" : ""
                          }`
                        }
                      >
                        Local Trip
                      </NavLink>
                      <NavLink
                        to="/date/one-way"
                        className={({ isActive }) =>
                          `px-3 py-2 text-sm hover:bg-blue-600 rounded ${
                            isActive ? "bg-blue-800" : ""
                          }`
                        }
                      >
                        One Way
                      </NavLink>
                      <NavLink
                        to="/date/round-trip"
                        className={({ isActive }) =>
                          `px-3 py-2 text-sm hover:bg-blue-600 rounded ${
                            isActive ? "bg-blue-800" : ""
                          }`
                        }
                      >
                        Round Trip
                      </NavLink>
                    </div>
                  </div>

                  {/* Destination Booking */}
                  <button
                    onClick={() => toggleMenu("destinationBooking")}
                    className="flex items-center justify-between px-3 py-2 text-sm hover:bg-blue-700 rounded"
                  >
                    Destination Booking
                    <FaChevronDown
                      size={12}
                      className={`transition-transform ${
                        openMenus.destinationBooking ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openMenus.destinationBooking ? "max-h-60" : "max-h-0"
                    }`}
                  >
                    <div className="flex flex-col gap-1 ml-6">
                      <NavLink
                        to="/destination/local-duty"
                        className={({ isActive }) =>
                          `px-3 py-2 text-sm hover:bg-blue-600 rounded ${
                            isActive ? "bg-blue-800" : ""
                          }`
                        }
                      >
                        Local Trip
                      </NavLink>
                      <NavLink
                        to="/destination/one-way"
                        className={({ isActive }) =>
                          `px-3 py-2 text-sm hover:bg-blue-600 rounded ${
                            isActive ? "bg-blue-800" : ""
                          }`
                        }
                      >
                        One Way
                      </NavLink>
                      <NavLink
                        to="/destination/round-trip"
                        className={({ isActive }) =>
                          `px-3 py-2 text-sm hover:bg-blue-600 rounded ${
                            isActive ? "bg-blue-800" : ""
                          }`
                        }
                      >
                        Round Trip
                      </NavLink>
                    </div>
                  </div>

                  {/* Solo Booking */}
                  <button
                    onClick={() => toggleMenu("soloBooking")}
                    className="flex items-center justify-between px-3 py-2 text-sm hover:bg-blue-700 rounded"
                  >
                    Solo Booking
                    <FaChevronDown
                      size={12}
                      className={`transition-transform ${
                        openMenus.soloBooking ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openMenus.soloBooking ? "max-h-40" : "max-h-0 "
                    }`}
                  >
                    <div className="flex flex-col gap-1 ml-6">
                      <NavLink
                        to="/solo/local-duty"
                        className={({ isActive }) =>
                          `px-3 py-2 text-sm hover:bg-blue-600 rounded ${
                            isActive ? "bg-blue-800" : ""
                          }`
                        }
                      >
                        Local Trip
                      </NavLink>
                      <NavLink
                        to="/solo/one-way"
                        className={({ isActive }) =>
                          `px-3 py-2 text-sm hover:bg-blue-600 rounded ${
                            isActive ? "bg-blue-800" : ""
                          }`
                        }
                      >
                        One Way
                      </NavLink>
                      <NavLink
                        to="/solo/round-trip"
                        className={({ isActive }) =>
                          `px-3 py-2 text-sm hover:bg-blue-600 rounded ${
                            isActive ? "bg-blue-800" : ""
                          }`
                        }
                      >
                        Round Trip
                      </NavLink>
                    </div>
                  </div>
                  {/* WhatsApp/Telegram Booking */}
                </div>
                 <NavLink
                    to="/whatsapp-booking"
                    className={({ isActive }) =>
                      `px-3 py-2 text-sm hover:bg-blue-600 rounded ${
                        isActive ? "bg-blue-800" : ""
                      }`
                    }
                  >
                    WhatsApp/Tel Booking
                  </NavLink>
                   
              </div>
              <NavLink
                to="/driver-details"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm hover:bg-blue-600 rounded ${
                    isActive ? "bg-blue-800" : ""
                  }`
                }
              >
                Driver Details
              </NavLink>
              <NavLink
                to="/car-details"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm hover:bg-blue-600 rounded ${
                    isActive ? "bg-blue-800" : ""
                  }`
                }
              >
                Car Details
              </NavLink>
            </div>
          </nav>
        </div>

        {/* Fixed Logout Button */}
        <div className="px-4 py-3 border-t border-gray-700 bg-gray-900 sticky bottom-0">
          <button
            className="flex items-center gap-3 w-full text-sm hover:text-red-400"
            onClick={() => handleLogout()}
          >
            <FaSignOutAlt size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className=" bg-slate-50 p-4 relative">
          <button
            className="lg:hidden absolute left-4 text-gray-600"
            onClick={() => setSidebarOpen(true)}
          >
            <FaBars size={22} />
          </button>
          {/* <h2 className="text-xl md:text-2xl font-bold text-slate-800">
            {title || "Admin Dashboard"}
          </h2> */}
        </header>

        {/* Booking Stats */}
        <div className="gap-4 p-4 bg-slate-50 border-b border-slate-200 shadow-sm w-full mx-auto">
          <div className="w-auto gap-2 grid grid-cols-2 sm:grid-cols-6">
            {[
              {
                key: "booked",
                label: "Booked",
                bg: "bg-blue-100",
                text: "text-blue-700",
                value: bookingStats.booked,
              },
              {
                key: "picked",
                label: "Picked",
                bg: "bg-yellow-100",
                text: "text-yellow-700",
                value: bookingStats.picked,
              },
              {
                key: "started",
                label: "Started",
                bg: "bg-gray-100",
                text: "text-gray-700",
                value: bookingStats.started,
              },
              {
                key: "dropped",
                label: "Dropped",
                bg: "bg-red-100",
                text: "text-red-700",
                value: bookingStats.dropped,
              },
              {
                key: "completed",
                label: "Completed",
                bg: "bg-green-100",
                text: "text-green-700",
                value: bookingStats.completed,
              },
              {
                key: "cancelled",
                label: "Cancelled",
                bg: "bg-red-50",
                text: "text-red-700",
                value: bookingStats.cancelled,
              },
            ].map((stat) => (
              <div
                key={stat.key}
                onClick={() => setStatusFilter(stat.label)} // 👈 CLICK sets filter
                className={`${stat.bg} cursor-pointer rounded-sm p-4 text-center shadow hover:shadow-md transition`}
              >
                <h3 className={`text-xs font-medium ${stat.text}`}>
                  {stat.label}
                </h3>
                <p
                  className={`text-lg font-bold ${stat.text.replace(
                    "700",
                    "900"
                  )} mt-1`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 w-full mx-auto bg-white shadow-md flex flex-col ">
          <Outlet context={{ statusFilter }} />
        </div>
      </main>
    </div>
  );
}
