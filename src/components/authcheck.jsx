import { Navigate, Outlet } from "react-router-dom";

export default function AuthGuard({ role = "admin" }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const storedRole = localStorage.getItem("role");

  if (!isLoggedIn || storedRole !== role) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // render children routes
}
