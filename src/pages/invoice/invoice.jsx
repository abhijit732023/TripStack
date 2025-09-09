import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import axios from "axios";
import logo from "../../image/logo.png";

export default function Invoice({ trip }) {
  if (!trip) return <div>No trip selected</div>;

  const [customerData, setCustomerData] = useState({});
  const componentRef = useRef();

  // ✅ Fetch Customer Data
  useEffect(() => {
    if (!trip.customer_id) return;
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `https://www.agnicarrental.com/agni_event_duty/cust_com_form.php`,
          { params: { customer_id: trip.customer_id } }
        );
        setCustomerData(data);
      } catch (err) {
        console.error("Error fetching customer data:", err);
      }
    };
    fetchData();
  }, [trip.customer_id]);

  // ✅ Print Invoice
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Invoice_${trip.bulk_id}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .no-print {
          display: none !important;
        }
      }
    `,
  });

  // ✅ Download PDF
  const handleDownloadPDF = async () => {
    const element = componentRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice_${trip.bulk_id}.pdf`);
  };

  // ✅ Extract GST
  const cgst = parseFloat(trip.cgst || 0);
  const sgst = parseFloat(trip.sgst || 0);

  // ✅ Charges Calculation
  let charges = [];
  let subtotal = 0;

  if (trip.trip_type?.includes("Local Duty")) {
    const pkg = parseFloat(trip.local_package_charge || 0);
    const extraKmCharge = parseFloat(trip.local_extra_km_charge || 0);
    const extraKm = Math.max(
      (parseFloat(trip.ending_km || 0) - parseFloat(trip.starting_km || 0)) -
        parseFloat(trip.local_package_km || 0),
      0
    );
    charges = [
      { label: "Package Charge", value: pkg, note: `${trip.local_package_km} KM / ${trip.local_package_hr} Hrs` },
      { label: "Extra KM Charge", value: extraKm * extraKmCharge, note: `${extraKm} KM × ₹${extraKmCharge}` },
      { label: "Driver Allowance", value: parseFloat(trip.local_driver_allowance || 0) },
      { label: "Toll Charges", value: parseFloat(trip.toll || 0) },
      { label: "Parking Charges", value: parseFloat(trip.parking || 0) },
      { label: "Permit Charges", value: parseFloat(trip.permit || 0) },
    ];
  } else if (trip.trip_type?.includes("One Way")) {
    charges = [
      { label: "Customer Fare", value: parseFloat(trip.one_way_cust_fare || trip.customer_fare || 0) },
      { label: "Toll Charges", value: parseFloat(trip.toll || 0) },
      { label: "Parking Charges", value: parseFloat(trip.parking || 0) },
      { label: "Permit Charges", value: parseFloat(trip.permit || 0) },
    ];
  } else if (trip.trip_type?.includes("Round")) {
    const avgKm = parseFloat(trip.average_km || 0);
    const perKmCharge = parseFloat(trip.per_km_charge || 0);
    charges = [
      { label: "Distance Fare", value: avgKm * perKmCharge, note: `${avgKm} KM × ₹${perKmCharge}` },
      { label: "Driver Allowance", value: parseFloat(trip.driver_allowance || 0) },
      { label: "Toll Charges", value: parseFloat(trip.toll || 0) },
      { label: "Parking Charges", value: parseFloat(trip.parking || 0) },
      { label: "Permit Charges", value: parseFloat(trip.permit || 0) },
    ];
  }

  subtotal = charges.reduce((sum, item) => sum + (item.value || 0), 0);
  const tax = subtotal * ((cgst + sgst) / 100);
  const total = subtotal + tax;

  return (
    <div className="p-6 bg-transparent">
      {/* Buttons (hidden when printing) */}
      <div className="flex justify-end mb-4 space-x-3 no-print">
        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
          Print PDF
        </button>
        <button
          onClick={handleDownloadPDF}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
        >
          Download PDF
        </button>
      </div>

      {/* Invoice */}
      <div
        ref={componentRef}
        className="bg-white shadow-lg max-w-3xl mx-auto border border-gray-300"
      >
        {/* Header */}
        <div className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center">
          <div>
            <img src={logo} alt="AGNI CAR." className="h-12" />
            <p className="text-xs ml-2">Mulund, West</p>
          </div>
          <div className="text-right">
            <p className="text-sm">Invoice #{trip.bulk_id}</p>
            <p className="text-sm">{trip.from_date}</p>
          </div>
        </div>

        {/* Bill To & Trip Info */}
        <div className="px-6 py-3 flex justify-between border-b">
          <div>
            <p className="text-gray-500">Bill To</p>
            <h2 className="text-md font-semibold">
              {(trip.customer_name || "").toUpperCase()}
            </h2>
            <h2 className="text-sm">{customerData.cust_com_address}</h2>
            <h2 className="text-sm">{customerData.cust_com_mobile_no}</h2>
            <h2 className="text-sm">{trip.cust_com_GST_no}</h2>
          </div>
          <div className="text-right text-sm">
            <p>
              <span className="text-xl font-semibold">{trip.passenger_name}</span>
            </p>
            <p>Trip Type: {trip.trip_type}</p>
            <p>Vehicle: {trip.vehicle_type}</p>
            <p>From: {trip.from_destination}</p>
            <p>To: {trip.to_destination || "N/A"}</p>
            <p>Date: {trip.from_date || "N/A"}</p>
            <p>Time: {trip.from_time}</p>
          </div>
        </div>

        {/* Charges Table */}
        <table className="w-[573px] h-[235px] text-sm border-b">
          <thead>
            <tr className="text-left text-gray-600 bg-gray-100">
              <th className="py-2 px-6">Description</th>
              <th className="py-2 px-6">Details</th>
              <th className="py-2 px-6 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {charges.map((item, idx) =>
              item.value > 0 ? (
                <tr key={idx} className="border-t">
                  <td className="px-6 py-2">{item.label}</td>
                  <td className="px-6 py-2 text-gray-500">{item.note || ""}</td>
                  <td className="px-6 py-2 text-right">
                    ₹ {item.value.toFixed(2)}
                  </td>
                </tr>
              ) : null
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div className="px-6 py-2 flex">
          <div className="w-full">
            <div className="flex justify-between py-1">
              <span>Subtotal</span>
              <span>₹ {subtotal.toFixed(2)}</span>
            </div>
            {cgst > 0 && (
              <div className="flex justify-between py-1">
                <span>CGST ({cgst}%)</span>
                <span>₹ {(subtotal * (cgst / 100)).toFixed(2)}</span>
              </div>
            )}
            {sgst > 0 && (
              <div className="flex justify-between py-1">
                <span>SGST ({sgst}%)</span>
                <span>₹ {(subtotal * (sgst / 100)).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg text-blue-600 border-t mt-2 pt-2">
              <span>Total</span>
              <span>₹ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 text-white px-6 py-3 flex justify-between text-sm">
          <div>
            <p>Bank / Paypal Info</p>
            <p>account@email.com</p>
            <p>Account Number: XXXX-XXXX-XXXX</p>
          </div>
          <div className="text-right">
            <p>Due By: {trip.from_date}</p>
            <p className="font-bold text-lg">₹ {total.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-gray-800 text-gray-300 p-4 text-center text-xs">
          Thank you for your business.
        </div>
      </div>
    </div>
  );
}
