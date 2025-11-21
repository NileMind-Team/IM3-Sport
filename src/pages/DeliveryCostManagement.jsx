import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaChevronDown,
  FaSave,
  FaTimes,
  FaTruck,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";

export default function DeliveryCostManagement() {
  const navigate = useNavigate();
  const [deliveryAreas, setDeliveryAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isAdminOrRestaurantOrBranch, setIsAdminOrRestaurantOrBranch] =
    useState(false);

  const [formData, setFormData] = useState({
    areaName: "",
    deliveryCost: "",
    estimatedTime: "",
    isActive: true,
  });

  // Check user role from API endpoint using axios - Same as other pages
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

  // Sample data - In real app, this would come from API
  useEffect(() => {
    const sampleAreas = [
      {
        id: 1,
        areaName: "Downtown Cairo",
        deliveryCost: 25.0,
        estimatedTime: "25-35 mins",
        isActive: true,
        createdAt: new Date("2024-01-15").toISOString(),
      },
      {
        id: 2,
        areaName: "Zamalek",
        deliveryCost: 20.0,
        estimatedTime: "20-30 mins",
        isActive: true,
        createdAt: new Date("2024-01-16").toISOString(),
      },
      {
        id: 3,
        areaName: "Maadi",
        deliveryCost: 30.0,
        estimatedTime: "30-40 mins",
        isActive: true,
        createdAt: new Date("2024-01-17").toISOString(),
      },
      {
        id: 4,
        areaName: "Heliopolis",
        deliveryCost: 28.0,
        estimatedTime: "25-35 mins",
        isActive: false,
        createdAt: new Date("2024-01-18").toISOString(),
      },
      {
        id: 5,
        areaName: "Nasr City",
        deliveryCost: 22.0,
        estimatedTime: "20-30 mins",
        isActive: true,
        createdAt: new Date("2024-01-19").toISOString(),
      },
    ];

    setDeliveryAreas(sampleAreas);
    setFilteredAreas(sampleAreas);
  }, []);

  // Filter areas based on search term and filter
  useEffect(() => {
    let filtered = deliveryAreas;

    if (filter !== "all") {
      filtered = filtered.filter((area) =>
        filter === "active" ? area.isActive : !area.isActive
      );
    }

    if (searchTerm) {
      filtered = filtered.filter((area) =>
        area.areaName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAreas(filtered);
  }, [searchTerm, filter, deliveryAreas]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.areaName.trim() ||
      !formData.deliveryCost ||
      !formData.estimatedTime
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
        // Update existing area
        const res = await axiosInstance.put(
          `/api/DeliveryAreas/${editingId}`,
          formData
        );
        if (res.status === 200) {
          setDeliveryAreas(
            deliveryAreas.map((area) =>
              area.id === editingId ? { ...area, ...formData } : area
            )
          );
          Swal.fire({
            icon: "success",
            title: "Area Updated",
            text: "Delivery area has been updated successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } else {
        // Add new area
        const res = await axiosInstance.post("/api/DeliveryAreas", formData);
        if (res.status === 201) {
          const newArea = {
            ...formData,
            id: Date.now(),
            createdAt: new Date().toISOString(),
          };
          setDeliveryAreas([...deliveryAreas, newArea]);
          Swal.fire({
            icon: "success",
            title: "Area Added",
            text: "New delivery area has been added successfully.",
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
        text: err.response?.data?.message || "Failed to save delivery area.",
      });
    }
  };

  const handleEdit = (area) => {
    setFormData({
      areaName: area.areaName,
      deliveryCost: area.deliveryCost,
      estimatedTime: area.estimatedTime,
      isActive: area.isActive,
    });
    setEditingId(area.id);
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
          await axiosInstance.delete(`/api/DeliveryAreas/${id}`);
          setDeliveryAreas(deliveryAreas.filter((area) => area.id !== id));
          Swal.fire({
            title: "Deleted!",
            text: "Delivery area has been deleted.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete delivery area.",
          });
        }
      }
    });
  };

  const handleToggleActive = (id, e) => {
    e.stopPropagation();

    setDeliveryAreas(
      deliveryAreas.map((area) =>
        area.id === id ? { ...area, isActive: !area.isActive } : area
      )
    );

    Swal.fire({
      icon: "success",
      title: "Status Updated!",
      text: `Delivery area ${
        deliveryAreas.find((a) => a.id === id).isActive
          ? "deactivated"
          : "activated"
      }`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const resetForm = () => {
    setFormData({
      areaName: "",
      deliveryCost: "",
      estimatedTime: "",
      isActive: true,
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleAddNewArea = () => {
    setIsAdding(true);
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    return (
      formData.areaName.trim() !== "" &&
      formData.deliveryCost !== "" &&
      formData.estimatedTime.trim() !== ""
    );
  };

  const getStatusColor = (isActive) => {
    return isActive
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
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
                Delivery Cost Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Manage delivery areas and costs
              </p>
            </div>
          </div>
          <div className="text-right self-end sm:self-auto">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#E41E26]">
              {deliveryAreas.length} Areas
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
                placeholder="Search delivery areas..."
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
                      ? "All Areas"
                      : filter === "active"
                      ? "Active"
                      : "Inactive"}
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
                        { value: "all", label: "All Areas" },
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
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

              {/* Add New Area Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddNewArea}
                className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-5 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base whitespace-nowrap"
              >
                <FaPlus className="text-sm" />
                <span className="hidden sm:inline">Add Area</span>
                <span className="sm:hidden">Add</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {/* Areas List */}
          <div
            className={`space-y-3 sm:space-y-4 md:space-y-5 ${
              isAdding ? "xl:col-span-2" : "xl:col-span-3"
            }`}
          >
            <AnimatePresence>
              {filteredAreas.map((area, index) => (
                <motion.div
                  key={area.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 dark:bg-gray-800/90"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="p-2 sm:p-3 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl sm:rounded-2xl border border-[#FDB913]/30 dark:border-gray-500">
                          <FaMapMarkerAlt className="text-[#E41E26] dark:text-[#FDB913] text-lg sm:text-xl" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg sm:text-xl truncate">
                              {area.areaName}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                area.isActive
                              )} whitespace-nowrap`}
                            >
                              {area.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Created{" "}
                            {new Date(area.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700">
                          <FaMoneyBillWave className="text-green-600 dark:text-green-400 text-lg flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Delivery Cost
                            </p>
                            <p className="font-bold text-green-600 dark:text-green-400 text-lg">
                              EGP {area.deliveryCost.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700">
                          <FaTruck className="text-blue-600 dark:text-blue-400 text-lg flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Estimated Time
                            </p>
                            <p className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                              {area.estimatedTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col lg:flex-row gap-1 sm:gap-2 justify-end sm:justify-start">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleToggleActive(area.id, e)}
                        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 ${
                          area.isActive
                            ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300 dark:hover:bg-yellow-800"
                            : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-800"
                        } rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center`}
                      >
                        {area.isActive ? "Deactivate" : "Activate"}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(area)}
                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center"
                      >
                        <FaEdit className="text-xs sm:text-sm" />
                        <span className="whitespace-nowrap">Edit</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(area.id)}
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

            {filteredAreas.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 sm:py-10 md:py-12 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 dark:bg-gray-700/80 dark:border-gray-600"
              >
                <FaMapMarkerAlt className="mx-auto text-3xl sm:text-4xl md:text-5xl text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                  No delivery areas found
                </h3>
                <p className="text-gray-500 dark:text-gray-500 text-sm sm:text-base mb-4 sm:mb-6 max-w-xs sm:max-w-sm mx-auto">
                  {searchTerm || filter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Add your first delivery area to get started"}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddNewArea}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base mx-auto"
                >
                  <FaPlus className="text-xs sm:text-sm" />
                  <span>Add Your First Area</span>
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Add/Edit Area Form */}
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
                      {editingId ? "Edit Area" : "Add New Area"}
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
                    {/* Area Name */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        Area Name *
                      </label>
                      <div className="relative group">
                        <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                        <input
                          type="text"
                          name="areaName"
                          value={formData.areaName}
                          onChange={handleInputChange}
                          required
                          className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          placeholder="Enter area name"
                        />
                      </div>
                    </div>

                    {/* Delivery Cost */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        Delivery Cost (EGP) *
                      </label>
                      <div className="relative group">
                        <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                        <input
                          type="number"
                          name="deliveryCost"
                          value={formData.deliveryCost}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Estimated Time */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        Estimated Delivery Time *
                      </label>
                      <div className="relative group">
                        <FaTruck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                        <input
                          type="text"
                          name="estimatedTime"
                          value={formData.estimatedTime}
                          onChange={handleInputChange}
                          required
                          className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          placeholder="e.g., 25-35 mins"
                        />
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
                        Active (Available for delivery)
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
                        {editingId ? "Update" : "Save"}
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
