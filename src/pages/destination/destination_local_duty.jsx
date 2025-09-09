import { useEffect, useState } from "react";
import axios from "axios";
import { useForm, useFieldArray } from "react-hook-form";
import {
  FaUser,
  FaMapMarkerAlt,
} from "react-icons/fa";
import LocationInput from "../other/gmap";
import { BookingExtractor } from '../../File_Path/file_path';

function DestinationLocalForm() {
  const [passengerData, setPassengerData] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [customer_data, setCustomer_data] = useState([]);
  const [customer_id, setCustomer_id] = useState();
  const [bulkId, setBulkId] = useState(false);

  const [bookingData, setBookingData] = useState({

  });

  const { register, control, handleSubmit, setValue, reset, watch } = useForm({
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
          local_package_km: "",
          local_package_hr: "",
          local_package_charge: "",
          local_extra_km_charge: "",
          local_extra_hr_charge: "",
          local_driver_allowance: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "passengers",
  });

  // Fetch vehicles, customers, bulk ID
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehicleRes, customerRes, bulkRes] = await Promise.all([
          axios.get("https://www.agnicarrental.com/oluber/get_vehicle_types.php"),
          axios.get("https://www.agnicarrental.com/agni_event_duty/cust_com_form.php"),
          axios.get("https://www.agnicarrental.com/agni_event_duty/bulk_id_generator.php"),
        ]);
        setVehicles(vehicleRes.data);
        setCustomer_data(customerRes.data);
        setBulkId(bulkRes.data.bulk_id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Fetch passengers based on customer
  const fetchUserdata = async (id) => {
    try {
      const res = await axios.get("https://www.agnicarrental.com/agni_event_duty/passenger_form.php");
      setPassengerData(res.data.filter(item => item.customer_id === id));
    } catch (err) {
      console.error(err);
    }
  };

  // Whenever BookingExtractor updates bookingData, reset form
  useEffect(() => {
    if (bookingData) {
      console.log(bookingData);

      reset({
        from_destination: bookingData.from_destination || "",
        to_destination: bookingData.to_destination || "",
        passengers: [
          {
            passenger_name: bookingData.passenger_name || "",
            customer_id: customer_id || "",
            from_date: bookingData.from_date || "",
            from_time: bookingData.from_time || "",
            vehicle_type: bookingData.vehicle_type || "",
            local_package_km: bookingData.local_package_km || "",
            local_package_hr: bookingData.local_package_hr || "",
            local_package_charge: bookingData.local_package_charge || "",
            local_extra_km_charge: bookingData.local_extra_km_charge || "",
            local_extra_hr_charge: bookingData.local_extra_hr_charge || "",
            local_driver_allowance: bookingData.local_driver_allowance || "",
          },
        ],
      });
    }
  }, [bookingData, customer_id, reset]);

  const onSubmit = async (data) => {
    try {
      for (const passenger of data.passengers) {
        passenger.customer_id = customer_id;
        passenger.bulk_id = bulkId;
        passenger.trip_type = "Destination Local Model";
        passenger.from_destination = data.from_destination;
        passenger.to_destination = data.to_destination;

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
    <div className="min-h-full w-full bg-green-50 sm:px-20 py-4">

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-xl rounded-2xl w-full max-w-full px-8 space-y-1 border border-green-200"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-green-700 border-b pb-2 mt-4 mb-5 text-center">
          Destination Local Duty
        </h2>

        {/* Destinations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="font-semibold text-gray-700 flex items-center text-sm gap-2">
              <FaMapMarkerAlt className="text-blue-500" /> From Destination
            </span>
            <LocationInput
              placeholder="Pickup Location"
              onSelect={(addr) => setValue("from_destination", addr)}
              value={watch("from_destination")}
            />

          </div>

          <div className="flex flex-col">
            <span className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
              <FaMapMarkerAlt className="text-pink-500" /> To Destination
            </span>
            <LocationInput
              placeholder="Drop Location"
              onSelect={(addr) => setValue("to_destination", addr)}
              value={watch("to_destination")}
            />
          </div>
        </div>

        {/* Customer */}
        <div className="flex flex-col w-full mt-4">
          <span className="mb-1 font-medium text-sm text-gray-700 flex items-center gap-2">
            <FaUser className="text-green-500" /> Customer
          </span>
          <select
            className="border rounded-lg px-3 w-full py-1"
            value={customer_id || ""}
            onChange={(e) => {
              const id = e.target.value;
              setCustomer_id(id);
              fetchUserdata(id);
            }}
          >
            <option value="">Select Customer</option>
            {customer_data.map((c) => (
              <option key={c.id} value={c.id}>{c.cust_com_name}</option>
            ))}
          </select>
        </div>

        {/* Passengers */}
        {fields.map((field, index) => (
          <div key={field.id} className="grid sm:grid-cols-10 gap-4 items-center bg-green-50 px-4 py-6 mt-4 rounded-lg border border-green-700">
            <select {...register(`passengers.${index}.passenger_name`)} className="border rounded-lg px-2 py-1 text-gray-800">
              <option value="">Select</option>
              {passengerData.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>

            <input type="date" {...register(`passengers.${index}.from_date`)} className="border rounded-lg px-3 py-1" />
            <input type="time" {...register(`passengers.${index}.from_time`)} className="border rounded-lg px-3 py-1" />
            <select {...register(`passengers.${index}.vehicle_type`)} className="border rounded-lg px-2 py-1 text-gray-800">
              <option value="">Select</option>
              {vehicles.map((v, i) => <option key={i} value={v.vehicle_type_name}>{v.vehicle_type_name}</option>)}
            </select>

            <input type="number" {...register(`passengers.${index}.local_package_km`)} placeholder="Km" className="border rounded-lg px-2 py-1" />
            <input type="number" {...register(`passengers.${index}.local_package_hr`)} placeholder="Hr" className="border rounded-lg px-2 py-1" />
            <input type="number" {...register(`passengers.${index}.local_package_charge`)} placeholder="Charge" className="border rounded-lg px-2 py-1" />
            <input type="number" {...register(`passengers.${index}.local_extra_km_charge`)} placeholder="₹ extra KM" className="border rounded-lg px-2 py-1" />
            <input type="number" {...register(`passengers.${index}.local_extra_hr_charge`)} placeholder="₹ extra HR" className="border rounded-lg px-2 py-1" />
            <input type="number" {...register(`passengers.${index}.local_driver_allowance`)} placeholder="Allowance" className="border rounded-lg px-2 py-1" />

            {fields.length > 1 && (
              <button type="button" onClick={() => remove(index)} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg">
                Remove
              </button>
            )}
          </div>
        ))}

        {/* Add Passenger */}
        <div className="flex justify-start mt-4">
          <button type="button" onClick={() => append(fields[0])} className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            + Add Passenger
          </button>
        </div>

        {/* Submit */}
        <div className="flex justify-center mt-6 mb-6">
          <button type="submit" className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg">
            Save Local Booking
          </button>
        </div>
      </form>
    </div>
  );
}

export default DestinationLocalForm;
