import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { set, useForm } from "react-hook-form";
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

function Passenger_round() {
  const [passengerData, setPassengerData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [customerDropdown, setCustomerDropdown] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [custId, setCustId] = useState("");

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
  const average_km = watch("average_km");
  const per_km_charge = watch("per_km_charge");
  const extraKmCharge = watch("extra_km_charge");
  const extraHrCharge = watch("extra_hr_charge");
  const toDestination = watch("to_destination");
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
          setCustId(res.data[0].id);
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
            to_destination: toDestination,
            from_date: currentDate,
            from_time: fromTime,
            vehicle_type: vehicleType,
            average_km: average_km ? Number(average_km) : 0,
            per_km_charge: per_km_charge ? Number(per_km_charge) : 0,
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
          to_destination: "",
          from_time: "",
          vehicle_type: "",
          average_km: "",
          per_km_charge: "",
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
      booking.trip_type = "Passenger Round ";
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
    setTableData([]);
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

  return (
    <div className="min-h-full p-2  bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-full  mx-auto bg-white shadow-xl rounded-2xl px-4 py-4 border border-gray-200">
        <h2 className="text-2xl flex justify-center items-center gap-2 font-bold text-blue-700 border-b pb-2 mb-4 text-center">
          <FaCarSide className="text-blue-600" /> Passenger Round Model
        </h2>

        {/* Form Fields - Row Wise Layout */}
        <div className="space-y-3">
          {/* Passenger + Customer */}
          <div className={`grid grid-cols-1 ${customerDropdown ? "sm:grid-cols-2" : "sm:grid-cols-1"} gap-6`}>
            <div className="flex-1">
              <label className="font-medium text-gray-700 flex items-center gap-2">
                <FaUser className="text-blue-500" /> Passenger
              </label>
              <select
                {...register("passenger_name", {
                  required: true,
                  onChange: () => {
                    setCustomerDropdown(false);
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
          <div className="grid grid-cols-4 max-sm:grid-cols-2 gap-6">
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
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-gray-700 flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-500" /> Pickup Location
              </label>
              <LocationInput
                placeholder="Enter Pickup Location..."
                onSelect={(address) => setValue("from_destination", address)}
              />
            </div>
            <div>
              <label className="font-medium text-gray-700 flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-500" /> Drop Location
              </label>
              <LocationInput
                placeholder="Enter Drop Location..."
                onSelect={(address) => setValue("to_destination", address)}
              />
            </div>
          </div>

          {/* Charges Row 1 */}
          <div className="grid sm:grid-cols-4 gap-6">
            <div className="flex-1">
              <label className="font-medium text-gray-700 flex items-center gap-2">
                <FaClock className="text-orange-500" /> Avg.KM
              </label>
              <input
                min={300}
                defaultValue={300}
                {...register("average_km")}
                placeholder="Avg.KM"
                className="mt-1 border rounded-lg px-3 py-2 w-full"
              />
            </div>


            <div className="flex-1">
              <label className="font-medium text-gray-700 flex items-center gap-2">
                <FaRupeeSign className="text-green-600" /> per_km_charge 
              </label>
              <input
                {...register("per_km_charge")}
                placeholder="₹ per_km_charge"
                className="mt-1 border rounded-lg px-3 py-2 w-full"
              />
            </div>

            <div className="flex-1">
              <label className="font-medium text-gray-700 flex items-center gap-2">
                <FaUserTie className="text-gray-600" /> Driver Allowance
              </label>
              <input
                {...register("driver_allowance")}
                placeholder="₹ Dr.Allowance"
                className="mt-1 border rounded-lg px-3 py-2 w-full"
              />
            </div>
          </div>

          {/* Charges Row 2 */}




        </div>


        {/* Add Booking Btn */}
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={addBookings}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
          >
            ➕ Add Booking
          </button>
        </div>
      </div>

      {/* Table */}
      {tableData.length > 0 && (
        <div className="mt-10 max-w-6xl mx-auto bg-white shadow-xl  rounded overflow-hidden">
          <table className="w-full text-sm border rounded-2xl border-black">
            <thead className="bg-blue-600 text-white sticky top-0">
              <tr>
                {[
                  "Passenger",
                  "Cust-ID",
                  "Customer",
                  "From",
                  "To",
                  "Date",
                  "Time",
                  "Vehicle",
                  "Avg.KM",
                  "per_km_charge",
                  "Dr.Allow",
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
                  className={`border-t ${i % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-50`}
                >
                  <td className="px-3 py-2">{row.passenger_name}</td>
                  <td className="px-3 py-2">{row.customer_id}</td>
                  <td className="px-3 py-2">{row.customer_name}</td>
                  <td className="px-3 py-2">{row.from_destination}</td>
                  <td className="px-3 py-2">{row.to_destination}</td>
                  <td className="px-3 py-2">{row.from_date}</td>
                  <td className="px-3 py-2">{row.from_time}</td>
                  <td className="px-3 py-2">{row.vehicle_type}</td>
                  <td className="px-3 py-2">{row.average_km}</td>
                  <td className="px-3 py-2">{row.per_km_charge}</td>
                  <td className="px-3 py-2">{row.driver_allowance}</td>
                  <td className="px-3 py-2">{row.bulk_id}</td>
                  <td className="px-3 py-2 flex gap-2">
                    <button
                      onClick={() => startEdit(i)}
                      className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteRow(i)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs"
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
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow"
            >
              ✅ Save All Bookings
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRowIndex !== null && (
        <div className="fixed inset-0 w-full bg-black/80 flex justify-center items-center z-50">
          <form
            onSubmit={handleEditSubmit(saveEdit)}
            className="bg-white p-6 rounded-2xl shadow-2xl w-3xl space-y-3"
          >
            <h3 className="text-lg font-bold text-blue-600 mb-3">
              Edit Booking
            </h3>

            <div className="space-y-3 grid grid-cols-3 gap-5">
              {/* Passenger Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passenger Name
                </label>
                <input
                  {...editRegister("passenger_name")}
                  className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300"
                  placeholder="Passenger Name"
                />
              </div>

              {/* Customer ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer ID
                </label>
                <input
                  {...editRegister("customer_id")}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Customer ID"
                />
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  {...editRegister("customer_name")}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Customer Name"
                />
              </div>

              {/* From Destination */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Location
                </label>
                <input
                  {...editRegister("from_destination")}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Pickup Location"
                />
              </div>

              {/* From Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  {...editRegister("from_date")}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              {/* From Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  {...editRegister("from_time")}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type
                </label>
                <input
                  {...editRegister("vehicle_type")}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Vehicle Type"
                />
              </div>



              {/* Package Charge */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  per_km_charge Charge
                </label>
                <input
                  {...editRegister("per_km_charge")}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="per_km_charge Charge"
                />
              </div>




              {/* Driver Allowance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver Allowance
                </label>
                <input
                  {...editRegister("driver_allowance")}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Driver Allowance"
                />
              </div>

              {/* Bulk ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bulk ID
                </label>
                <input
                  {...editRegister("bulk_id")}
                  className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                  placeholder="Bulk ID"
                  readOnly
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex w-full gap-8 justify-center mt-4">
              <button
                type="button"
                onClick={() => setEditingRowIndex(null)}
                className="px-4 py-2 w-1/2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 w-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
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

export default Passenger_round;
