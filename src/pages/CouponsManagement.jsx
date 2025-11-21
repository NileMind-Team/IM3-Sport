import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaTag,
  FaPercentage,
  FaMoneyBillWave,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaChevronDown,
  FaSave,
  FaTimes,
  FaUsers,
  FaCalendarAlt,
  FaGift,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";

export default function CouponsManagement() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isAdminOrRestaurantOrBranch, setIsAdminOrRestaurantOrBranch] =
    useState(false);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage", // percentage or fixed
    discountValue: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    usageLimit: "",
    usedCount: 0,
    validFrom: "",
    validUntil: "",
    isActive: true,
    isBOGO: false,
    applicableItems: [], // For BOGO offers
  });

  // Check user role from API endpoint using axios
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAdminOrRestaurantOrBranch(false);
          setLoading(false);
          return;
        }

        const response = await axiosInstance.get("/api/Account/Profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const userData = response.data;
        const userRoles = userData.roles || [];

        const hasAdminOrRestaurantOrBranchRole =
          userRoles.includes("Admin") ||
          userRoles.includes("Restaurant") ||
          userRoles.includes("Branch");

        setIsAdminOrRestaurantOrBranch(hasAdminOrRestaurantOrBranchRole);

        if (!hasAdminOrRestaurantOrBranchRole) {
          navigate("/");
          return;
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsAdminOrRestaurantOrBranch(false);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [navigate]);

  // Sample data
  useEffect(() => {
    const sampleCoupons = [
      {
        id: 1,
        code: "WELCOME20",
        description: "Welcome discount for new customers",
        discountType: "percentage",
        discountValue: 20,
        minOrderAmount: 50,
        maxDiscountAmount: 30,
        usageLimit: 100,
        usedCount: 45,
        validFrom: "2024-01-01",
        validUntil: "2024-12-31",
        isActive: true,
        isBOGO: false,
        createdAt: new Date("2024-01-15").toISOString(),
      },
      {
        id: 2,
        code: "FREESHIP",
        description: "Free shipping on orders above EGP 100",
        discountType: "fixed",
        discountValue: 25,
        minOrderAmount: 100,
        maxDiscountAmount: 25,
        usageLimit: 200,
        usedCount: 89,
        validFrom: "2024-01-01",
        validUntil: "2024-06-30",
        isActive: true,
        isBOGO: false,
        createdAt: new Date("2024-01-16").toISOString(),
      },
      {
        id: 3,
        code: "BOGOCHICKEN",
        description: "Buy One Get One Free on Chicken Items",
        discountType: "percentage",
        discountValue: 100,
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        usageLimit: 50,
        usedCount: 23,
        validFrom: "2024-02-01",
        validUntil: "2024-02-29",
        isActive: true,
        isBOGO: true,
        applicableItems: ["Classic Fried Chicken", "Spicy Chicken Wings"],
        createdAt: new Date("2024-01-20").toISOString(),
      },
      {
        id: 4,
        code: "SUMMER15",
        description: "Summer special discount",
        discountType: "percentage",
        discountValue: 15,
        minOrderAmount: 30,
        maxDiscountAmount: 20,
        usageLimit: 150,
        usedCount: 150,
        validFrom: "2024-06-01",
        validUntil: "2024-08-31",
        isActive: false,
        isBOGO: false,
        createdAt: new Date("2024-01-18").toISOString(),
      },
    ];

    setCoupons(sampleCoupons);
    setFilteredCoupons(sampleCoupons);
  }, []);

  // Filter coupons based on search term and filter
  useEffect(() => {
    let filtered = coupons;

    if (filter !== "all") {
      if (filter === "active") {
        filtered = filtered.filter((coupon) => coupon.isActive);
      } else if (filter === "inactive") {
        filtered = filtered.filter((coupon) => !coupon.isActive);
      } else if (filter === "bogo") {
        filtered = filtered.filter((coupon) => coupon.isBOGO);
      } else if (filter === "expired") {
        filtered = filtered.filter(
          (coupon) => new Date(coupon.validUntil) < new Date()
        );
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (coupon) =>
          coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCoupons(filtered);
  }, [searchTerm, filter, coupons]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const generateCouponCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.code ||
      !formData.description ||
      !formData.discountValue ||
      !formData.validFrom ||
      !formData.validUntil
    ) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Please fill in all required fields",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      if (editingId) {
        // Update existing coupon
        const res = await axiosInstance.put(
          `/api/Coupons/${editingId}`,
          formData
        );
        if (res.status === 200) {
          setCoupons(
            coupons.map((coupon) =>
              coupon.id === editingId ? { ...coupon, ...formData } : coupon
            )
          );
          Swal.fire({
            icon: "success",
            title: "Coupon Updated",
            text: "Coupon has been updated successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } else {
        // Add new coupon
        const res = await axiosInstance.post("/api/Coupons", formData);
        if (res.status === 201) {
          const newCoupon = {
            ...formData,
            id: Date.now(),
            usedCount: 0,
            createdAt: new Date().toISOString(),
          };
          setCoupons([...coupons, newCoupon]);
          Swal.fire({
            icon: "success",
            title: "Coupon Added",
            text: "New coupon has been added successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      }

      resetForm();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to save coupon.",
      });
    }
  };

  const handleEdit = (coupon) => {
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || "",
      maxDiscountAmount: coupon.maxDiscountAmount || "",
      usageLimit: coupon.usageLimit,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil,
      isActive: coupon.isActive,
      isBOGO: coupon.isBOGO || false,
      applicableItems: coupon.applicableItems || [],
    });
    setEditingId(coupon.id);
    setIsAdding(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/Coupons/${id}`);
          setCoupons(coupons.filter((coupon) => coupon.id !== id));
          Swal.fire({
            title: "Deleted!",
            text: "Coupon has been deleted.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete coupon.",
          });
        }
      }
    });
  };

  const handleToggleActive = (id, e) => {
    e.stopPropagation();

    setCoupons(
      coupons.map((coupon) =>
        coupon.id === id ? { ...coupon, isActive: !coupon.isActive } : coupon
      )
    );

    Swal.fire({
      icon: "success",
      title: "Status Updated!",
      text: `Coupon ${
        coupons.find((c) => c.id === id).isActive ? "deactivated" : "activated"
      }`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minOrderAmount: "",
      maxDiscountAmount: "",
      usageLimit: "",
      usedCount: 0,
      validFrom: "",
      validUntil: "",
      isActive: true,
      isBOGO: false,
      applicableItems: [],
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleAddNewCoupon = () => {
    setIsAdding(true);
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    return (
      formData.code.trim() !== "" &&
      formData.description.trim() !== "" &&
      formData.discountValue !== "" &&
      formData.validFrom !== "" &&
      formData.validUntil !== "" &&
      formData.usageLimit !== ""
    );
  };

  const getStatusColor = (coupon) => {
    if (!coupon.isActive)
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    if (new Date(coupon.validUntil) < new Date())
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    if (coupon.usedCount >= coupon.usageLimit)
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
  };

  const getStatusText = (coupon) => {
    if (!coupon.isActive) return "Inactive";
    if (new Date(coupon.validUntil) < new Date()) return "Expired";
    if (coupon.usedCount >= coupon.usageLimit) return "Limit Reached";
    return "Active";
  };

  const getUsagePercentage = (coupon) => {
    return (coupon.usedCount / coupon.usageLimit) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  if (!isAdminOrRestaurantOrBranch) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-3 sm:px-4 py-4 sm:py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="bg-white/80 backdrop-blur-md rounded-full p-2 sm:p-3 text-[#E41E26] hover:bg-[#E41E26] hover:text-white transition-all duration-300 shadow-lg dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-[#E41E26]"
            >
              <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
                Coupons Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Create and manage discount coupons
              </p>
            </div>
          </div>
          <div className="text-right self-end sm:self-auto">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#E41E26]">
              {coupons.length} Coupons
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              in total
            </div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 mb-6 sm:mb-8 relative z-30 dark:bg-gray-800/90"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search coupons by code or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-black focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-48">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(openDropdown === "filter" ? null : "filter")
                  }
                  className="w-full flex items-center justify-between border border-gray-200 bg-white rounded-xl px-4 py-3 text-black focus:ring-2 focus:ring-[#E41E26] transition-all duration-200 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <span className="flex items-center gap-2">
                    <FaFilter className="text-[#E41E26]" />
                    {filter === "all"
                      ? "All Coupons"
                      : filter === "active"
                      ? "Active"
                      : filter === "inactive"
                      ? "Inactive"
                      : filter === "bogo"
                      ? "BOGO Offers"
                      : "Expired"}
                  </span>
                  <motion.div
                    animate={{ rotate: openDropdown === "filter" ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaChevronDown className="text-[#E41E26]" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openDropdown === "filter" && (
                    <motion.ul
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-50 mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto dark:bg-gray-700 dark:border-gray-600"
                    >
                      {[
                        { value: "all", label: "All Coupons" },
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
                        { value: "bogo", label: "BOGO Offers" },
                        { value: "expired", label: "Expired" },
                      ].map((item) => (
                        <li
                          key={item.value}
                          onClick={() => {
                            setFilter(item.value);
                            setOpenDropdown(null);
                          }}
                          className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] cursor-pointer text-gray-700 transition-all text-sm sm:text-base border-b border-gray-100 last:border-b-0 dark:hover:from-gray-600 dark:hover:to-gray-500 dark:text-gray-300 dark:border-gray-600"
                        >
                          {item.label}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              {/* Add New Coupon Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddNewCoupon}
                className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-5 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base whitespace-nowrap"
              >
                <FaPlus className="text-sm" />
                <span className="hidden sm:inline">Create Coupon</span>
                <span className="sm:hidden">Create</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {/* Coupons List */}
          <div
            className={`space-y-3 sm:space-y-4 md:space-y-5 ${
              isAdding ? "xl:col-span-2" : "xl:col-span-3"
            }`}
          >
            <AnimatePresence>
              {filteredCoupons.map((coupon, index) => (
                <motion.div
                  key={coupon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 dark:bg-gray-800/90"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="p-2 sm:p-3 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl sm:rounded-2xl border border-[#FDB913]/30 dark:border-gray-500">
                          {coupon.isBOGO ? (
                            <FaGift className="text-[#E41E26] dark:text-[#FDB913] text-lg sm:text-xl" />
                          ) : (
                            <FaTag className="text-[#E41E26] dark:text-[#FDB913] text-lg sm:text-xl" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg sm:text-xl truncate">
                              {coupon.code}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                coupon
                              )} whitespace-nowrap`}
                            >
                              {getStatusText(coupon)}
                            </span>
                            {coupon.isBOGO && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-xs font-semibold whitespace-nowrap">
                                BOGO
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm truncate">
                            {coupon.description}
                          </p>
                        </div>
                      </div>

                      {/* Discount Info */}
                      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-3">
                        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700">
                          {coupon.discountType === "percentage" ? (
                            <FaPercentage className="text-green-600 dark:text-green-400 text-lg flex-shrink-0" />
                          ) : (
                            <FaMoneyBillWave className="text-green-600 dark:text-green-400 text-lg flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Discount
                            </p>
                            <p className="font-bold text-green-600 dark:text-green-400 text-lg">
                              {coupon.discountType === "percentage"
                                ? `${coupon.discountValue}%`
                                : `EGP ${coupon.discountValue}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700">
                          <FaUsers className="text-blue-600 dark:text-blue-400 text-lg flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Usage
                            </p>
                            <p className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                              {coupon.usedCount}/{coupon.usageLimit}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-700">
                          <FaCalendarAlt className="text-orange-600 dark:text-orange-400 text-lg flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Valid Until
                            </p>
                            <p className="font-bold text-orange-600 dark:text-orange-400 text-sm">
                              {new Date(coupon.validUntil).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Usage Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>Usage Progress</span>
                          <span>{getUsagePercentage(coupon).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                getUsagePercentage(coupon),
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* BOGO Items */}
                      {coupon.isBOGO &&
                        coupon.applicableItems &&
                        coupon.applicableItems.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Applicable Items:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {coupon.applicableItems.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-xs"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Conditions */}
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {coupon.minOrderAmount > 0 &&
                          `Min order: EGP ${coupon.minOrderAmount} • `}
                        {coupon.maxDiscountAmount > 0 &&
                          `Max discount: EGP ${coupon.maxDiscountAmount}`}
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col lg:flex-row gap-1 sm:gap-2 justify-end sm:justify-start">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleToggleActive(coupon.id, e)}
                        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 ${
                          coupon.isActive
                            ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300 dark:hover:bg-yellow-800"
                            : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-800"
                        } rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center`}
                      >
                        {coupon.isActive ? "Deactivate" : "Activate"}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(coupon)}
                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center"
                      >
                        <FaEdit className="text-xs sm:text-sm" />
                        <span className="whitespace-nowrap">Edit</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(coupon.id)}
                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-800 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center"
                      >
                        <FaTrash className="text-xs sm:text-sm" />
                        <span className="whitespace-nowrap">Delete</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredCoupons.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 sm:py-10 md:py-12 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 dark:bg-gray-700/80 dark:border-gray-600"
              >
                <FaTag className="mx-auto text-3xl sm:text-4xl md:text-5xl text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                  No coupons found
                </h3>
                <p className="text-gray-500 dark:text-gray-500 text-sm sm:text-base mb-4 sm:mb-6 max-w-xs sm:max-w-sm mx-auto">
                  {searchTerm || filter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Create your first coupon to get started"}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddNewCoupon}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base mx-auto"
                >
                  <FaPlus className="text-xs sm:text-sm" />
                  <span>Create Your First Coupon</span>
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Add/Edit Coupon Form */}
          <AnimatePresence>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="xl:col-span-1"
              >
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-5 lg:p-6 border border-gray-200/50 dark:bg-gray-800/90 dark:border-gray-600 sticky top-4 sm:top-6 transition-colors duration-300">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">
                      {editingId ? "Edit Coupon" : "Create New Coupon"}
                    </h3>
                    <button
                      onClick={resetForm}
                      className="text-gray-500 hover:text-[#E41E26] dark:text-gray-400 dark:hover:text-[#FDB913] transition-colors duration-200 flex-shrink-0 ml-2"
                    >
                      <FaTimes size={16} className="sm:size-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-3 sm:space-y-4"
                  >
                    {/* Coupon Code */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        Coupon Code *
                      </label>
                      <div className="flex gap-2">
                        <div className="relative group flex-1">
                          <FaTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                          <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base uppercase"
                            placeholder="e.g., WELCOME20"
                          />
                        </div>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={generateCouponCode}
                          className="px-3 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 text-[#E41E26] dark:text-[#FDB913] rounded-lg sm:rounded-xl font-semibold border border-[#FDB913]/30 dark:border-gray-500 hover:shadow-lg transition-all duration-300 text-xs sm:text-sm whitespace-nowrap"
                        >
                          Generate
                        </motion.button>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows="2"
                        className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base resize-none"
                        placeholder="Describe the coupon purpose and terms..."
                      />
                    </div>

                    {/* Offer Type */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          Offer Type
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="isBOGO"
                              checked={!formData.isBOGO}
                              onChange={() =>
                                setFormData({ ...formData, isBOGO: false })
                              }
                              className="text-[#E41E26] focus:ring-[#E41E26]"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Discount
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="isBOGO"
                              checked={formData.isBOGO}
                              onChange={() =>
                                setFormData({ ...formData, isBOGO: true })
                              }
                              className="text-[#E41E26] focus:ring-[#E41E26]"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              BOGO Offer
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Discount Type */}
                      {!formData.isBOGO && (
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            Discount Type
                          </label>
                          <select
                            name="discountType"
                            value={formData.discountType}
                            onChange={handleInputChange}
                            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (EGP)</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Discount Value */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        {formData.isBOGO ? "BOGO Offer" : "Discount Value *"}
                      </label>
                      <div className="relative group">
                        {formData.isBOGO ? (
                          <FaGift className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm" />
                        ) : formData.discountType === "percentage" ? (
                          <FaPercentage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm" />
                        ) : (
                          <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm" />
                        )}
                        <input
                          type="number"
                          name="discountValue"
                          value={formData.discountValue}
                          onChange={handleInputChange}
                          required
                          min="0"
                          max={
                            formData.discountType === "percentage" ? "100" : ""
                          }
                          step={
                            formData.discountType === "percentage"
                              ? "1"
                              : "0.01"
                          }
                          className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          placeholder={
                            formData.isBOGO
                              ? "Buy One Get One Free"
                              : formData.discountType === "percentage"
                              ? "0-100"
                              : "0.00"
                          }
                        />
                      </div>
                      {formData.isBOGO && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          BOGO offers give 100% discount on the second item
                        </p>
                      )}
                    </div>

                    {/* Conditions */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          Min Order (EGP)
                        </label>
                        <input
                          type="number"
                          name="minOrderAmount"
                          value={formData.minOrderAmount}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          placeholder="0.00"
                        />
                      </div>
                      {!formData.isBOGO && (
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            Max Discount (EGP)
                          </label>
                          <input
                            type="number"
                            name="maxDiscountAmount"
                            value={formData.maxDiscountAmount}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            placeholder="0.00"
                          />
                        </div>
                      )}
                    </div>

                    {/* Usage Limit */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        Usage Limit *
                      </label>
                      <div className="relative group">
                        <FaUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm" />
                        <input
                          type="number"
                          name="usageLimit"
                          value={formData.usageLimit}
                          onChange={handleInputChange}
                          required
                          min="1"
                          className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          placeholder="Number of times coupon can be used"
                        />
                      </div>
                    </div>

                    {/* Validity Period */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          Valid From *
                        </label>
                        <div className="relative group">
                          <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm" />
                          <input
                            type="date"
                            name="validFrom"
                            value={formData.validFrom}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          Valid Until *
                        </label>
                        <div className="relative group">
                          <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm" />
                          <input
                            type="date"
                            name="validUntil"
                            value={formData.validUntil}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl border border-[#FDB913]/30 dark:border-gray-500">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#E41E26] bg-gray-100 border-gray-300 rounded focus:ring-[#E41E26] focus:ring-2"
                      />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Active (Available for use)
                      </label>
                    </div>

                    <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={resetForm}
                        className="flex-1 py-2.5 sm:py-3 border-2 border-[#E41E26] text-[#E41E26] rounded-lg sm:rounded-xl font-semibold hover:bg-[#E41E26] hover:text-white transition-all duration-300 text-sm sm:text-base"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!isFormValid()}
                        className={`flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-1 sm:gap-2 ${
                          isFormValid()
                            ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white hover:shadow-xl hover:shadow-[#E41E26]/25 cursor-pointer"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <FaSave className="text-xs sm:text-sm" />
                        {editingId ? "Update" : "Create"}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
