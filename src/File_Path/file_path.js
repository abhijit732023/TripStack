import LoginPage from "../pages/other/login"
import Admin_dashboard from "../pages/other/admin_dashboard"
import CustomerForm from "../components/cust_com_form"
import PassengerForm from "../components/passenger_form"
import BookingPage from "../pages/other/booking_page"

import PassengerBookingForm from "../pages/passenger/passenger_one_way"
import LocalDutyForm from "../pages/passenger/passenger_local_duty"
import Passenger_round from "../pages/passenger/passenger_round"

import PassengerSelectionPage from "../pages/other/passenger_booking_selection"
import LocationPicker from "../pages/other/gmap"

import MultiPassengerForm from '../pages/date/Date_one_way'
import Date_Local_duty  from '../pages/date/Date_local_duty'
import Date_round from "../pages/date/Date_round"

import Destination_booking from "../pages/destination/destination_one_way"
import Destination_local_duty from '../pages/destination/destination_local_duty'
import Destination_round from "../pages/destination/Destination_round"

import Solo_booking from '../pages/solo/solo_one_way'
import Solo_local from '../pages/solo/solo_local_duty'
import Solo_round from "../pages/solo/solo_round"


import DashboardLayout from "../components/DashboardLayout"

import AuthGuard from "../components/authcheck"

import Invoice from "../pages/invoice/invoice"
import Navbar from "../components/ui/navvv"

import BookingExtractor from "../pages/other/data_extractor"
export {
  LoginPage,
  Admin_dashboard,
  CustomerForm,
  PassengerForm,
  BookingPage,
  PassengerBookingForm,
  PassengerSelectionPage,
  LocalDutyForm,
  LocationPicker,
  MultiPassengerForm,
  Destination_booking,
  Solo_booking,
  DashboardLayout,
  Date_Local_duty,
  Destination_local_duty,
  Solo_local,
  Passenger_round,
  Solo_round,
  Destination_round,
  Date_round,
  AuthGuard,
  Invoice,
  Navbar,
  BookingExtractor
}