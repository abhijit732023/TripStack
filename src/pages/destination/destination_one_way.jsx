import { useEffect, useState } from "react";
import axios from "axios";
import { useForm, useFieldArray } from "react-hook-form";
import { FaUser, FaClock, FaCalendarAlt, FaCarSide, FaMapMarkerAlt, FaMoneyBill } from "react-icons/fa";
import LocationInput from "../other/gmap";

function DestinationBasedBooking() {
  const [passengerData, setPassengerData] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [customer_id, setCustomer_id] = useState();
  const [customer_data, setCustomer_data] = useState([]);
  const [customer_drop, setCust_drop_down] = useState(false);
  const [bulkId, setBulkId] = useState(false);

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      from_destination: "",
      to_destination: "",
      passengers: [
        {
          passenger_name: "",
          customer_id: "",
          from_date: "",
          from_time: "",
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

  const onSubmit = async (data) => {
    console.log("Booking Data:", data);
    try {
      for (const passenger of data.passengers) {
        passenger.customer_id = customer_id;
        console.log(customer_id);
        
        passenger.bulk_id = bulkId;
        passenger.trip_type = 'Destination One Way';
        passenger.from_destination = data.from_destination;
        passenger.to_destination = data.to_destination;


        const res = await axios.post(
          "https://www.agnicarrental.com/agni_event_duty/passenger_booking.php",
          passenger,
          { headers: { "Content-Type": "application/json" } }
        );
        console.log("Booking response:", res.data);


      }
      alert("Destination model booking(s) saved successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  // async function Dropdown(data) {
  //   setCust_drop_down(false);
  //   try {
  //     const response = await axios.get("https://www.agnicarrental.com/agni_event_duty/passenger_form.php", { params: { name: data.passenger_name } });
  //     if (response.data.length > 1) {
  //       setCust_drop_down(true);
  //       setCustomer_data(response.data.map(item => {
  //         return {
  //           customer_id: item.customer_id,
  //           customer_name: item.customer_name,
  //         };
  //       }));
  //     } else {
  //       setCustomer_id(response.data[0].customer_id);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  return (
    <div className="min-h-full w-full bg-green-50  flex justify-center sm:px-20 py-4">
   <form
  onSubmit={handleSubmit(onSubmit)}
  className="bg-white shadow-xl rounded-2xl w-full max-w-full px-8 space-y-1 border border-green-200"
>
  <h2 className="text-xl sm:text-2xl  font-bold text-green-700 border-b pb-2 mt-4 mb-5 text-center">
    Destination One Way
  </h2>

  {/* Part 1: Fixed Destinations */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm">
    <div className="flex flex-col">
      <span className="font-semibold text-gray-700 flex items-center text-sm gap-2">
        <FaMapMarkerAlt className="text-blue-500" /> From Destination
      </span>
      <LocationInput
        placeholder="Pickup Location"
        onSelect={(address) => setValue(`from_destination`, address)}
      />
      {errors.from_destination && (
        <span className="text-red-500 text-sm">
          From destination is required
        </span>
      )}
    </div>

    <div className="flex flex-col">
      <span className="font-semibold text-gray-700 text-sm flex items-center gap-2">
        <FaMapMarkerAlt className="text-pink-500" /> To Destination
      </span>
      <LocationInput
        placeholder="Drop Location"
        onSelect={(address) => setValue(`to_destination`, address)}
      />
      {errors.to_destination && (
        <span className="text-red-500 text-sm">To destination is required</span>
      )}
    </div>
  </div>

  <div className="flex flex-col w-full max-sm:mb-3">
    <span className="mb-1 font-medium text-sm text-gray-700 flex items-center gap-2">
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

  {/* Static Header for Passenger Details */}
  <div className={`grid max-sm:hidden  ${fields.length > 1 ? "sm:grid-cols-7" : "sm:grid-cols-6"} gap-4 font-semibold text-gray-700 text-center bg-green-100 p-2 rounded-lg mt-6`}>
    <div>Passenger</div>
    <div>Date</div>
    <div>Time</div>
    <div>Vehicle</div>
    <div>Customer Fare</div>
    <div>Vendor Fare</div>
   { fields.length > 1 && <div>Action</div>}
  </div>

  {/* Passenger Rows */}
  {fields.map((field, index) => (
    <div
      key={field.id}
      className={`grid ${fields.length > 1 ? "sm:grid-cols-7" : "sm:grid-cols-6"} gap-4 items-center  bg-green-50 px-4 py-6 mt-4 rounded-lg border border-green-700`}
    >
      {/* Passenger */}
      <select
        {...register(`passengers.${index}.passenger_name`, {
          required: "Select passenger",
          onChange: (e) =>
            Dropdown({ passenger_name: e.target.value }),
        })}
        className="border rounded-lg px-2 py-1 text-gray-800"
      >
        <option value="">Select</option>
        {passengerData.map((p) => (
          <option key={p.id} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Date */}
      <input
        type="date"
        min={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]}
        {...register(`passengers.${index}.from_date`, {
          required: "Select a date",
        })}
        className="border rounded-lg px-3 py-1 text-gray-800 w-full"
      />
      {errors.passengers?.[index]?.from_date && (
        <span className="text-red-500 text-sm">
          {errors.passengers[index].from_date.message}
        </span>
      )}

      {/* Time */}
      <input
        type="time"
        {...register(`passengers.${index}.from_time`, {
          required: "Select time",
        })}
        className="border rounded-lg px-3 py-1 w-full"
      />

      {/* Vehicle */}
      <select
        {...register(`passengers.${index}.vehicle_type`, {
          required: "Select vehicle",
        })}
        className="border rounded-lg px-2 py-1 text-gray-800"
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
      />

      {/* Vendor Fare */}
      <input
        type="number"
        {...register(`passengers.${index}.vendor_fare`)}
        className="border rounded-lg px-2 py-1 text-gray-800"
        placeholder="Fare"
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
  <div className="flex justify-start mt-4 mb-10">
    <button
      type="button"
      onClick={() =>
        append({
          passenger_name: "",
          customer_id: "",
          from_date: "",
          from_time: "",
          vehicle_type: "",
          customer_fare: "",
          vendor_fare: "",
        })
      }
      className="px-4 py-1 max-sm:w-full max-sm:mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
    >
      + Add Passenger
    </button>
  </div>

  {/* Submit Button */}
  <div className="flex justify-center mb-6">
    <button
      type="submit"
      className="px-8 py-2.5 max-sm:w-full max-sm:mt-1 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow"
    >
      Save Booking
    </button>
  </div>
</form>

    </div>
  );
}

export default DestinationBasedBooking;
