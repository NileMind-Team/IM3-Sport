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
  FaChevronDown,
  FaSave,
  FaTimes,
  FaTruck,
  FaBuilding,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";

export default function DeliveryCostManagement() {
  const navigate = useNavigate();
  const [deliveryAreas, setDeliveryAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [filter, setFilter] = useState("all");
  const [formBranchesDropdownOpen, setFormBranchesDropdownOpen] =
    useState(false);
  const [isAdminOrRestaurantOrBranch, setIsAdminOrRestaurantOrBranch] =
    useState(false);

  const [formData, setFormData] = useState({
    branchId: "",
    areaName: "",
    fee: "",
    estimatedTimeMin: "",
    estimatedTimeMax: "",
    isActive: true,
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
      }
    };

    checkUserRole();
  }, [navigate]);

  // Fetch branches and delivery areas in one effect
  useEffect(() => {
    const fetchData = async () => {
      if (!isAdminOrRestaurantOrBranch) return;

      try {
        setLoading(true);

        // Fetch branches
        const branchesResponse = await axiosInstance.get(
          "/api/Branches/GetAll"
        );
        setBranches(branchesResponse.data);

        // Fetch delivery areas
        const areasResponse = await axiosInstance.get(
          "/api/DeliveryFees/GetAll"
        );

        // Transform API response to match our frontend structure
        const transformedAreas = areasResponse.data.map((area) => ({
          id: area.id,
          areaName: area.areaName,
          deliveryCost: area.fee,
          estimatedTime: `${area.estimatedTimeMin}-${area.estimatedTimeMax} دقائق`,
          estimatedTimeMin: area.estimatedTimeMin,
          estimatedTimeMax: area.estimatedTimeMax,
          isActive: area.isActive,
          branchId: area.branchId,
          branchName:
            branchesResponse.data.find((branch) => branch.id === area.branchId)
              ?.name || "فرع غير معروف",
          createdAt: area.createdAt || new Date().toISOString(),
        }));

        setDeliveryAreas(transformedAreas);
        setFilteredAreas(transformedAreas);
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في تحميل البيانات",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdminOrRestaurantOrBranch]);

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
      !formData.branchId ||
      !formData.areaName.trim() ||
      !formData.fee ||
      !formData.estimatedTimeMin ||
      !formData.estimatedTimeMax
    ) {
      Swal.fire({
        icon: "error",
        title: "معلومات ناقصة",
        text: "يرجى ملء جميع الحقول المطلوبة",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      const requestData = {
        branchId: parseInt(formData.branchId),
        areaName: formData.areaName,
        fee: parseFloat(formData.fee),
        estimatedTimeMin: parseInt(formData.estimatedTimeMin),
        estimatedTimeMax: parseInt(formData.estimatedTimeMax),
        isActive: formData.isActive, // إضافة حقل isActive هنا
      };

      if (editingId) {
        // Update existing area
        const res = await axiosInstance.put(
          `/api/DeliveryFees/Update/${editingId}`,
          requestData
        );
        if (res.status === 200 || res.status === 204) {
          await fetchDeliveryAreas();
          Swal.fire({
            icon: "success",
            title: "تم التحديث",
            text: "تم تحديث منطقة التوصيل بنجاح",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } else {
        // Add new area
        const res = await axiosInstance.post(
          "/api/DeliveryFees/Add",
          requestData
        );
        if (res.status === 200 || res.status === 201) {
          await fetchDeliveryAreas();
          Swal.fire({
            icon: "success",
            title: "تم الإضافة",
            text: "تم إضافة منطقة توصيل جديدة بنجاح",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      }

      resetForm();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: err.response?.data?.message || "فشل في حفظ منطقة التوصيل",
      });
    }
  };

  // Function to refetch delivery areas
  const fetchDeliveryAreas = async () => {
    try {
      const response = await axiosInstance.get("/api/DeliveryFees/GetAll");

      const transformedAreas = response.data.map((area) => ({
        id: area.id,
        areaName: area.areaName,
        deliveryCost: area.fee,
        estimatedTime: `${area.estimatedTimeMin}-${area.estimatedTimeMax} دقائق`,
        estimatedTimeMin: area.estimatedTimeMin,
        estimatedTimeMax: area.estimatedTimeMax,
        isActive: area.isActive,
        branchId: area.branchId,
        branchName:
          branches.find((branch) => branch.id === area.branchId)?.name ||
          "فرع غير معروف",
        createdAt: area.createdAt || new Date().toISOString(),
      }));

      setDeliveryAreas(transformedAreas);
      setFilteredAreas(transformedAreas);
    } catch (error) {
      console.error("Error fetching delivery areas:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحميل مناطق التوصيل",
      });
    }
  };

  const handleEdit = (area) => {
    setFormData({
      branchId: area.branchId?.toString() || "",
      areaName: area.areaName,
      fee: area.deliveryCost?.toString() || "",
      estimatedTimeMin: area.estimatedTimeMin?.toString() || "",
      estimatedTimeMax: area.estimatedTimeMax?.toString() || "",
      isActive: area.isActive, // تعيين القيمة الصحيحة من البيانات الحالية
    });
    setEditingId(area.id);
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، احذف!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/DeliveryFees/Delete/${id}`);
          await fetchDeliveryAreas();
          Swal.fire({
            title: "تم الحذف!",
            text: "تم حذف منطقة التوصيل",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "فشل في حذف منطقة التوصيل",
          });
        }
      }
    });
  };

  const handleToggleActive = async (id, e) => {
    e.stopPropagation();

    try {
      await axiosInstance.put(`/api/DeliveryFees/ChangeActiveStatus/${id}`);
      await fetchDeliveryAreas();

      Swal.fire({
        icon: "success",
        title: "تم تحديث الحالة!",
        text: "تم تحديث حالة منطقة التوصيل",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحديث حالة منطقة التوصيل",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      branchId: "",
      areaName: "",
      fee: "",
      estimatedTimeMin: "",
      estimatedTimeMax: "",
      isActive: true, // إعادة التعيين إلى true كقيمة افتراضية
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleAddNewArea = () => {
    setIsAdding(true);
  };

  const handleFormBranchSelect = (branchId) => {
    setFormData({
      ...formData,
      branchId: branchId.toString(),
    });
    setFormBranchesDropdownOpen(false);
  };

  const getSelectedBranchName = () => {
    if (!formData.branchId) return "اختر الفرع";
    const branch = branches.find((b) => b.id === parseInt(formData.branchId));
    return branch ? branch.name : "اختر الفرع";
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    return (
      formData.branchId !== "" &&
      formData.areaName.trim() !== "" &&
      formData.fee !== "" &&
      formData.estimatedTimeMin !== "" &&
      formData.estimatedTimeMax !== ""
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
                إدارة تكاليف التوصيل
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                إدارة مناطق وتكاليف التوصيل
              </p>
            </div>
          </div>
          <div className="text-right self-end sm:self-auto">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#E41E26]">
              {deliveryAreas.length} منطقة
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              الإجمالي
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
                placeholder="ابحث في مناطق التوصيل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-black focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2 w-full sm:w-auto">
              {/* Add New Area Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddNewArea}
                className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-5 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base whitespace-nowrap"
              >
                <FaPlus className="text-sm" />
                <span className="hidden sm:inline">إضافة منطقة</span>
                <span className="sm:hidden">إضافة</span>
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
                              {area.isActive ? "نشط" : "غير نشط"}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {area.branchName && `الفرع: ${area.branchName} • `}
                            تم الإنشاء{" "}
                            {new Date(area.createdAt).toLocaleDateString(
                              "ar-EG"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700">
                          <FaMoneyBillWave className="text-green-600 dark:text-green-400 text-lg flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              تكلفة التوصيل
                            </p>
                            <p className="font-bold text-green-600 dark:text-green-400 text-lg">
                              ج.م {area.deliveryCost.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700">
                          <FaTruck className="text-blue-600 dark:text-blue-400 text-lg flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              الوقت المتوقع
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
                        {area.isActive ? "تعطيل" : "تفعيل"}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(area)}
                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center"
                      >
                        <FaEdit className="text-xs sm:text-sm" />
                        <span className="whitespace-nowrap">تعديل</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(area.id)}
                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-800 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center"
                      >
                        <FaTrash className="text-xs sm:text-sm" />
                        <span className="whitespace-nowrap">حذف</span>
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
                  لم يتم العثور على مناطق توصيل
                </h3>
                <p className="text-gray-500 dark:text-gray-500 text-sm sm:text-base mb-4 sm:mb-6 max-w-xs sm:max-w-sm mx-auto">
                  {searchTerm || filter !== "all"
                    ? "حاول تعديل معايير البحث أو التصفية"
                    : "أضف أول منطقة توصيل للبدء"}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddNewArea}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base mx-auto"
                >
                  <FaPlus className="text-xs sm:text-sm" />
                  <span>أضف أول منطقة</span>
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
                      {editingId ? "تعديل المنطقة" : "إضافة منطقة جديدة"}
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
                    {/* Branch Dropdown */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        الفرع *
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setFormBranchesDropdownOpen(
                              !formBranchesDropdownOpen
                            )
                          }
                          className="w-full flex items-center justify-between border border-gray-200 bg-white rounded-xl px-4 py-3 text-black focus:ring-2 focus:ring-[#E41E26] transition-all duration-200 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <span className="flex items-center gap-2">
                            <FaBuilding className="text-[#E41E26]" />
                            {getSelectedBranchName()}
                          </span>
                          <motion.div
                            animate={{
                              rotate: formBranchesDropdownOpen ? 180 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <FaChevronDown className="text-[#E41E26]" />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {formBranchesDropdownOpen && (
                            <motion.ul
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.2 }}
                              className="absolute z-50 mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto dark:bg-gray-700 dark:border-gray-600"
                            >
                              {branches.map((branch) => (
                                <li
                                  key={branch.id}
                                  onClick={() =>
                                    handleFormBranchSelect(branch.id)
                                  }
                                  className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] cursor-pointer text-gray-700 transition-all text-sm sm:text-base border-b border-gray-100 last:border-b-0 dark:hover:from-gray-600 dark:hover:to-gray-500 dark:text-gray-300 dark:border-gray-600"
                                >
                                  {branch.name}
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Area Name */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        اسم المنطقة *
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
                          placeholder="أدخل اسم المنطقة"
                        />
                      </div>
                    </div>

                    {/* Delivery Cost */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        تكلفة التوصيل (ج.م) *
                      </label>
                      <div className="relative group">
                        <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                        <input
                          type="number"
                          name="fee"
                          value={formData.fee}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Estimated Time Range */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          أقل وقت (دقيقة) *
                        </label>
                        <div className="relative group">
                          <FaTruck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                          <input
                            type="number"
                            name="estimatedTimeMin"
                            value={formData.estimatedTimeMin}
                            onChange={handleInputChange}
                            required
                            min="0"
                            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            placeholder="أقل"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          أقصى وقت (دقيقة) *
                        </label>
                        <div className="relative group">
                          <FaTruck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                          <input
                            type="number"
                            name="estimatedTimeMax"
                            value={formData.estimatedTimeMax}
                            onChange={handleInputChange}
                            required
                            min="0"
                            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            placeholder="أقصى"
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
                        نشط (متاح للتوصيل)
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
                        إلغاء
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
                        {editingId ? "تحديث" : "حفظ"}
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
