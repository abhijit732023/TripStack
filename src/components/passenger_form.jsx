import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { User, Phone, Home } from "lucide-react";

export default function PassengerForm() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustId, setSelectedCustId] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await axios.get(
          "https://www.agnicarrental.com/agni_event_duty/cust_com_form.php"
        );
        setCustomers(data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  const onSubmit = async (formData) => {
    formData.customer_id = selectedCustId;
    try {
      const { data } = await axios.post(
        "https://www.agnicarrental.com/agni_event_duty/passenger_form.php",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );
      alert(data.message || "✅ Passenger saved successfully!");
      reset();
      setSelectedCustId("");
    } catch (error) {
      console.error("❌ Error saving passenger:", error);
      alert("Error saving passenger data!");
    }
  };

  const inputClasses =
    "w-full pl-10 pr-4 py-2 rounded-lg bg-white/90 border border-blue-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-sm";

  return (
    <div className="min-h-auto flex items-center justify-center bg-gradient-to-br from-white via-sky-50 to-sky-100 p-6">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md p-6 border border-sky-200">
        {/* Title */}
        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-sky-400 to-sky-600 bg-clip-text text-transparent drop-shadow">
          Passenger Form
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-5 w-5 text-sky-500" />
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
              placeholder="Name"
              className={`${inputClasses} ${
                errors.name ? "ring-2 ring-red-400" : ""
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}

          {/* Phone */}
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-5 w-5 text-sky-500" />
            <input
              type="text"
              {...register("mobile_no", {
                required: "Mobile number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Mobile must be 10 digits",
                },
              })}
              placeholder="Phone Number"
              className={`${inputClasses} ${
                errors.mobile_no ? "ring-2 ring-red-400" : ""
              }`}
            />
          </div>
          {errors.mobile_no && (
            <p className="text-red-500 text-sm">{errors.mobile_no.message}</p>
          )}

          {/* Address */}
          <div className="relative">
            <Home className="absolute left-3 top-2.5 h-5 w-5 text-sky-500" />
            <textarea
              {...register("address", { required: "Address is required" })}
              placeholder="Address"
              rows={2}
              className={`${inputClasses} resize-none ${
                errors.address ? "ring-2 ring-red-400" : ""
              }`}
            />
          </div>
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address.message}</p>
          )}

          {/* Customer Dropdown */}
          <div className="relative">
            <select
              {...register("customer_name", {
                required: "Customer is required",
              })}
              value={
                customers.find((c) => c.id === selectedCustId)?.cust_com_name ||
                ""
              }
              onChange={(e) => {
                const selected = customers.find(
                  (c) => c.cust_com_name === e.target.value
                );
                setSelectedCustId(selected?.id || "");
              }}
              className={`${inputClasses} appearance-none ${
                errors.customer_name ? "ring-2 ring-red-400" : ""
              }`}
            >
              <option value="" disabled>
                Select Customer
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.cust_com_name}>
                  {c.cust_com_name}
                </option>
              ))}
            </select>
          </div>
          {errors.customer_name && (
            <p className="text-red-500 text-sm">
              {errors.customer_name.message}
            </p>
          )}

          {/* Buttons */}
          <div className="flex justify-between mt-6 gap-3">
            <button
              type="button"
              className="flex-1 py-2 rounded-lg border border-sky-400 text-sky-500 hover:bg-sky-50 transition shadow-sm"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 rounded-lg bg-gradient-to-r from-sky-400 to-sky-500 text-white font-semibold hover:from-sky-500 hover:to-sky-600 transition disabled:opacity-50 shadow-lg shadow-sky-200/80"
            >
              {isSubmitting ? "Saving..." : "Proceed"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
