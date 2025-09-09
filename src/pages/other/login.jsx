import React from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import axios from "axios";
import { Car, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        "https://www.agnicarrental.com/agni_event_duty/test.php",
        new URLSearchParams(data).toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      const res = response.data;
      console.log("Server Response:", res);

      if (res.status === "success") {
        // ✅ Store login details in localStorage
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", res.role);
        localStorage.setItem("email", data.email);

        alert("Login successful");
        window.location.href = "/"; // redirect to dashboard or home
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Something went wrong! Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-gray-100 overflow-hidden">
      {/* Animated cars on road */}
      <motion.div
        className="absolute bottom-10 left-0 flex gap-10"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
      >
        <Car className="w-12 h-12 text-blue-600" />
        <Car className="w-12 h-12 text-red-500" />
        <Car className="w-12 h-12 text-green-600" />
      </motion.div>

      {/* Login Box */}
      <div className="bg-white shadow-2xl m-6 rounded-2xl w-full max-w-md p-8 z-10">
        <div className="flex flex-col items-center mb-6">
          <Car className="w-12 h-12 text-blue-600 mb-2" />
          <h1 className="text-2xl font-bold text-gray-800">Car Rental Login</h1>
          <p className="text-gray-500">Sign in to manage your trips</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Mail className="w-5 h-5 text-gray-400 ml-3" />
            <input
              type="email"
              placeholder="Email"
              {...register("email", { required: "Email is required" })}
              className="flex-1 px-3 py-2 border-none focus:outline-none"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}

          {/* Password */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Lock className="w-5 h-5 text-gray-400 ml-3" />
            <input
              type="password"
              placeholder="Password"
              {...register("password", { required: "Password is required" })}
              className="flex-1 px-3 py-2 border-none focus:outline-none"
            />
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg mt-4"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-center">
          <a href="#" className="text-blue-600 text-sm hover:underline">
            Forgot Password?
          </a>
        </div>
      </div>

      {/* Decorative cars */}
      <motion.div
        className="absolute top-20 right-10 text-gray-200"
        initial={{ y: -20 }}
        animate={{ y: 20 }}
        transition={{ repeat: Infinity, duration: 3, repeatType: "reverse" }}
      >
        <Car className="w-20 h-20" />
      </motion.div>

      <motion.div
        className="absolute bottom-20 left-10 text-gray-200"
        initial={{ y: 20 }}
        animate={{ y: -20 }}
        transition={{ repeat: Infinity, duration: 4, repeatType: "reverse" }}
      >
        <Car className="w-16 h-16" />
      </motion.div>
    </div>
  );
}
