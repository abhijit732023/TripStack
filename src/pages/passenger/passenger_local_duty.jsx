import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Loader } from "@googlemaps/js-api-loader";
import {
  FaUser,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaCarSide,
  FaRoad,
  FaRupeeSign,
  FaUserTie,
} from "react-icons/fa";
import LocationInput from "../other/gmap";

function LocalDutyBookingForm() {
  const [passengerData, setPassengerData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [customerDropdown, setCustomerDropdown] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [custId, setCustId] = useState("");
  const [isTableVisible, setIsTableVisible] = useState(false);

  const inputRef = useRef(null);
  const { register, watch, setValue, reset } = useForm();
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
  const fromTime = watch("from_time");
  const vehicleType = watch("vehicle_type");
  const packageKm = watch("package_km");
  const packageHr = watch("package_hr");
  const packageCharge = watch("package_charge");
  const extraKmCharge = watch("extra_km_charge");
  const extraHrCharge = watch("extra_hr_charge");
  const driverAllowance = watch("driver_allowance");

  // ✅ Load Google Maps Autocomplete
  useEffect(() => {
    const loader = new Loader({
      apiKey: "YOUR_API_KEY_HERE",
      version: "weekly",
      libraries: ["places"],
    });

    loader.load().then(() => {
      if (inputRef.current) {
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          types: ["geocode"],
          componentRestrictions: { country: "in" },
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place.formatted_address) {
            setValue("from_destination", place.formatted_address);
          }
        });
      }
    });
  }, [setValue]);

  // ✅ Fetch passenger list
  useEffect(() => {
    axios
      .get("https://www.agnicarrental.com/agni_event_duty/passenger_form.php")
      .then((res) => setPassengerData(res.data))
      .catch((err) => console.error(err));
  }, []);

  // ✅ Fetch vehicle list
  useEffect(() => {
    axios
      .get("https://www.agnicarrental.com/oluber/get_vehicle_types.php")
      .then((res) => setVehicles(res.data))
      .catch((err) => console.error(err));
  }, []);

  // ✅ Autofill customer if passenger has mapping
  useEffect(() => {
    if (!passengerName) return;
    axios
      .get("https://www.agnicarrental.com/agni_event_duty/passenger_form.php", {
        params: { name: passengerName },
      })
      .then((res) => {
        if (res.data.length === 1) {
          setCustId(res.data[0].customer_id);
          setValue("customer_name", res.data[0].customer_name);
        } else if (res.data.length > 1) {
          setCustomerDropdown(true);
          setCustomerData(res.data);
        }
      })
      .catch((err) => console.error(err));
  }, [passengerName, setValue]);

  // ✅ Add bookings
  const addBookings = async () => {
    setTableData([]);
    setIsTableVisible(true);
    if (
      passengerName &&
      customerName &&
      fromDate &&
      toDate &&
      fromDestination &&
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
        const tempRows = [];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const currentDate = d.toISOString().split("T")[0];
          tempRows.push({
            trip_type: "Local Duty",
            passenger_name: passengerName,
            customer_id: custId,
            customer_name: customerName,
            from_destination: fromDestination,
            from_date: currentDate,
            from_time: fromTime,
            vehicle_type: vehicleType,
            package_km: packageKm ? Number(packageKm) : 0,
            package_hr: packageHr ? Number(packageHr) : 0,
            package_charge: packageCharge ? Number(packageCharge) : 0,
            extra_km_charge: extraKmCharge ? Number(extraKmCharge) : 0,
            extra_hr_charge: extraHrCharge ? Number(extraHrCharge) : 0,
            driver_allowance: driverAllowance ? Number(driverAllowance) : 0,
            bulk_id: bulkId,
          });
        }

        setTableData((prev) => [...prev, ...tempRows]);
        reset({
          from_date: "",
          to_date: "",
          from_destination: "",
          from_time: "",
          vehicle_type: "",
          package_km: "",
          package_hr: "",
          package_charge: "",
          extra_km_charge: "",
          extra_hr_charge: "",
          driver_allowance: "",
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const saveAllBookings = async () => {
    for (const booking of tableData) {
      booking.customer_id = custId;
      booking.trip_type = "Passenger Local Duty";
      try {
        await axios.post(
          "https://www.agnicarrental.com/agni_event_duty/passenger_booking.php",
          booking,
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (err) {
        console.error("Save error:", err);
      }
    }
    alert("Booking confirmed!");
    window.location.reload();
  };

  const startEdit = (i) => {
    setEditingRowIndex(i);
    resetEditForm(tableData[i]);
  };

  const saveEdit = (updated) => {
    const updatedRows = [...tableData];
    updatedRows[editingRowIndex] = updated;
    setTableData(updatedRows);
    setEditingRowIndex(null);
  };

  const deleteRow = (i) => {
    setTableData((prev) => prev.filter((_, idx) => idx !== i));
  };

  async function Dropdown(data) {
    setCustomerDropdown(false);
    try {
      const response = await axios.get(
        "https://www.agnicarrental.com/agni_event_duty/passenger_form.php",
        { params: { name: data.passenger_name } }
      );
      if (response.data.length > 1) {
        setCustomerDropdown(true);
        setCustomerData(
          response.data.map((item) => ({
            customer_id: item.customer_id,
            customer_name: item.customer_name,
          }))
        );
      } else {
        setCustId(response.data[0].customer_id);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="min-h-full px-1  py-1 bg-gradient-to-br from-blue-50 to-indigo-100">

      {
        !isTableVisible && (
          <div className="max-w-5xl  mx-auto bg-white shadow-xl rounded-2xl px-4 py-3 border border-gray-200">
            <h2 className="text-2xl max-sm:text-xl flex justify-center items-center gap-2  mt-5 font-bold text-blue-700 border-b pb-2 mb-4 text-center">
              Passenger Local Duty
            </h2>

            {/* Form Fields - Row Wise Layout */}
            <div className="space-y-3">
              {/* Passenger + Customer */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="font-medium text-gray-700 flex items-center gap-2">
                    <FaUser className="text-blue-500" /> Passenger
                  </label>
                  <select
                    {...register("passenger_name", {
                      required: true,
                      onChange: (e) => {
                        Dropdown({ passenger_name: e.target.value });
                      }
                    })}
                    className="mt-1 border rounded-lg px-3 py-2 w-full focus:ring focus:ring-blue-300"
                  >
                    <option value="">Select Passenger</option>
                    {passengerData.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {customerDropdown && (
                  <div className="flex-1">
                    <label className="font-medium text-gray-700 flex items-center gap-2">
                      <FaUserTie className="text-green-600" /> Customer
                    </label>
                    <select
                      className="mt-1 border rounded-lg px-3 py-2 w-full focus:ring focus:ring-green-300"
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

              {/* Dates Row */}
              <div className="grid sm:grid-cols-4 gap-6">
                <div className="flex-1">
                  <label className="font-medium text-gray-700 flex items-center gap-2">
                    <FaCalendarAlt className="text-indigo-500" /> Start Date
                  </label>
                  <input
                    type="date"
                    min={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]}
                    {...register("from_date")}
                    className="mt-1 border rounded-lg px-3 py-2 w-full focus:ring focus:ring-indigo-300"
                  />
                </div>
                <div className="flex-1">
                  <label className="font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    min={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]}
                    {...register("to_date")}
                    className="mt-1 border rounded-lg px-3 py-2 w-full focus:ring focus:ring-indigo-300"
                  />
                </div>
                <div className="flex-1">
                  <label className="font-medium text-gray-700 flex items-center gap-2">
                    <FaClock className="text-blue-500" /> Time
                  </label>
                  <input
                    type="time"
                    {...register("from_time")}

                    className="mt-1 border rounded-lg px-3 py-2 w-full focus:ring focus:ring-blue-300"
                  />
                </div>
                <div className="flex-1">
                  <label className="font-medium text-gray-700 flex items-center gap-2">
                    <FaCarSide className="text-green-500" /> Vehicle
                  </label>
                  <select
                    {...register("vehicle_type")}
                    className="mt-1 border rounded-lg px-3 py-2 w-full focus:ring focus:ring-green-300"
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map((v, i) => (
                      <option key={i} value={v.vehicle_type_name}>
                        {v.vehicle_type_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>


              {/* Destination */}
              <div>
                <label className="font-medium text-gray-700 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-500" /> Pickup Location
                </label>
                <LocationInput
                  placeholder="Enter Pickup Location..."
                  onSelect={(address) => setValue("from_destination", address)}
                />
              </div>

              {/* Charges Row 1 */}
              <div className="grid grid-cols-3 gap-6">
                <div className="flex-1">
                  <label className="font-medium text-sm text-gray-700 flex items-center gap-2">
                    <FaRoad className="text-purple-500" /> Pkg KM
                  </label>
                  <input
                    {...register("package_km")}
                    placeholder="KM"
                    className="mt-1 border rounded-lg px-3 py-2 w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="font-medium text-sm text-gray-700 flex items-center gap-2">
                    <FaClock className="text-orange-500" /> Pkg Hr
                  </label>
                  <input
                    {...register("package_hr")}
                    placeholder="Hours"
                    className="mt-1 border rounded-lg px-3 py-2 w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="font-medium text-xs  text-gray-700 flex items-center gap-2">
                    <FaRupeeSign className="text-green-600" /> Pkg Charge
                  </label>
                  <input
                    {...register("package_charge")}
                    placeholder="₹"
                    className="mt-1 border rounded-lg px-3 py-2 w-full"
                  />
                </div>
              </div>

              {/* Charges Row 2 */}
              <div className="grid grid-cols-3 gap-6">

                <div className="flex-1">
                  <label className="font-medium text-gray-700 flex text-sm items-center gap-2">
                    <FaRoad className="text-red-500" /> Extra KM
                  </label>
                  <input
                    {...register("extra_km_charge")}
                    placeholder="₹ per KM"
                    className="mt-1 border  rounded-lg px-3 py-2 w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="font-medium text-gray-700 text-sm flex items-center gap-2">
                    <FaClock className="text-blue-600 text-xs" /> Extra Hr
                  </label>
                  <input
                    {...register("extra_hr_charge")}
                    placeholder="₹ per Hr"
                    className="mt-1 border rounded-lg px-3 py-2 w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="font-medium text-gray-700 text-sm flex items-center gap-2">
                    <FaUserTie className="text-gray-600" /> Dr.Allow
                  </label>
                  <input
                    {...register("driver_allowance")}
                    placeholder="₹"
                    className="mt-1 border rounded-lg px-3 py-2 w-full"
                  />
                </div>
              </div>


            </div>


            {/* Add Booking Btn */}
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={addBookings}
                className="px-6 py-2 max-sm:w-full mb-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
              >
                ➕ Add Booking
              </button>
            </div>
          </div>
        )
      }
      {/* Table */}
      {tableData.length > 0 && (
        <div className="  mx-auto bg-blue-50 shadow-xl  rounded overflow-hidden">
          <table className="w-full text-sm border rounded-2xl border-black">
            <thead className="max-sm:hidden bg-blue-600 text-white sticky top-0">
              <tr>
                {[
                  "Passenger",
                  "Cust-ID",
                  "Customer",
                  "From",
                  "Date",
                  "Time",
                  "Vehicle",
                  "Pkg KM",
                  "Pkg Hr",
                  "Pkg Charge",
                  "Extra KM",
                  "Extra Hr",
                  "Allowance",
                  "Bulk ID",
                  "Action",
                ].map((h) => (
                  <th key={h} className="px-3 py-2 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr
                  key={i}
                  className={`border mt-5 border-blue-600 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-50 transition-colors duration-150
        max-sm:grid max-sm:grid-cols-2 max-sm:gap-0 max-sm:rounded-lg max-sm:mb-3`}
                >
                  {/* Passenger Name */}
                  <td className="px-3 py-2 border border-slate-300">
                    <span className="font-semibold text-slate-600 sm:hidden">Passenger: </span>
                    {row.passenger_name}
                  </td>

                  {/* Customer ID */}
                  <td className="px-3 py-2 border border-slate-300">
                    <span className="font-semibold text-slate-600 sm:hidden">Customer ID: </span>
                    {row.customer_id}
                  </td>

                  {/* Customer Name */}
                  <td className="px-3 py-2 border border-slate-300">
                    <span className="font-semibold text-slate-600 sm:hidden">Customer: </span>
                    {row.customer_name}
                  </td>

                  {/* From */}
                  <td className="px-3 py-2 border border-slate-300">
                    <span className="font-semibold text-slate-600 sm:hidden">From: </span>
                    {row.from_destination}
                  </td>

                  {/* Date */}
                  <td className="px-3 py-2 border border-slate-300">
                    <span className="font-semibold text-slate-600 sm:hidden">Date: </span>
                    {row.from_date}
                  </td>

                  {/* Time */}
                  <td className="px-3 py-2 border border-slate-300">
                    <span className="font-semibold text-slate-600 sm:hidden">Time: </span>
                    {row.from_time}
                  </td>

                  {/* Vehicle */}
                  <td className="px-3 py-2 border border-slate-300">
                    <span className="font-semibold text-slate-600 sm:hidden">Vehicle: </span>
                    {row.vehicle_type}
                  </td>

                  {/* Package KM */}
                  <td className="px-3 py-2 border border-slate-300">
                    <span className="font-semibold text-slate-600 sm:hidden">Pkg KM: </span>
                    {row.package_km}
                  </td>

                  {/* Package Hours */}
                  <td className="px-3 py-2 border border-slate-300">
                    <span className="font-semibold text-slate-600 sm:hidden">Pkg Hrs: </span>
                    {row.package_hr}
                  </td>

                  {/* Package Charge */}
                  <td className="px-3 py-2 border border-slate-300">
                    <span className="font-semibold text-slate-600 sm:hidden">Pkg Charge: </span>
                    {row.package_charge}
                  </td>

                  {/* Extra KM Charge */}
                  <td className="px-3 py-2 border border-slate-300">
                    <span className="font-semibold text-slate-600 sm:hidden">Extra KM: </span>
                    {row.extra_km_charge}
                  </td>

                  {/* Extra HR Charge */}
                  <td className="px-3 py-2 border border-slate-300">
                    <span className="font-semibold text-slate-600 sm:hidden">Extra Hrs: </span>
                    {row.extra_hr_charge}
                  </td>

                  {/* Driver Allowance */}
                  <td className="px-3 py-2 border border-slate-300">
                    <span className="font-semibold text-slate-600 sm:hidden">Driver Allowance: </span>
                    {row.driver_allowance}
                  </td>

                  {/* Bulk ID */}
                  <td className="px-3 py-2 border border-slate-300">
                    <span className="font-semibold text-slate-600 sm:hidden">Bulk ID: </span>
                    {row.bulk_id}
                  </td>

                  {/* Actions */}
                  <td className="px-3 max-sm:w-full py-2 border border-slate-300 flex gap-2 max-sm:col-span-2 max-sm:justify-end">
                    <button
                      onClick={() => startEdit(i)}
                      className="px-3 py-2 max-sm:w-1/2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteRow(i)}
                      className="px-3 py-2 max-sm:w-1/2 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>


          </table>
          <div className="flex justify-center py-4 bg-gray-50">
            <button
              onClick={saveAllBookings}
              className="px-6 py-2 max-sm:w-full mb-8 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow"
            >
              ✅ Save All Bookings
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRowIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <form
            onSubmit={handleEditSubmit(saveEdit)}
            className="bg-white p-6 rounded-2xl shadow-2xl w-96 space-y-3"
          >
            <h3 className="text-lg font-bold text-blue-600 mb-3">
              Edit Booking
            </h3>
            <input
              {...editRegister("passenger_name")}
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300"
              placeholder="Passenger Name"
            />
            <input
              {...editRegister("customer_id")}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Customer ID"
            />
            <input
              {...editRegister("customer_name")}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Customer Name"
            />
            <input
              {...editRegister("from_destination")}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Pickup Location"
            />
            <input
              type="date"
              {...editRegister("from_date")}
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="time"
              {...editRegister("from_time")}
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              {...editRegister("vehicle_type")}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Vehicle Type"
            />
            <input
              {...editRegister("package_km")}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Package KM"
            />
            <input
              {...editRegister("package_hr")}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Package Hr"
            />
            <input
              {...editRegister("package_charge")}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Package Charge"
            />
            <input
              {...editRegister("extra_km_charge")}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Extra KM Charge"
            />
            <input
              {...editRegister("extra_hr_charge")}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Extra Hr Charge"
            />
            <input
              {...editRegister("driver_allowance")}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Driver Allowance"
            />
            <input
              {...editRegister("bulk_id")}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Bulk ID"
              readOnly
            />

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setEditingRowIndex(null)}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default LocalDutyBookingForm;
