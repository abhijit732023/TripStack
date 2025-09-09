import * as React from "react"

export const Input = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`flex h-10 w-full rounded-md  bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none  ${className}`}
      {...props}
    />
  )
})
Input.displayName = "Input"
