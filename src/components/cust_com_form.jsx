import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

export default function CustomerForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await axios.post(
        "https://www.agnicarrental.com/agni_event_duty/cust_com_form.php",
        data,
        { headers: { "Content-Type": "application/json" } }
      );
      alert("✅ Data saved successfully!");
      reset();
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      alert("Error saving data!");
    }
  };

  return (
    <div className="flex justify-center items-start min-h-auto bg-[url('https://img.freepik.com/free-vector/abstract-background-design_1048-6729.jpg')] bg-cover bg-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Title */}
        <h2 className="text-2xl font-bold text-center  text-gray-700">
          Customer Form
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Company Name */}
          <input
            type="text"
            {...register("cust_com_name", { required: "Company name is required" })}
            placeholder="Company Name"
            className={`px-4 py-3 rounded-lg w-full border focus:outline-none focus:ring-2 ${
              errors.cust_com_name
                ? "border-red-400 focus:ring-red-300"
                : "border-gray-300 focus:ring-teal-400"
            }`}
          />
          {errors.cust_com_name && (
            <p className="text-red-500 text-sm">{errors.cust_com_name.message}</p>
          )}

          {/* Address */}
          <input
            type="text"
            {...register("cust_com_address", { required: "Address is required" })}
            placeholder="Address"
            className={`px-4 py-3 rounded-lg w-full border focus:outline-none focus:ring-2 ${
              errors.cust_com_address
                ? "border-red-400 focus:ring-red-300"
                : "border-gray-300 focus:ring-teal-400"
            }`}
          />
          {errors.cust_com_address && (
            <p className="text-red-500 text-sm">{errors.cust_com_address.message}</p>
          )}

          {/* Pincode */}
          <input
            type="text"
            {...register("cust_com_pincode", {
              required: "Pincode is required",
              pattern: { value: /^[0-9]{6}$/, message: "Pincode must be 6 digits" },
            })}
            placeholder="Pincode"
            className={`px-4 py-3 rounded-lg w-full border focus:outline-none focus:ring-2 ${
              errors.cust_com_pincode
                ? "border-red-400 focus:ring-red-300"
                : "border-gray-300 focus:ring-teal-400"
            }`}
          />
          {errors.cust_com_pincode && (
            <p className="text-red-500 text-sm">{errors.cust_com_pincode.message}</p>
          )}

          {/* Mobile Number */}
          <input
            type="text"
            {...register("cust_com_mobile_no", {
              required: "Mobile number is required",
              pattern: { value: /^[0-9]{10}$/, message: "Mobile number must be 10 digits" },
            })}
            placeholder="Mobile Number"
            className={`px-4 py-3 rounded-lg w-full border focus:outline-none focus:ring-2 ${
              errors.cust_com_mobile_no
                ? "border-red-400 focus:ring-red-300"
                : "border-gray-300 focus:ring-teal-400"
            }`}
          />
          {errors.cust_com_mobile_no && (
            <p className="text-red-500 text-sm">{errors.cust_com_mobile_no.message}</p>
          )}

          {/* GST Number */}
          <input
            type="text"
            {...register("cust_com_GST_no", { required: "GST number is required" })}
            placeholder="GST Number"
            className={`px-4 py-3 rounded-lg w-full border focus:outline-none focus:ring-2 ${
              errors.cust_com_GST_no
                ? "border-red-400 focus:ring-red-300"
                : "border-gray-300 focus:ring-teal-400"
            }`}
          />
          {errors.cust_com_GST_no && (
            <p className="text-red-500 text-sm">{errors.cust_com_GST_no.message}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition text-lg mt-2"
          >
            {isSubmitting ? "Submitting..." : "Contact Us"}
          </button>
        </form>

        {/* Footer */}
      </div>
    </div>
  );
}
