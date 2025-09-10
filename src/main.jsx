import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import {Invoice,AuthGuard, Solo_round,Date_round,Destination_round,Passenger_round,Solo_local,Destination_local_duty,Date_Local_duty,Solo_booking,DashboardLayout,Destination_booking,Admin_dashboard,LoginPage,CustomerForm,PassengerForm,BookingPage,PassengerBookingForm,LocalDutyForm,LocationPicker,MultiPassengerForm} from './File_Path/file_path.js'
import BookingExtractor from './pages/other/data_extractor.jsx';
import WhatsAppExtractor from './pages/other/language.jsx';
import DocumentUploader from './pages/other/file_upload.jsx'
import FolderImageTable from './pages/other/show_images.jsx'
import DriverTable from './pages/other/user_details.jsx'


const router = createBrowserRouter(
  [
    {
      path: "/login",
      element: <LoginPage />
    },
    {
      element: <AuthGuard />, // protects everything inside
      children: [
        {
          path: "/",
          element: <DashboardLayout />,
          children: [
            { path: "", element: <Admin_dashboard /> },
            { path: "customer-form", element: <CustomerForm /> },
            { path: "passenger-form", element: <PassengerForm /> },
            { path: "booking-page", element: <BookingPage /> },
            { path: "passenger/one-way", element: <PassengerBookingForm /> },
            { path: "passenger/local-duty", element: <LocalDutyForm /> },
            { path: "date/one-way", element: <MultiPassengerForm /> },
            { path: "destination/one-way", element: <Destination_booking /> },
            { path: "solo/one-way", element: <Solo_booking /> },
            { path: "date/local-duty", element: <Date_Local_duty /> },
            { path: "destination/local-duty", element: <Destination_local_duty /> },
            { path: "solo/local-duty", element: <Solo_local /> },
            { path: "passenger/round-trip", element: <Passenger_round /> },
            { path: "date/round-trip", element: <Date_round /> },
            { path: "destination/round-trip", element: <Destination_round /> },
            { path: "solo/round-trip", element: <Solo_round /> },
            { path: "/whatsapp-booking", element: <BookingExtractor /> },
            { path: "/file-upload", element: <DocumentUploader /> },
            { path: "/car-details", element: <FolderImageTable /> },
            { path: "/driver-details", element: <DriverTable /> },






          ]
        },
        // 👇 top-level (but still behind AuthGuard)
    
  
      ]
    }
  ],
  {
    basename: "/admin_ed",
  }
);



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider  router={router}  />
  </StrictMode>,
)
