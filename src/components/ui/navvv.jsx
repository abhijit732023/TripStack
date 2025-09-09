import { Link, NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      {/* Works like Link */}
      <Link to="/about">About</Link>

      {/* Same as Link, but adds active styling */}
      <NavLink 
        to="/dashboard" 
        className={({ isActive }) => (isActive ? "text-blue-600" : "text-gray-600")}
      >
        Dashboard
      </NavLink>
    </nav>
  );
}
export default Navbar;