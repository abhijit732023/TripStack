import { useEffect, useRef } from "react";

export default function LocationInput({ value, onSelect, placeholder, showError }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode"],
      componentRestrictions: { country: "in" },
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place && place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        onSelect(place.formatted_address, lat, lng);
      }
    });
  }, [onSelect]);

  useEffect(() => {
    if (inputRef.current && value !== undefined) {
      inputRef.current.value = value;
    }
  }, [value]);

  return (
    <div className="w-full">
      <input
        type="text"
        ref={inputRef}
        placeholder={placeholder || "Select location"}
        className={`border px-2 py-1.5 rounded-md w-full ${showError ? "border-red-500" : ""}`}
      />
      {showError && (
        <p className="text-red-600 text-sm mt-1">
          Pickup location is empty. Please check the WhatsApp/Telegram message or select a location.
        </p>
      )}
    </div>
  );
}
