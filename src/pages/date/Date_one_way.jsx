import { useEffect, useState } from "react";
import axios from "axios";
import { useForm, useFieldArray } from "react-hook-form";
import { FaUser, FaClock, FaCalendarAlt, FaCarSide, FaMapMarkerAlt, FaMoneyBill } from "react-icons/fa";
import LocationInput from "../other/gmap";

function DateBasedBooking() {
  const [passengerData, setPassengerData] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [customer_id, setCustomer_id] = useState();
  const [customer_data, setCustomer_data] = useState([]);
  const [customer_drop, setCust_drop_down] = useState(false);
  const [bulkId, setBulkId] = useState(false);

  const [bookingData, setBookingData] = useState({
    from_date: "",
    passenger_name: "",
    customer_id: "",
    from_time: "",
    from_destination: "",
    to_destination: "",
    vehicle_type: "",
    customer_fare: "",
    vendor_fare: "",
  })

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      passengers: [
        {
          from_date: "",
          passenger_name: "",
          customer_id: "",
          from_time: "",
          from_destination: "",
          to_destination: "",
          vehicle_type: "",
          customer_fare: "",
          vendor_fare: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "passengers",
  });

  // Fetch passengers & vehicles
  useEffect(() => {
    const fetchData = async () => {
      try {

        const vehicleResponse = await axios.get("https://www.agnicarrental.com/oluber/get_vehicle_types.php");
        setVehicles(vehicleResponse.data);
        // console.log('vehicle data', vehicleResponse.data);

        const cutrespopnse = await axios.get("https://www.agnicarrental.com/agni_event_duty/cust_com_form.php");
        setCustomer_data(cutrespopnse.data);

        console.log('cust data', cutrespopnse.data);


        // setPassengerData(response.data.filter(p =>  ));
        const res = await axios.get(
          "https://www.agnicarrental.com/agni_event_duty/bulk_id_generator.php"
        );
        console.log('bulk id', res.data.bulk_id);
        setBulkId(res.data.bulk_id);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data) => {
    console.log("Booking Data:", data);
    // send data to backend
    try {
      for (const passenger of data.passengers) {
        passenger.from_date = data.from_date;
        passenger.customer_id = customer_id;
        passenger.bulk_id = bulkId;
        passenger.trip_type = 'Date One Way';
        console.log("Sending booking request for passenger:", passenger);

        const res = await axios.post(
          "https://www.agnicarrental.com/agni_event_duty/passenger_booking.php",
          passenger,
          { headers: { "Content-Type": "application/json" } }
        );
        ;
      }
      alert("Date model booking(s) saved successfully!");

    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserdata = async (id) => {
    console.log(id);


    try {
      const response = await axios.get("https://www.agnicarrental.com/agni_event_duty/passenger_form.php");
      console.log('passenger data', response.data);
      // setPassengerData(response.data);
      const userData = response.data.filter(item => item.customer_id === id);
      setPassengerData(userData);
      console.log('user data', userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }
  // async function Dropdown(data) {
  //   console.log('cust', data);
  //   setCust_drop_down(false);
  //   try {
  //     const response = await axios.get("https://www.agnicarrental.com/agni_event_duty/passenger_form.php", { params: { name: data.passenger_name } });
  //     console.log('cust', response.data);
  //     if (response.data.length > 1) {
  //       setCust_drop_down(true);
  //       console.log(true);
  //       setCustomer_data(response.data.map(item => {
  //         return {
  //           customer_id: item.customer_id,
  //           customer_name: item.customer_name,
  //         };
  //       }));

  //     } else {
  //       setCustomer_id(response.data[0].customer_id);
  //       //   setCustomer_data(response.data.map(item => {
  //       //   return {
  //       //     customer_id: item.customer_id,
  //       //     customer_name: item.customer_name,
  //       //   };
  //       // }));
  //     }

  //   } catch (error) {

  //   }

  // }

  return (
    <div className="min-h-full w-full bg-blue-50 sm:px-15 py-4 flex  items-start justify-center  hide-scrollbar">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-xl rounded-2xl w-full max-w-full px-8 space-y-1 border border-blue-200"
      >
        <h2 className="text-2xl font-bold text-blue-700 border-b pb-2 mb-4 text-center">
          Date One Way 
        </h2>

        {/* Part 1: Trip Date + Customer */}
        <div className="flex flex-col-2 sm:flex-row gap-4 items-center">
          <div className="w-1/2">
            <span className="flex items-center gap-2 font-semibold text-gray-700">
              <FaCalendarAlt className="text-blue-500" /> Trip Date
            </span>
            <input
              type="date"
              min={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]}
              {...register("from_date", { required: "Select a date" })}
              className="border w-full rounded-lg px-3 py-1 text-gray-800"
            />
            {errors.from_date && (
              <span className="text-red-500 text-sm">
                {errors.from_date.message}
              </span>
            )}
          </div>

          <div className="flex flex-col w-1/2">
            <span className="mb-1 font-medium text-gray-700 flex items-center gap-2">
              <FaUser className="text-green-500" /> Customer
            </span>
            <select
              className="border rounded-lg px-3 w-full py-1"
              onChange={(e) => {
                const id = e.target.value;
                fetchUserdata(id);
                setCustomer_id(id);
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
        </div>

        {/* Table Header */}
        <div className={`grid max-sm:hidden ${fields.length > 1 ? "grid-cols-8" : "grid-cols-7"} gap-4 font-semibold text-gray-700 text-center bg-blue-100 p-2 rounded-t-lg mt-6`}>
          <div>Passenger</div>
          <div>From Time</div>
          <div>From</div>
          <div>To</div>
          <div>Vehicle</div>
          <div>Customer Fare</div>
          <div>Vendor Fare</div>
          {fields.length > 1 && <div>Action</div>}
        </div>

        {/* Passenger Rows */}
        {fields.map((field, index) => (
          <div
            key={field.id}
            className={`grid grid-cols-1 ${fields.length > 1 ? "sm:grid-cols-8" : "sm:grid-cols-7"
              } gap-4 items-center bg-blue-50  max-sm:mt-5 rounded-lg border px-4 py-8 border-blue-200`}
          >
            {/* Passenger */}
            <select
              {...register(`passengers.${index}.passenger_name`, {
                required: "Select passenger",
              })}
              className="border rounded-lg px-2 py-1 text-gray-800"
              onChange={(e) => {
                setValue(`passengers.${index}.passenger_name`, e.target.value);
                setBookingData((prev) => ({ ...prev, passenger_name: e.target.value }));
              }}
            >
              <option value="">Select</option>
              {passengerData.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* From Time */}
            <input
              type="time"
              {...register(`passengers.${index}.from_time`, {
                required: "Select time",
              })}
              className="border rounded-lg px-3 py-1 w-full"
              onChange={(e) => {
                setValue(`passengers.${index}.from_time`, e.target.value);
                setBookingData((prev) => ({ ...prev, from_time: e.target.value }));
              }}
            />

            {/* From Destination */}
            <LocationInput
              placeholder="Pickup"
              onSelect={(address) => {
                setValue(`passengers.${index}.from_destination`, address);
                setBookingData((prev) => ({ ...prev, from_destination: address }));
              }}
            />

            {/* To Destination */}
            <LocationInput
              placeholder="Drop"
              onSelect={(address) => {
                setValue(`passengers.${index}.to_destination`, address);
                setBookingData((prev) => ({ ...prev, to_destination: address }));
              }}
            />

            {/* Vehicle */}
            <select
              {...register(`passengers.${index}.vehicle_type`, {
                required: "Select vehicle",
              })}
              className="border rounded-lg px-2 py-1 text-gray-800"
              onChange={(e) => {
                setValue(`passengers.${index}.vehicle_type`, e.target.value);
                setBookingData((prev) => ({ ...prev, vehicle_type: e.target.value }));
              }}
            >
              <option value="">Select</option>
              {vehicles.map((v, i) => (
                <option key={i} value={v.vehicle_type_name}>
                  {v.vehicle_type_name}
                </option>
              ))}
            </select>

            {/* Customer Fare */}
            <input
              type="number"
              {...register(`passengers.${index}.customer_fare`, {
                required: "Enter fare",
              })}
              className="border rounded-lg px-2 py-1 text-gray-800"
              placeholder="Fare"
              onChange={(e) => {
                setValue(`passengers.${index}.customer_fare`, e.target.value);
                setBookingData((prev) => ({ ...prev, customer_fare: e.target.value }));
              }}
            />

            {/* Vendor Fare */}
            <input
              type="number"
              {...register(`passengers.${index}.vendor_fare`)}
              className="border rounded-lg px-2 py-1 text-gray-800"
              placeholder="Fare"
              onChange={(e) => {
                setValue(`passengers.${index}.vendor_fare`, e.target.value);
                setBookingData((prev) => ({ ...prev, vendor_fare: e.target.value }));
              }}
            />

            {/* Remove Button */}
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

        {/* Add Passenger Button */}
        <div className="flex justify-start mt-4">
          <button
            type="button"
            onClick={() =>
              append({
                passenger_name: bookingData.passenger_name || "",
                customer_id: bookingData.customer_id || "",
                from_time: bookingData.from_time || "",
                from_destination: bookingData.from_destination || "",
                to_destination: bookingData.to_destination || "",
                vehicle_type: bookingData.vehicle_type || "",
                customer_fare: bookingData.customer_fare || "",
                vendor_fare: bookingData.vendor_fare || "",
              })
            }
            className="px-4 py-1 max-sm:w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
          >
            + Add Passenger
          </button>
        </div>

        {/* Submit */}
        <div className="mb-6 flex justify-center">
          <button
            type="submit"
            className="px-10 py-2.max-sm:w-full max-sm:mt-5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow"
          >
            Save Booking
          </button>
        </div>
      </form>

    </div>
  );
}

export default DateBasedBooking;
