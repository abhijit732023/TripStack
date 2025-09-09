import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import {
  FaUser,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaCarSide,
} from "react-icons/fa";
import LocationInput from "../other/gmap";

function PassengerBookingForm() {
  const [passengerData, setPassengerData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [customerDropdown, setCustomerDropdown] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [custId, setCustId] = useState("");
  const [isTableVisible, setIsTableVisible] = useState(false);

  // new states for destination dropdowns
  const [fromDropdown, setFromDropdown] = useState(false);
  const [toDropdown, setToDropdown] = useState(false);
  const [filteredFromDestinations, setFilteredFromDestinations] = useState([]);
  const [filteredToDestinations, setFilteredToDestinations] = useState([]);

  const {
    register,
    watch,
    setValue,
    reset: resetMainForm,
  } = useForm();
  const {
    register: editRegister,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
  } = useForm();

  const passengerName = watch("passenger_name");
  const customerName = watch("customer_name");
  const fromDate = watch("from_date");
  const toDate = watch("to_date");
  const fromDestination = watch("from_destination");
  const toDestination = watch("to_destination");
  const fromTime = watch("from_time");
  const vehicleType = watch("vehicle_type");
  const customerFare = watch("customer_fare");
  const vendorFare = watch("vendor_fare");

  // Fetch passenger list
  useEffect(() => {
    const fetchPassengers = async () => {
      try {
        const response = await axios.get(
          "https://www.agnicarrental.com/agni_event_duty/passenger_form.php"
        );
        setPassengerData(response.data);
      } catch (error) {
        console.error("Error fetching passenger data:", error);
      }
    };
    fetchPassengers();
  }, []);

  // Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get(
          "https://www.agnicarrental.com/oluber/get_vehicle_types.php"
        );
        setVehicles(res.data);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };
    fetchVehicles();
  }, []);

  // Fetch customers list
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          "https://www.agnicarrental.com/agni_event_duty/cust_com_form.php"
        );
        setCustomerData(response.data || []);
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    };
    fetchCustomers();
  }, []);

  // Auto-fill customer_name dropdown logic
  useEffect(() => {
    if (!passengerName) return;

    const matches = passengerData.filter(
      (p) => p.name.toLowerCase() === passengerName.toLowerCase()
    );

    if (matches.length === 1) {
      setValue("customer_name", matches[0].customer_name);
      setCustId(matches[0].customer_id || "");
      setCustomerDropdown(false);
    } else if (matches.length > 1) {
      setCustomerDropdown(true);
      setCustomerData(
        matches.map((m) => ({
          id: m.customer_id,
          customer_name: m.customer_name,
        }))
      );
    }
  }, [passengerName, passengerData, setValue]);

  // Auto-fill destination logic
  useEffect(() => {
    if (!passengerName) {
      setFromDropdown(false);
      setToDropdown(false);
      setFilteredFromDestinations([]);
      setFilteredToDestinations([]);
      return;
    }

    const matches = passengerData.filter(
      (p) => p.name.toLowerCase() === passengerName.toLowerCase()
    );

    if (matches.length === 1) {
      setValue("from_destination", matches[0].from_destination || "");
      setValue("to_destination", matches[0].to_destination || "");
      setFromDropdown(false);
      setToDropdown(false);
    } else if (matches.length > 1) {
      const froms = [...new Set(matches.map((m) => m.from_destination))];
      const tos = [...new Set(matches.map((m) => m.to_destination))];

      if (froms.length === 1) {
        setValue("from_destination", froms[0]);
        setFromDropdown(false);
      } else if (froms.length > 1) {
        setFromDropdown(true);
        setFilteredFromDestinations(froms);
      }

      if (tos.length === 1) {
        setValue("to_destination", tos[0]);
        setToDropdown(false);
      } else if (tos.length > 1) {
        setToDropdown(true);
        setFilteredToDestinations(tos);
      }
    }
  }, [passengerName, passengerData, setValue]);

  // Add bookings manually
  const addBookings = async () => {
    setTableData([]);
    setIsTableVisible(true);
    if (
      passengerName &&
      customerName &&
      fromDate &&
      toDate &&
      fromDestination &&
      toDestination &&
      fromTime &&
      vehicleType
    ) {
      try {
        const res = await axios.get(
          "https://www.agnicarrental.com/agni_event_duty/bulk_id_generator.php"
        );
        const bulkId = res.data.bulk_id;

        const start = new Date(fromDate);
        const end = new Date(toDate);
        const tempTableData = [];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const currentDate = d.toISOString().split("T")[0];
          tempTableData.push({
            trip_type: "Passenger One Way",
            passenger_name: passengerName,
            customer_name: customerName,
            from_destination: fromDestination,
            to_destination: toDestination,
            from_date: currentDate,
            from_time: fromTime,
            vehicle_type: vehicleType,
            customer_fare: customerFare || 0,
            vendor_fare: vendorFare || 0,
            bulk_id: bulkId,
          });
        }

        setTableData((prev) => [...prev, ...tempTableData]);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const startEdit = (index) => {
    setEditingRowIndex(index);
    resetEditForm(tableData[index]);
  };

  const saveEdit = (updatedData) => {
    const updatedTable = [...tableData];
    updatedTable[editingRowIndex] = updatedData;
    setTableData(updatedTable);
    setEditingRowIndex(null);
  };

  const deleteRow = (index) => {
    const updatedTable = [...tableData];
    updatedTable.splice(index, 1);
    setTableData(updatedTable);
  };

  const saveAllBookings = async () => {
    console.log("Saving all bookings:", tableData);

    for (const booking of tableData) {
      try {
        booking.customer_id = custId;
        console.log("Booking data to be saved:", booking);

        const response = await axios.post(
          "https://www.agnicarrental.com/agni_event_duty/passenger_booking.php",
          booking,
          { headers: { "Content-Type": "application/json" } }
        );
        console.log(response.data);

        if (response.data.success) {
          alert("Booking confirmed!");
        }
      } catch (error) {
        console.error("Error saving booking:", error);
      }
    }
  };

  return (
    <div className="min-h-full w-full px-1 py-1 bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center">
      {/* Form */}
      {!isTableVisible && (
        <div className="w-full max-w-full bg-white shadow-2xl p-6 space-y-5 border border-blue-100">
          <h2 className="text-2xl flex justify-center items-center gap-2 font-bold text-blue-700 border-b pb-2 mb-4 text-center">
            <FaCarSide className="text-blue-600" /> Passenger One Way
          </h2>
          {/* Passenger */}
          <div className={`grid gap-5 ${customerDropdown ? "grid-cols-2" : "grid-cols-1"}`}>
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700 flex items-center gap-2">
                <FaUser className="text-blue-500" /> Passenger
              </label>
              <select
                {...register("passenger_name")}
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Select Passenger</option>
                {passengerData.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Dropdown */}
            {customerDropdown && (
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700 flex items-center gap-2">
                  <FaUser className="text-green-500" /> Customer
                </label>
                <select
                  className="border rounded-lg px-3 py-2"
                  onChange={(e) => {
                    const id = e.target.value;
                    const name = e.target.selectedOptions[0].text;
                    setCustId(id);
                    setValue("customer_name", name);
                  }}
                >
                  <option value="">Select Customer</option>
                  {customerData.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.customer_name}
                    </option>
                  ))}
                </select>
                <input type="hidden" {...register("customer_name")} />
              </div>
            )}
          </div>

          <div className=" grid gap-5 sm:grid-cols-4">
            {/* Dates */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700 flex items-center gap-2">
                <FaCalendarAlt className="text-blue-500" /> From Date
              </label>
              <input
                type="date"
                {...register("from_date")}
                min={new Date((Date.now() + 2 * 24 * 60 * 60 * 1000)).toISOString().split("T")[0]} // today

                className="border rounded-lg px-3 py-2 w-full"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700 flex items-center gap-2">
                <FaCalendarAlt className="text-red-500" /> To Date
              </label>
              <input
                min={new Date((Date.now() + 2 * 24 * 60 * 60 * 1000)).toISOString().split("T")[0]} // today

                type="date"
                {...register("to_date")}
                className="border rounded-lg px-3 py-2 w-full"
              />
            </div>

            {/* From Time + Vehicle */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700 flex items-center gap-2">
                <FaClock className="text-purple-500" /> From Time
              </label>
              <input
                type="time"
                {...register("from_time")}
                className="border rounded-lg px-3 py-2 w-full"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700 flex items-center gap-2">
                <FaCarSide className="text-orange-500" /> Vehicle Type
              </label>
              <select
                {...register("vehicle_type")}
                className="border rounded-lg px-3 py-2 w-full"
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((v, i) => (
                  <option key={i} value={v.vehicle_type_name}>
                    {v.vehicle_type_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Destinations */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                From Destination
              </label>
              {fromDropdown ? (
                <select
                  className="border rounded-lg px-3 py-2 w-full"
                  onChange={(e) => setValue("from_destination", e.target.value)}
                >
                  <option value="">Select From Destination</option>
                  {filteredFromDestinations.map((f, i) => (
                    <option key={i} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              ) : (
                <LocationInput
                  placeholder="Enter Pickup Location..."
                  onSelect={(address) => setValue("from_destination", address)}
                />
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                To Destination
              </label>
              {toDropdown ? (
                <select
                  className="border rounded-lg px-3 py-2 w-full"
                  onChange={(e) => setValue("to_destination", e.target.value)}
                >
                  <option value="">Select To Destination</option>
                  {filteredToDestinations.map((t, i) => (
                    <option key={i} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              ) : (
                <LocationInput
                  placeholder="Enter Drop Location..."
                  onSelect={(address) => setValue("to_destination", address)}
                />
              )}
            </div>

            {/* Fares */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700 flex items-center gap-2">
                💰 Customer Fare
              </label>
              <input
                {...register("customer_fare")}
                placeholder="Customer Fare"
                type="number"
                className="border rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700 flex items-center gap-2">
                💵 Vendor Fare
              </label>
              <input
                {...register("vendor_fare")}
                placeholder="Vendor Fare"
                type="number"
                className="border rounded-lg px-3 py-2"
              />
            </div>
          </div>



          <div className="flex justify-center">
            <button
              onClick={addBookings}
              className="px-4 py-2 max-sm:w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
            >
              Add Booking
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {tableData.length > 0 && isTableVisible && (
        <div className=" w-full max-w-full sm:max-w-full overflow-x-auto bg-white shadow-xl rounded-md p-2 sm:p-4 border border-blue-100">
          <table className="min-w-full text-xs sm:text-sm divide-y divide-gray-200">
            <thead className="bg-blue-50 max-sm:hidden border">
              <tr>
                {[
                  "Passenger",
                  "Customer",
                  "From",
                  "To",
                  "From Date",
                  "From Time",
                  "Vehicle",
                  "Customer Fare",
                  "Vendor Fare",
                  "Bulk ID",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-2 py-1 text-left font-semibold text-blue-700"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-50 transition-colors duration-150 border border-slate-300 
                 max-sm:grid max-sm:grid-cols-2 max-sm:gap-0 max-sm:rounded-lg max-sm:mb-3"
                >
                  {/* Passenger */}
                  <td className="px-2 py-2 border border-slate-300">
                    <span className="font-semibold text-slate-600 sm:hidden">Passenger: </span>
                    {row.passenger_name}
                  </td>

                  {/* Customer */}
                  <td className="px-2 py-2 border border-slate-300">
                    <span className="font-semibold text-slate-600 sm:hidden">Customer: </span>
                    {row.customer_name}
                  </td>

                  {/* From */}
                  <td className="px-2 py-2 border border-slate-300">
                    <span className="font-semibold text-slate-600 sm:hidden">From: </span>
                    {row.from_destination}
                  </td>

                  {/* To */}
                  <td className="px-2 py-2 border border-slate-300">
                    <span className="font-semibold text-slate-600 sm:hidden">To: </span>
                    {row.to_destination}
                  </td>

                  {/* Date */}
                  <td className="px-2 py-2 border border-slate-300">
                    <span className="font-semibold text-slate-600 sm:hidden">Date: </span>
                    {row.from_date}
                  </td>

                  {/* Time */}
                  <td className="px-2 py-2 border border-slate-300">
                    <span className="font-semibold text-slate-600 sm:hidden">Time: </span>
                    {row.from_time}
                  </td>

                  {/* Vehicle */}
                  <td className="px-2 py-2 border border-slate-300">
                    <span className="font-semibold text-slate-600 sm:hidden">Vehicle: </span>
                    {row.vehicle_type}
                  </td>

                  {/* Customer Fare */}
                  <td className="px-2 py-2 border border-slate-300 text-green-700 font-medium">
                    <span className="font-semibold text-slate-600 sm:hidden">Cust Fare: </span>
                    ₹{row.customer_fare}
                  </td>

                  {/* Vendor Fare */}
                  <td className="px-2 py-2 border border-slate-300 text-blue-700 font-medium">
                    <span className="font-semibold text-slate-600 sm:hidden">Vendor Fare: </span>
                    ₹{row.vendor_fare}
                  </td>

                  {/* Bulk ID */}
                  <td className="px-2 py-2 border border-slate-300">
                    <span className="font-semibold text-slate-600 sm:hidden">Bulk ID: </span>
                    {row.bulk_id}
                  </td>

                  {/* Actions */}
                  <td className="px-2 py-2 border border-slate-300 flex gap-2 max-sm:col-span-2 max-sm:justify-end">
                    <button
                      onClick={() => startEdit(index)}
                      className="px-3 py-2 max-sm:w-1/2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteRow(index)}
                      className="px-3 py-2 max-sm:w-1/2 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

          <div className="mt-4 flex justify-center">
            <button
              onClick={saveAllBookings}
              className="px-4 py-2 max-sm:w-full mb-4 mt-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow"
            >
              Save All Bookings
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRowIndex !== null && (
        <div className="fixed inset-0 w-full bg-black/80  flex items-center justify-center z-50">
          <form
            onSubmit={handleEditSubmit(saveEdit)}
            className="bg-white p-6 rounded-2xl gap-5 shadow-2xl w-4xl  space-y-3"
          >
            <h3 className="text-xl font-bold text-blue-700 mb-3">
              Edit Booking
            </h3>
            <div className="grid sm:grid-cols-2 gap-5">
              {/* Passenger Name */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Passenger Name</label>
                <input
                  {...editRegister("passenger_name")}
                  placeholder="Passenger Name"
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>

              {/* Customer Name */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Customer Name</label>
                <input
                  {...editRegister("customer_name")}
                  placeholder="Customer Name"
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>

              {/* From Destination */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">From Destination</label>
                <input
                  {...editRegister("from_destination")}
                  placeholder="From Destination"
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>

              {/* To Destination */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">To Destination</label>
                <input
                  {...editRegister("to_destination")}
                  placeholder="To Destination"
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>

              {/* From Date */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">From Date</label>
                <input
                  {...editRegister("from_date")}
                  placeholder="From Date"
                  type="date"
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>

              {/* From Time */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">From Time</label>
                <input
                  {...editRegister("from_time")}
                  placeholder="From Time"
                  type="time"
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>

              {/* Vehicle Type */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Vehicle Type</label>
                <input
                  {...editRegister("vehicle_type")}
                  placeholder="Vehicle Type"
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>

              {/* Customer Fare */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Customer Fare</label>
                <input
                  {...editRegister("customer_fare")}
                  placeholder="Customer Fare"
                  type="number"
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>

              {/* Vendor Fare */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Vendor Fare</label>
                <input
                  {...editRegister("vendor_fare")}
                  placeholder="Vendor Fare"
                  type="number"
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-center mt-5 mb-4 w-full gap-2">
              <button
                type="submit"
                className="bg-green-600 max-sm:w-1/2 w-1/3 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingRowIndex(null)}
                className="bg-gray-400 w-1/3 max-sm:w-1/2 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default PassengerBookingForm;
