import * as React from "react"

export function Button({ className = "", variant = "default", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none px-4 py-2"

  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  }

  return (
    <button
      className={`${base} ${variants[variant] || ""} ${className}`}
      {...props}
    />
  )
}
