import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUserCircle,
  FaChevronDown,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const isLoggedIn = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const links = [{ path: "/", label: "Home", icon: <FaHome /> }];

  const authLinks = [
    { path: "/login", label: "Sign In" },
    { path: "/register", label: "Create Account" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const handleAuthClick = (path) => {
    setIsDropdownOpen(false);
    navigate(path);
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate("/profile");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white/90 backdrop-blur-xl shadow-lg py-4 px-6 flex items-center justify-between sticky top-0 z-50 border-b border-[#E41E26]/20">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold">
          <Link
            to="/"
            className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] bg-clip-text text-transparent hover:scale-105 transition-transform duration-200"
          >
            Chicken One
          </Link>
        </h1>
      </motion.div>

      {/* Links */}
      <div className="flex items-center gap-8">
        <ul className="flex items-center gap-6">
          {links.map((link) => (
            <motion.li
              key={link.path}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={link.path}
                className={`flex items-center gap-2 font-medium transition-all duration-200 
                hover:text-[#E41E26] ${
                  location.pathname === link.path
                    ? "text-[#E41E26]"
                    : "text-gray-700"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            </motion.li>
          ))}
        </ul>

        {/* Auth Section */}
        <div className="relative" ref={dropdownRef}>
          {isLoggedIn ? (
            // User is logged in - Show user menu
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] px-4 py-2 rounded-xl border border-[#FDB913]/30">
                <FaUserCircle className="text-[#E41E26] text-lg" />
                <span className="text-gray-700 font-medium">
                  {userData.firstName || "User"}
                </span>
                <motion.div
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaChevronDown className="text-[#E41E26] text-sm" />
                </motion.div>
              </div>
            </motion.div>
          ) : (
            // User is not logged in - Show auth dropdown
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] px-6 py-2.5 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-[#E41E26]/25 transition-all duration-300">
                <span>Get Started</span>
                <motion.div
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaChevronDown className="text-white text-sm" />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-[#E41E26]/20 overflow-hidden z-50"
              >
                {isLoggedIn ? (
                  // User dropdown menu
                  <div className="p-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm text-gray-600">Welcome back!</p>
                      <p className="font-semibold text-gray-800">
                        {userData.firstName} {userData.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {userData.email}
                      </p>
                    </div>

                    {/* Profile Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        onClick={handleProfileClick}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] transition-all duration-200 font-medium rounded-lg"
                      >
                        <FaUser className="text-[#E41E26]" />
                        <span>My Profile</span>
                      </button>
                    </motion.div>

                    {/* Logout Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-[#E41E26] transition-all duration-200 font-medium rounded-lg"
                      >
                        <FaSignOutAlt className="text-[#E41E26]" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  </div>
                ) : (
                  // Auth dropdown menu
                  <div className="p-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm text-gray-600">Join Chicken One</p>
                      <p className="font-semibold text-gray-800">
                        Start your journey
                      </p>
                    </div>

                    {authLinks.map((link) => (
                      <motion.div
                        key={link.path}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <button
                          onClick={() => handleAuthClick(link.path)}
                          className={`w-full text-left flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] transition-all duration-200 font-medium rounded-lg ${
                            location.pathname === link.path
                              ? "bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] text-[#E41E26]"
                              : ""
                          }`}
                        >
                          <span>{link.label}</span>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
