import { useEffect, useState } from "react";
import axios from "axios";
import { useForm, useFieldArray } from "react-hook-form";
import {
  FaUser,
  FaClock,
  FaCalendarAlt,
  FaCarSide,
  FaMapMarkerAlt,
  FaRoad,
  FaUserTie,
  FaRupeeSign,
} from "react-icons/fa";
import LocationInput from "../other/gmap";

function Destination_round() {
  const [passengerData, setPassengerData] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [customer_id, setCustomer_id] = useState();
  const [customer_data, setCustomer_data] = useState([]);
  const [bulkId, setBulkId] = useState(false);
  const [bookingData, setBookingData] = useState({
    passenger_name: "",
    customer_id: "",
    from_date: "",
    to_date: "",
    from_time: "",
    vehicle_type: "",
    average_km: "",
    per_km_charge: "",
    driver_allowance: "",
  })
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      from_destination: "",
      to_destination: "",
      passengers: [
        {
          passenger_name: "",
          customer_id: "",
          from_date: "",
          to_date: "",
          from_time: "",
          vehicle_type: "",
          average_km: "",
          per_km_charge: "",
          driver_allowance: "",
        },
      ],

    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "passengers",
  });

  // Fetch customers, vehicles, bulk id
  useEffect(() => {
    const fetchData = async () => {
      try {
        const vehicleResponse = await axios.get(
          "https://www.agnicarrental.com/oluber/get_vehicle_types.php"
        );
        setVehicles(vehicleResponse.data);

        const cutrespopnse = await axios.get(
          "https://www.agnicarrental.com/agni_event_duty/cust_com_form.php"
        );
        setCustomer_data(cutrespopnse.data);

        const res = await axios.get(
          "https://www.agnicarrental.com/agni_event_duty/bulk_id_generator.php"
        );
        setBulkId(res.data.bulk_id);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const fetchUserdata = async (id) => {
    try {
      const response = await axios.get(
        "https://www.agnicarrental.com/agni_event_duty/passenger_form.php"
      );
      const userData = response.data.filter(
        (item) => item.customer_id === id
      );
      setPassengerData(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const onSubmit = async (data) => {
    try {
      for (const passenger of data.passengers) {
        passenger.customer_id = customer_id;
        passenger.bulk_id = bulkId;
        passenger.trip_type = "Destination Round ";
        passenger.from_destination = data.from_destination;
        passenger.to_destination = data.to_destination;
        passenger.per_km_charge = data.per_km_charge;
        passenger.average_km = data.average_km;
        passenger.driver_allowance = data.driver_allowance;

        await axios.post(
          "https://www.agnicarrental.com/agni_event_duty/passenger_booking.php",
          passenger,
          { headers: { "Content-Type": "application/json" } }
        );
      }
      alert("Destination Local booking(s) saved successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-full w-full bg-green-50 flex justify-center sm:px-20 py-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-xl rounded-2xl mt-4 w-full max-w-full px-8 space-y-1 border border-green-200"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-green-700 border-b pb-2 mt-4 mb-5 text-center">
          Destination Round
        </h2>

        {/* Destinations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="font-semibold text-gray-700 flex items-center text-sm gap-2">
              <FaMapMarkerAlt className="text-blue-500" /> From Destination
            </span>
            <LocationInput
              placeholder="Pickup Location"
              onSelect={(address) => setValue(`from_destination`, address)}
            />
          </div>

          <div className="flex flex-col">
            <span className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
              <FaMapMarkerAlt className="text-pink-500" /> To Destination
            </span>
            <LocationInput
              placeholder="Drop Location"
              onSelect={(address) => setValue(`to_destination`, address)}
            />
          </div>
        </div>

        {/* Customer dropdown */}
        <div className="flex flex-col w-full mt-4">
          <span className="mb-1 font-medium text-sm text-gray-700 flex items-center gap-2">
            <FaUser className="text-green-500" /> Customer
          </span>
          <select
            className="border rounded-lg px-3 w-full py-1"
            onChange={(e) => {
              const id = e.target.value;
              setCustomer_id(id);
              fetchUserdata(id);
            }}
          >
            <option value="">Select Customer</option>
            {customer_data.map((c) => (
              <option key={c.id} value={c.id}>
                {c.cust_com_name}
              </option>
            ))}
          </select>
        </div>

        {/* Passengers list */}
        <div className={`grid max-sm:hidden ${fields.length > 1 ? 'sm:grid-cols-9' : 'sm:grid-cols-8'} gap-4 font-semibold text-gray-700 text-center bg-green-100 p-2 rounded-lg mt-6`}>
          <div>Passenger</div>
          <div>Start Date</div>
          <div>End Date</div>
          <div>Time</div>
          <div>Vehicle</div>
          <div>Avg Km</div>
          <div>Per Km</div>
          <div>Dr Allow.</div>
          {fields.length > 1 && <div>Action</div>}
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className={`grid max-sm:mt-4 ${fields.length > 1 ? "sm:grid-cols-9" : "sm:grid-cols-8"
              } gap-4 items-center bg-green-50 px-4 py-7 rounded-lg border border-green-700`}
          >
            {/* Passenger */}
            <select
              {...register(`passengers.${index}.passenger_name`, {
                required: "Select passenger",
              })}
              className="border rounded-lg px-2 py-1 text-gray-800"
              onChange={(e) => {
                setValue(`passengers.${index}.passenger_name`, e.target.value);
                setBookingData((prev) => ({
                  ...prev,
                  passenger_name: e.target.value,
                }));
              }}
            >
              <option value="">Select</option>
              {passengerData.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* From Date */}
            <input
              type="date"
              min={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]}
              {...register(`passengers.${index}.from_date`)}
              className="border rounded-lg px-3 py-1 text-gray-800 w-full"
              onChange={(e) => {
                setValue(`passengers.${index}.from_date`, e.target.value);
                setBookingData((prev) => ({
                  ...prev,
                  from_date: e.target.value,
                }));
              }}
            />
            <input
              type="date"
              min={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]}
              {...register(`passengers.${index}.to_date`)}
              className="border rounded-lg px-3 py-1 text-gray-800 w-full"
              onChange={(e) => {
                setValue(`passengers.${index}.to_date`, e.target.value);
                setBookingData((prev) => ({
                  ...prev,
                  to_date: e.target.value,
                }));
              }}
            />

            {/* From Time */}
            <input
              type="time"
              {...register(`passengers.${index}.from_time`)}
              className="border rounded-lg px-3 py-1 w-full"
              onChange={(e) => {
                setValue(`passengers.${index}.from_time`, e.target.value);
                setBookingData((prev) => ({
                  ...prev,
                  from_time: e.target.value,
                }));
              }}
            />

            {/* Vehicle */}
            <select
              {...register(`passengers.${index}.vehicle_type`)}
              className="border rounded-lg px-2 py-1 text-gray-800"
              onChange={(e) => {
                setValue(`passengers.${index}.vehicle_type`, e.target.value);
                setBookingData((prev) => ({
                  ...prev,
                  vehicle_type: e.target.value,
                }));
              }}
            >
              <option value="">Select</option>
              {vehicles.map((v, i) => (
                <option key={i} value={v.vehicle_type_name}>
                  {v.vehicle_type_name}
                </option>
              ))}
            </select>

            {/* Average KM */}
            <div className="flex-1">
              <input
                min={300}
                defaultValue={300}
                {...register("average_km")}
                placeholder="Average KM"
                className="mt-1 border rounded-lg px-3 py-2 w-full"
                onChange={(e) => {
                  setValue("average_km", e.target.value);
                  setBookingData((prev) => ({
                    ...prev,
                    average_km: e.target.value,
                  }));
                }}
              />
            </div>

            {/* Package Charge */}
            <div className="flex-1">
              <input
                {...register("per_km_charge")}
                placeholder="₹"
                className="mt-1 border rounded-lg px-3 py-2 w-full"
                onChange={(e) => {
                  setValue("per_km_charge", e.target.value);
                  setBookingData((prev) => ({
                    ...prev,
                    per_km_charge: e.target.value,
                  }));
                }}
              />
            </div>


            

            {/* Driver Allowance */}
            <div className="flex-1">
              <input
                {...register("driver_allowance")}
                placeholder="₹"
                className="mt-1 border rounded-lg px-3 py-2 w-full"
                onChange={(e) => {
                  setValue("driver_allowance", e.target.value);
                  setBookingData((prev) => ({
                    ...prev,
                    driver_allowance: e.target.value,
                  }));
                }}
              />
            </div>



            {/* Remove */}
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                Remove
              </button>
            )}
          </div>
        ))}



        {/* Add Passenger */}
        <div className="flex justify-start mt-4">
          <button
            type="button"
            onClick={() =>
              append({
                passenger_name: bookingData.passenger_name,
                customer_id: bookingData.customer_id,
                from_date: bookingData.from_date,
                to_date: bookingData.to_date,
                from_time: bookingData.from_time,
                vehicle_type: bookingData.vehicle_type,
                extra_km_charge: bookingData.extra_km_charge,
                average_km: bookingData.average_km,
                driver_allowance: bookingData.driver_allowance,
                package_charge: bookingData.package_charge,
              })
            }
            className="px-4 py-1 bg-blue-600 max-sm:w-full hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
          >
            + Add Passenger
          </button>
        </div>

        {/* Charges Section */}


        {/* Submit */}
        <div className="flex justify-center mb-6 mt-6">
          <button
            type="submit"
            className="px-8 py-2.5 bg-green-600 max-sm:w-full hover:bg-green-700 text-white font-semibold rounded-lg shadow"
          >
            Save Local Booking
          </button>
        </div>
      </form>
    </div>
  );
}

export default Destination_round;
