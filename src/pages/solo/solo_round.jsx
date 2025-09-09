import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import {
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaCarSide,
  FaMapMarkerAlt,
  FaMoneyBill,
} from "react-icons/fa";
import LocationInput from "../other/gmap";

function Solo_round() {
  const [passengerData, setPassengerData] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [customer_id, setCustomer_id] = useState();
  const [customer_data, setCustomer_data] = useState([]);
  const [customer_drop, setCust_drop_down] = useState(false);
  const [bulkId, setBulkId] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const passengerRes = await axios.get(
          "https://www.agnicarrental.com/agni_event_duty/passenger_form.php"
        );
        setPassengerData(passengerRes.data || []);

        const vehicleRes = await axios.get(
          "https://www.agnicarrental.com/oluber/get_vehicle_types.php"
        );
        setVehicles(vehicleRes.data || []);

        const res = await axios.get(
          "https://www.agnicarrental.com/agni_event_duty/bulk_id_generator.php"
        );
        setBulkId(res.data.bulk_id);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data) => {

    try {
      data.customer_id = customer_id;
      data.trip_type = "Solo Round ";
      data.bulk_id = bulkId;

      const res = await axios.post(
        "https://www.agnicarrental.com/agni_event_duty/passenger_booking.php",
        data,
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.data.success) alert("Solo trip booked successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  async function Dropdown(data) {
    setCust_drop_down(false);
    try {
      const response = await axios.get(
        "https://www.agnicarrental.com/agni_event_duty/passenger_form.php",
        { params: { name: data.passenger_name } }
      );
      if (response.data.length > 1) {
        setCust_drop_down(true);
        setCustomer_data(
          response.data.map((item) => ({
            customer_id: item.customer_id,
            customer_name: item.customer_name,
          }))
        );
      } else {
        setCustomer_id(response.data[0].customer_id);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="min-h-full bg-blue-50 flex items-start justify-center p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl shadow-xl w-full max-w-6xl p-6 space-y-6 border border-blue-200"
      >
        <h2 className="text-2xl font-bold text-blue-700 border-b pb-2 text-center mb-4">
          Solo Round
        </h2>

        {/* All fields in one row using grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Passenger */}
          <div>
            <label className="font-semibold text-gray-700 flex items-center gap-2">
              <FaUser className="text-blue-500" /> Passenger
            </label>
            <select
              {...register("passenger_name", {
                required: "Select a passenger",
                onChange: (e) =>
                  Dropdown({ passenger_name: e.target.value }),
              })}
              className="mt-1 border rounded-lg px-3 py-2 w-full"
            >
              <option value="">Select Passenger</option>
              {passengerData.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.passenger_name && (
              <span className="text-red-500 text-xs">
                {errors.passenger_name.message}
              </span>
            )}
          </div>

                {/* Customer Dropdown */}
          {customer_drop && (
            <div>
              <label className="font-semibold text-gray-700 flex items-center gap-2">
                <FaUser className="text-green-500" /> Customer
              </label>
              <select
                className="border rounded-lg px-3 py-2 w-full"
                onChange={(e) => setCustomer_id(e.target.value)}
              >
                <option value="">Select Customer</option>
                {customer_data.map((c) => (
                  <option key={c.customer_id} value={c.customer_id}>
                    {c.customer_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Vehicle */}
          <div>
            <label className="font-semibold text-gray-700 flex items-center gap-2">
              <FaCarSide className="text-orange-500" /> Vehicle
            </label>
            <select
              {...register("vehicle_type", { required: "Select vehicle" })}
              className="mt-1 border rounded-lg px-3 py-2 w-full"
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((v, i) => (
                <option key={i} value={v.vehicle_type_name}>
                  {v.vehicle_type_name}
                </option>
              ))}
            </select>
            {errors.vehicle_type && (
              <span className="text-red-500 text-xs">
                {errors.vehicle_type.message}
              </span>
            )}
          </div>

    

          {/* Date */}
          <div>
            <label className="font-semibold text-gray-700 flex items-center gap-2">
              <FaCalendarAlt className="text-blue-500" /> Start Date
            </label>
            <input
              type="date"
              {...register("from_date", { required: "Select date" })}
              className="mt-1 border rounded-lg px-3 py-2 w-full"
              onChange={(e) => setValue("from_date", e.target.value)}
              min={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]}
            />
            {errors.from_date && (
              <span className="text-red-500 text-xs">
                {errors.from_date.message}
              </span>
            )}
          </div>


          {/* From Time */}
          <div>
            <label className="font-semibold text-gray-700 flex items-center gap-2">
              <FaClock className="text-purple-500" /> End Time
            </label>
            <input
              type="time"
              {...register("from_time")}
              className="border rounded-lg px-3 py-2 w-full"
            />
          </div>

          {/* From Location */}
          <div>
            <label className="font-semibold text-gray-700 flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-400" /> From
            </label>
            <LocationInput
              placeholder="Pickup Location"
              onSelect={(address) => setValue("from_destination", address)}
            />
          </div>

          {/* To Location */}
          <div>
            <label className="font-semibold text-gray-700 flex items-center gap-2">
              <FaMapMarkerAlt className="text-pink-400" /> To
            </label>
            <LocationInput
              placeholder="Drop Location"
              onSelect={(address) => setValue("to_destination", address)}
            />
          </div>
             {/* Extra Hr Charge */}
          <div>
            <label className="font-semibold text-gray-700 flex items-center gap-2">
              <FaMoneyBill className="text-indigo-500" /> Avg.KM 
            </label>
            <input
            
              type="number"
              {...register("average_km")}
              placeholder="₹ per Hr"
              min={300}
              defaultValue={300}
              className="mt-1 border rounded-lg px-3 py-2 w-full"
            />
          </div>

          {/* Extra KM Charge */}
          <div>
            <label className="font-semibold text-gray-700 flex items-center gap-2">
              <FaMoneyBill className="text-green-500" /> Per KM Charge
            </label>
            <input
              type="number"
              {...register("per_km_charge")}
              placeholder="₹ per KM"
              min="0"
              className="mt-1 border rounded-lg px-3 py-2 w-full"
            />
          </div>

       

          {/* Driver Allowance */}
          <div>
            <label className="font-semibold text-gray-700 flex items-center gap-2">
              <FaMoneyBill className="text-purple-500" /> Driver Allowance
            </label>
            <input
              type="number"
              {...register("driver_allowance")}
              placeholder="₹"
              min="0"
              className="mt-1 border rounded-lg px-3 py-2 w-full"
            />
          </div>


        </div>

        {/* Submit */}
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="px-6 py-2 max-sm:w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
          >
            Book Solo Trip
          </button>
        </div>
      </form>
    </div>
  );
}

export default Solo_round;
