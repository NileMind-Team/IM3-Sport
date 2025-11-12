import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email");
  const code = searchParams.get("code");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const passwordValidations = {
    length: newPassword.length >= 8,
    lowercase: /[a-z]/.test(newPassword),
    uppercase: /[A-Z]/.test(newPassword),
    specialChar: /[^A-Za-z0-9]/.test(newPassword),
    match: newPassword !== "" && newPassword === confirmPassword,
  };

  const allFieldsFilled =
    newPassword.trim() !== "" && confirmPassword.trim() !== "";
  const allPasswordValid = Object.values(passwordValidations).every(Boolean);
  const isFormValid = allFieldsFilled && allPasswordValid;

  const getValidationItem = (condition, label) => (
    <div className="flex items-center gap-2 text-sm">
      {condition ? (
        <FaCheckCircle className="text-green-500" />
      ) : (
        <FaTimesCircle className="text-gray-400" />
      )}
      <span className={condition ? "text-green-600" : "text-gray-500"}>
        {label}
      </span>
    </div>
  );

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      Swal.fire({
        icon: "error",
        title: "Password does not meet requirements",
        text: "Please make sure all password rules are satisfied",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post(
        "/api/Auth/ResetPassword",
        { email, code, newPassword },
        { headers: { "Content-Type": "application/json" } }
      );

      setMessage(
        res.data.message || "Your password has been reset successfully."
      );
      setSuccess(true);

      Swal.fire({
        icon: "success",
        title: "Password Reset Successful",
        text: res.data.message || "Your password has been reset successfully.",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "An error occurred while resetting your password.";
      setMessage(errorMsg);
      setSuccess(false);

      Swal.fire({
        icon: "error",
        title: "Password Reset Failed",
        text: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-2xl rounded-3xl p-6 w-full max-w-sm border border-blue-100"
      >
        {!loading && message ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-6">
            <div
              className={`rounded-full p-4 ${
                success ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {success ? (
                <svg
                  className="w-12 h-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-12 h-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {success ? "Password Reset Successful" : "Reset Failed"}
            </h2>
            <p className="text-gray-500 text-center">{message}</p>

            {success && (
              <button
                onClick={() => navigate("/login")}
                className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                Back to Login
              </button>
            )}
          </div>
        ) : (
          <>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-blue-700 text-center mb-6 font-rubik">
              Reset Password
            </h2>

            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New Password */}
              <div className="relative">
                <FaLock className="absolute left-3 top-3.5 text-blue-600 text-lg" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-blue-600 cursor-pointer transition-all duration-200"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <FaLock className="absolute left-3 top-3.5 text-blue-600 text-lg" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
                <div
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-blue-600 cursor-pointer transition-all duration-200"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>

              {/* Password Validation */}
              <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100 space-y-1">
                <p className="text-xs font-medium text-blue-700">
                  Password must include:
                </p>
                {Object.entries(passwordValidations).map(([key, val]) => {
                  const labels = {
                    length: "At least 8 characters",
                    lowercase: "One lowercase letter",
                    uppercase: "One uppercase letter",
                    specialChar: "One special character",
                    match: "Passwords match",
                  };
                  return getValidationItem(val, labels[key]);
                })}
              </div>

              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`w-full font-semibold py-2 rounded-lg transition-all duration-300 ${
                  isFormValid
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Reset Password
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
