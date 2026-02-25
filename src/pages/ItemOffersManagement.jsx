import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaPercent,
  FaMoneyBillWave,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSave,
  FaTimes,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaStore,
  FaHamburger,
  FaTag,
  FaClock,
  FaChevronDown,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../api/axiosInstance";
import { Helmet } from "react-helmet-async";

const translateOfferErrorMessage = (errorData, useHTML = true) => {
  if (!errorData) return "حدث خطأ غير معروف";

  if (Array.isArray(errorData.errors)) {
    const errorMessages = errorData.errors.map((error) => {
      switch (error.code) {
        case "ItemOffer.ItemOfferAlreadyExists":
          return "هناك عرض نشط لهذا العنصر بالفعل.";
        case "ItemOffer.StartDateMustBeInFuture":
          return "تاريخ البداية يجب أن يكون في المستقبل.";
        case "ItemOffer.EndDateMustBeAfterStartDate":
          return "تاريخ النهاية يجب أن يكون بعد تاريخ البداية.";
        case "ItemOffer.InvalidDiscountValue":
          return "قيمة الخصم غير صالحة.";
        case "ItemOffer.DiscountPercentageOutOfRange":
          return "نسبة الخصم يجب أن تكون بين 0 و 100.";
        case "ItemOffer.MenuItemNotFound":
          return "العنصر المحدد غير موجود.";
        case "ItemOffer.BranchNotFound":
          return "أحد الفروع المحددة غير موجود.";
        case "ItemOffer.OfferNotFound":
          return "العرض المطلوب غير موجود.";
        case "ItemOffer.OfferAlreadyActive":
          return "العرض نشط بالفعل.";
        case "ItemOffer.OfferAlreadyInactive":
          return "العرض غير نشط بالفعل.";
        case "ItemOffer.CannotUpdateMenuItem":
          return "لا يمكن تغيير العنصر أثناء التعديل.";
        default:
          return error.description || error.code;
      }
    });

    if (errorMessages.length > 1) {
      if (useHTML) {
        const htmlMessages = errorMessages.map(
          (msg, index) =>
            `<div style="direction: rtl; text-align: right; margin-bottom: 8px; padding-right: 15px; position: relative;">
             ${msg}
             <span style="position: absolute; right: 0; top: 0;">${index + 1}</span>
           </div>`,
        );
        return htmlMessages.join("");
      } else {
        return errorMessages.join(" - ");
      }
    } else if (errorMessages.length === 1) {
      return errorMessages[0];
    } else {
      return "بيانات غير صالحة";
    }
  }

  if (errorData.errors && typeof errorData.errors === "object") {
    const errorMessages = [];

    if (
      errorData.errors.DiscountValue &&
      Array.isArray(errorData.errors.DiscountValue)
    ) {
      errorData.errors.DiscountValue.forEach((msg) => {
        if (msg.toLowerCase().includes("greater than 0")) {
          errorMessages.push("قيمة الخصم يجب أن تكون أكبر من الصفر");
        } else if (msg.toLowerCase().includes("required")) {
          errorMessages.push("قيمة الخصم مطلوبة");
        } else if (
          msg.toLowerCase().includes("percentage") &&
          msg.toLowerCase().includes("100")
        ) {
          errorMessages.push(
            "قيمة الخصم بالنسبة المئوية يجب أن تكون بين 0 و 100",
          );
        } else {
          errorMessages.push(msg);
        }
      });
    }

    if (errorData.errors.EndDate && Array.isArray(errorData.errors.EndDate)) {
      errorData.errors.EndDate.forEach((msg) => {
        if (msg.toLowerCase().includes("after start date")) {
          errorMessages.push("تاريخ النهاية يجب أن يكون بعد تاريخ البداية");
        } else if (msg.toLowerCase().includes("required")) {
          errorMessages.push("تاريخ النهاية مطلوب");
        } else if (msg.toLowerCase().includes("future")) {
          errorMessages.push("تاريخ النهاية يجب أن يكون في المستقبل");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    if (
      errorData.errors.StartDate &&
      Array.isArray(errorData.errors.StartDate)
    ) {
      errorData.errors.StartDate.forEach((msg) => {
        if (msg.toLowerCase().includes("required")) {
          errorMessages.push("تاريخ البداية مطلوب");
        } else if (msg.toLowerCase().includes("future")) {
          errorMessages.push("تاريخ البداية يجب أن يكون في المستقبل");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    if (
      errorData.errors.MenuItemId &&
      Array.isArray(errorData.errors.MenuItemId)
    ) {
      errorData.errors.MenuItemId.forEach((msg) => {
        if (msg.toLowerCase().includes("required")) {
          errorMessages.push("العنصر مطلوب");
        } else if (
          msg.toLowerCase().includes("exist") ||
          msg.toLowerCase().includes("not found")
        ) {
          errorMessages.push("العنصر المحدد غير موجود");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    if (
      errorData.errors.BranchesIds &&
      Array.isArray(errorData.errors.BranchesIds)
    ) {
      errorData.errors.BranchesIds.forEach((msg) => {
        if (
          msg.toLowerCase().includes("required") ||
          msg.toLowerCase().includes("at least")
        ) {
          errorMessages.push("يجب اختيار فرع واحد على الأقل");
        } else if (
          msg.toLowerCase().includes("exist") ||
          msg.toLowerCase().includes("not found")
        ) {
          errorMessages.push("أحد الفروع المحددة غير موجود");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    Object.keys(errorData.errors).forEach((key) => {
      if (
        ![
          "DiscountValue",
          "EndDate",
          "StartDate",
          "MenuItemId",
          "BranchesIds",
        ].includes(key)
      ) {
        const errorValue = errorData.errors[key];
        if (Array.isArray(errorValue)) {
          errorValue.forEach((msg) => {
            errorMessages.push(msg);
          });
        } else if (typeof errorValue === "string") {
          errorMessages.push(errorValue);
        } else if (errorValue && typeof errorValue === "object") {
          Object.values(errorValue).forEach((nestedMsg) => {
            if (typeof nestedMsg === "string") {
              errorMessages.push(nestedMsg);
            }
          });
        }
      }
    });

    if (errorMessages.length > 1) {
      if (useHTML) {
        const htmlMessages = errorMessages.map(
          (msg, index) =>
            `<div style="direction: rtl; text-align: right; margin-bottom: 8px; padding-right: 15px; position: relative;">
             ${msg}
             <span style="position: absolute; right: 0; top: 0;">${index + 1}</span>
           </div>`,
        );
        return htmlMessages.join("");
      } else {
        return errorMessages.join(" - ");
      }
    } else if (errorMessages.length === 1) {
      return errorMessages[0];
    } else {
      return "بيانات غير صالحة";
    }
  }

  if (typeof errorData.message === "string") {
    const msg = errorData.message.toLowerCase();
    if (msg.includes("network") || msg.includes("internet")) {
      return "يرجى التحقق من اتصالك بالإنترنت";
    }
    if (msg.includes("timeout") || msg.includes("time out")) {
      return "انتهت المهلة، يرجى المحاولة مرة أخرى";
    }
    if (msg.includes("unauthorized") || msg.includes("forbidden")) {
      return "ليس لديك صلاحية للقيام بهذا الإجراء";
    }
    if (msg.includes("conflict")) {
      return "هناك تعارض في البيانات. قد يكون هناك عرض نشط للعنصر بالفعل.";
    }

    const englishArabicMap = {
      "start date must be in the future":
        "تاريخ البداية يجب أن يكون في المستقبل",
      "end date must be after start date":
        "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
      "discount value must be greater than 0":
        "قيمة الخصم يجب أن تكون أكبر من الصفر",
      "menu item not found": "العنصر المحدد غير موجود",
      "branch not found": "الفرع المحدد غير موجود",
      "offer not found": "العرض المطلوب غير موجود",
      "item offer already exists": "هناك عرض نشط لهذا العنصر بالفعل",
      "invalid discount value": "قيمة الخصم غير صالحة",
      "percentage discount must be between 0 and 100":
        "نسبة الخصم يجب أن تكون بين 0 و 100",
    };

    const lowerMsg = msg.toLowerCase();
    for (const [english, arabic] of Object.entries(englishArabicMap)) {
      if (lowerMsg.includes(english)) {
        return arabic;
      }
    }

    return errorData.message;
  }

  return "حدث خطأ غير متوقع أثناء حفظ العرض";
};

const adjustTimeForAPI = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  date.setTime(date.getTime() - 2 * 60 * 60 * 1000);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
};

const adjustTimeFromAPI = (dateString) => {
  if (!dateString) return new Date();

  const date = new Date(dateString);
  date.setTime(date.getTime() + 2 * 60 * 60 * 1000);

  return date;
};

const isMobileScreen = () => {
  return window.innerWidth < 768;
};

const showMessage = (type, title, text, options = {}) => {
  const { showButtons = false, ...otherOptions } = options;

  if (!isMobileScreen() || showButtons) {
    const swalOptions = {
      icon: type,
      title: title,
      text: text,
      showConfirmButton: false,
      timer: otherOptions.timer || 2000,
      confirmButtonColor: "#E41E26",
      ...otherOptions,
    };

    if (showButtons) {
      delete swalOptions.timer;
      delete swalOptions.showConfirmButton;
    }

    Swal.fire(swalOptions);
  } else {
    const toastOptions = {
      position: "top-right",
      autoClose: otherOptions.timer || 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      rtl: true,
      className: "toast-mobile",
      bodyClassName: "toast-body-mobile",
      style: {
        width: "70%",
        margin: "10px",
        borderRadius: "10px",
        textAlign: "right",
        direction: "rtl",
      },
    };

    switch (type) {
      case "success":
        toast.success(text, toastOptions);
        break;
      case "error":
        toast.error(text, toastOptions);
        break;
      case "warning":
        toast.warning(text, toastOptions);
        break;
      default:
        toast.info(text, toastOptions);
    }
  }
};

const getStatusColor = (offer) => {
  if (!offer.isEnabled)
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800";
  if (new Date(offer.endDate) < new Date())
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600";
  if (new Date(offer.startDate) > new Date())
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800";
  return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800";
};

const getStatusText = (offer) => {
  if (!offer.isEnabled) return "غير نشط";
  if (new Date(offer.endDate) < new Date()) return "منتهي";
  if (new Date(offer.startDate) > new Date()) return "قادم";
  return "نشط";
};

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ItemOffersManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdminOrRestaurantOrBranch, setIsAdminOrRestaurantOrBranch] =
    useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [pageSize, setPageSize] = useState(5);

  const isPaginationChange = useRef(false);

  const offersContainerRef = useRef(null);
  const firstOfferRef = useRef(null);

  const selectedProductId = location.state?.selectedProductId || "";
  const selectedOfferId = location.state?.selectedOfferId || null;

  const [formData, setFormData] = useState({
    menuItemId: selectedProductId.toString() || "",
    isPercentage: true,
    discountValue: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    isEnabled: true,
    branchesIds: [],
  });

  const scrollToFirstOffer = () => {
    if (isPaginationChange.current) {
      setTimeout(() => {
        if (firstOfferRef.current) {
          const offset = 120;
          const elementPosition =
            firstOfferRef.current.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        } else if (offersContainerRef.current) {
          const containerPosition =
            offersContainerRef.current.getBoundingClientRect().top;
          const offsetPosition = containerPosition + window.pageYOffset - 80;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 200);

      isPaginationChange.current = false;
    }
  };

  useEffect(() => {
    const checkUserRoleAndFetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAdminOrRestaurantOrBranch(false);
          setLoading(false);
          return;
        }

        const userResponse = await axiosInstance.get("/api/Account/Profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const userData = userResponse.data;
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

        const branchesResponse = await axiosInstance.get(
          "/api/Branches/GetList",
        );
        setBranches(branchesResponse.data);

        await fetchOffers(branchesResponse.data);
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
          setIsAdminOrRestaurantOrBranch(false);
          navigate("/");
          return;
        }

        showMessage(
          "error",
          "خطأ في الاتصال",
          "حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.",
        );
      } finally {
        setLoading(false);
        isPaginationChange.current = false;
      }
    };

    checkUserRoleAndFetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    if (selectedProductId && !loading) {
      handleAddNewOffer();
    }

    if (selectedOfferId && offers.length > 0) {
      const existingOffer = offers.find(
        (offer) => offer.id === selectedOfferId,
      );
      if (existingOffer) {
        handleEdit(existingOffer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId, selectedOfferId, loading, offers]);

  useEffect(() => {
    if (selectedProductId) {
      setFormData((prev) => ({
        ...prev,
        menuItemId: selectedProductId.toString(),
      }));
    }
  }, [selectedProductId]);

  useEffect(() => {
    if (isAdminOrRestaurantOrBranch) {
      fetchOffers(branches);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  // تأثير التمرير بعد تحميل البيانات
  useEffect(() => {
    if (!loading && !loadingPage && offers.length > 0) {
      scrollToFirstOffer();
    }
  }, [offers, loading, loadingPage]);

  const buildFiltersArray = () => {
    const filtersArray = [];

    if (searchTerm) {
      filtersArray.push({
        propertyName: "menuItem.name",
        propertyValue: searchTerm,
        range: false,
      });
    }

    return filtersArray;
  };

  const fetchOffers = async (
    branchesList = branches,
    showPageLoading = true,
  ) => {
    if (showPageLoading) {
      setLoadingPage(true);
    }

    try {
      const requestBody = {
        pageNumber: currentPage,
        pageSize: pageSize,
        filters: buildFiltersArray(),
      };

      const response = await axiosInstance.post(
        "/api/ItemOffers/GetAll",
        requestBody,
      );

      const responseData = response.data;
      const offersData = responseData.items || responseData.data || [];

      const offersWithDetails = offersData.map((offer) => {
        const adjustedStartDate = adjustTimeFromAPI(offer.startDate);
        const adjustedEndDate = adjustTimeFromAPI(offer.endDate);

        const branchNames =
          offer.branches?.map((branch) => branch.branchName) || [];

        return {
          ...offer,
          menuItem: {
            name: offer.menuItemName,
            basePrice: offer.menuItemBasePrice,
            description: offer.menuItemDescription || "",
            id: offer.menuItemId,
          },
          branchNames: branchNames,
          startDate: adjustedStartDate,
          endDate: adjustedEndDate,
        };
      });

      setOffers(offersWithDetails);
      setFilteredOffers(offersWithDetails);

      setTotalPages(
        responseData.totalPages ||
          Math.ceil((responseData.totalCount || offersData.length) / pageSize),
      );
    } catch (error) {
      console.error("خطأ في جلب العروض:", error);
      showMessage("error", "خطأ", "فشل في تحميل بيانات العروض");
      setOffers([]);
      setFilteredOffers([]);
    } finally {
      if (showPageLoading) {
        setLoadingPage(false);
      }
    }
  };

  const fetchMenuItems = async () => {
    setLoadingItems(true);
    try {
      const response = await axiosInstance.get(
        "/api/MenuItems/GetAllWithoutPagination",
      );

      const itemsWithoutActiveOffers = response.data.filter((item) => {
        if (!item.itemOffer) return true;

        const offer = item.itemOffer;
        const now = new Date();
        const startDate = adjustTimeFromAPI(offer.startDate);
        const endDate = adjustTimeFromAPI(offer.endDate);

        return !(offer.isEnabled && startDate <= now && endDate >= now);
      });

      setMenuItems(itemsWithoutActiveOffers);
    } catch (error) {
      console.error("خطأ في جلب العناصر:", error);
      showMessage("error", "خطأ", "فشل في تحميل العناصر");
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchOffers(branches, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setError(null);
  };

  const handleBranchesChange = (branchId) => {
    setFormData((prev) => {
      if (prev.branchesIds.includes(branchId)) {
        return {
          ...prev,
          branchesIds: prev.branchesIds.filter((id) => id !== branchId),
        };
      } else {
        return {
          ...prev,
          branchesIds: [...prev.branchesIds, branchId],
        };
      }
    });
    setError(null);
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    setOpenDropdown(null);
    setError(null);
  };

  const formatDateTimeForAPI = (date, time) => {
    if (!date) return "";

    const dateObj = new Date(date);

    if (time) {
      const [hours, minutes] = time.split(":");
      dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      dateObj.setHours(0, 0, 0, 0);
    }

    return adjustTimeForAPI(dateObj.toISOString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.menuItemId ||
      !formData.discountValue ||
      !formData.startDate ||
      !formData.endDate
    ) {
      showMessage("error", "معلومات ناقصة", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (formData.branchesIds.length === 0) {
      showMessage(
        "error",
        "لم يتم اختيار فروع",
        "يرجى اختيار فرع واحد على الأقل",
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const offerData = {
        menuItemId: parseInt(formData.menuItemId),
        isPercentage: formData.isPercentage,
        discountValue: parseFloat(formData.discountValue),
        startDate: formatDateTimeForAPI(formData.startDate, formData.startTime),
        endDate: formatDateTimeForAPI(formData.endDate, formData.endTime),
        isEnabled: formData.isEnabled,
        branchesIds: formData.branchesIds.map((id) => parseInt(id)),
      };

      console.log("إرسال بيانات العرض:", offerData);

      if (editingId) {
        const res = await axiosInstance.put(
          `/api/ItemOffers/Update/${editingId}`,
          offerData,
        );
        if (res.status === 200 || res.status === 204) {
          showMessage(
            "success",
            "تم تحديث العرض",
            "تم تحديث عرض العنصر بنجاح.",
          );
        }
      } else {
        const res = await axiosInstance.post("/api/ItemOffers/Add", offerData);
        if (res.status === 200 || res.status === 201) {
          showMessage(
            "success",
            "تم إضافة العرض",
            "تم إضافة عرض العنصر الجديد بنجاح.",
          );
        }
      }

      resetForm();
      setCurrentPage(1);
      fetchOffers();
    } catch (err) {
      console.error("خطأ في حفظ العرض:", err);
      console.log("بيانات الخطأ من الـ API:", err.response?.data);

      setError(err.response?.data);

      const translatedMessage = translateOfferErrorMessage(
        err.response?.data,
        false,
      );

      showMessage("error", "حدث خطأ", translatedMessage, { timer: 2500 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (offer) => {
    const startDateObj = new Date(offer.startDate);
    const endDateObj = new Date(offer.endDate);

    const currentBranchesIds =
      offer.branches?.map((branch) => branch.branchId) ||
      (offer.branchesIds && offer.branchesIds.length > 0
        ? offer.branchesIds
        : branches.map((branch) => branch.id));

    setFormData({
      menuItemId: offer.menuItemId.toString(),
      isPercentage: offer.isPercentage,
      discountValue: offer.discountValue.toString(),
      startDate: startDateObj.toISOString().split("T")[0],
      startTime: startDateObj.toTimeString().slice(0, 5),
      endDate: endDateObj.toISOString().split("T")[0],
      endTime: endDateObj.toTimeString().slice(0, 5),
      isEnabled: offer.isEnabled,
      branchesIds: currentBranchesIds,
    });
    setEditingId(offer.id);
    setIsAdding(true);
    fetchMenuItems();
    setError(null);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/ItemOffers/Delete/${id}`);
          setCurrentPage(1);
          fetchOffers();
          showMessage("success", "تم الحذف!", "تم حذف عرض العنصر.");
        } catch (err) {
          showMessage("error", "خطأ", "فشل في حذف عرض العنصر.", {
            timer: 2500,
          });
        }
      }
    });
  };

  const handleToggleActive = async (id, e) => {
    e.stopPropagation();

    const offer = offers.find((o) => o.id === id);
    if (!offer) return;

    const offerData = {
      menuItemId: offer.menuItemId,
      isPercentage: offer.isPercentage,
      discountValue: offer.discountValue,
      startDate: adjustTimeForAPI(offer.startDate),
      endDate: adjustTimeForAPI(offer.endDate),
      isEnabled: !offer.isEnabled,
      branchesIds:
        offer.branches?.map((branch) => branch.branchId) ||
        offer.branchesIds ||
        branches.map((branch) => branch.id),
    };

    try {
      const response = await axiosInstance.put(
        `/api/ItemOffers/Update/${id}`,
        offerData,
      );
      if (response.status === 200 || response.status === 204) {
        fetchOffers();
        showMessage(
          "success",
          "تم تحديث الحالة!",
          `تم ${offer.isEnabled ? "تعطيل" : "تفعيل"} عرض العنصر`,
          { timer: 1500 },
        );
      }
    } catch (error) {
      console.error("خطأ في تحديث حالة العرض:", error);
      showMessage("error", "خطأ", "فشل في تحديث حالة العرض", { timer: 2500 });
    }
  };

  const resetForm = () => {
    setFormData({
      menuItemId: selectedProductId.toString() || "",
      isPercentage: true,
      discountValue: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      isEnabled: true,
      branchesIds: [],
    });
    setEditingId(null);
    setIsAdding(false);
    setOpenDropdown(null);
    setError(null);
    setMenuItems([]);
  };

  const handleAddNewOffer = () => {
    fetchMenuItems();
    setIsAdding(true);
    setError(null);
  };

  const isFormValid = () => {
    return (
      formData.menuItemId.trim() !== "" &&
      formData.discountValue !== "" &&
      formData.startDate !== "" &&
      formData.endDate !== ""
    );
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber !== currentPage) {
      isPaginationChange.current = true;
      setCurrentPage(pageNumber);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      isPaginationChange.current = true;
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      // تعيين أن هذا التغيير من الباجينيشن
      isPaginationChange.current = true;
      setCurrentPage(currentPage + 1);
    }
  };

  const getPaginationNumbers = () => {
    const delta = 2;
    const range = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift("...");
    }
    if (currentPage + delta < totalPages - 1) {
      range.push("...");
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff5f5] to-[#ffe5e5] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
        </div>
      </div>
    );
  }

  if (!isAdminOrRestaurantOrBranch) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>IM3 Sport</title>
        <meta
          name="description"
          content="IM3 Sport، متجر ملابس رياضية عصري يقدم أحدث صيحات الأزياء الرياضية بجودة عالية وتصميمات عصرية تمنحك الراحة والأداء المثالي طوال اليوم."
        />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-white via-[#fff5f5] to-[#ffe5e5] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-3 sm:px-4 py-4 sm:py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
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
                className="bg-white/80 backdrop-blur-md rounded-full p-2 sm:p-3 text-[#E41E26] hover:bg-[#E41E26] hover:text-white transition-all duration-300 shadow-lg border border-[#E41E26] dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-[#E41E26]"
              >
                <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
                  إدارة عروض العناصر
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  إنشاء وإدارة الخصومات الخاصة بالعناصر
                </p>
              </div>
            </div>
            <div className="text-right self-end sm:self-auto">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#E41E26]">
                {offers.length} عرض
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                في الصفحة الحالية
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 mb-6 sm:mb-8 relative z-30 dark:bg-gray-800/90"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="ابحث في العروض حسب اسم العنصر، الوصف، أو الفرع..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-black focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddNewOffer}
                  className="flex items-center gap-2 bg-[#E41E26] text-white px-4 sm:px-5 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base whitespace-nowrap w-full sm:w-auto justify-center"
                >
                  <FaPlus className="text-sm" />
                  <span className="hidden sm:inline">إنشاء عرض</span>
                  <span className="sm:hidden">إنشاء</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            <div
              ref={offersContainerRef}
              className={`space-y-3 sm:space-y-4 md:space-y-5 ${
                isAdding ? "xl:col-span-2" : "xl:col-span-3"
              }`}
            >
              {/* Loading overlay للصفحات */}
              {loadingPage && (
                <div className="flex justify-center items-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#E41E26]"></div>
                  </div>
                </div>
              )}

              {!loadingPage && (
                <AnimatePresence mode="wait">
                  {filteredOffers.map((offer, index) => (
                    <motion.div
                      key={offer.id}
                      ref={index === 0 ? firstOfferRef : null}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-5 lg:p-6 hover:shadow-2xl transition-all duration-300 dark:bg-gray-800/90 border-2 ${
                        offer.isEnabled &&
                        new Date(offer.startDate) <= new Date() &&
                        new Date(offer.endDate) >= new Date()
                          ? "border-green-200 dark:border-green-800"
                          : "border-gray-200/50 dark:border-gray-600"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Header with icon and status */}
                          <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <div
                                className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${
                                  offer.isPercentage
                                    ? "from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20"
                                    : "from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20"
                                } border ${getStatusColor(offer)} flex-shrink-0`}
                              >
                                {offer.isPercentage ? (
                                  <FaPercent className="text-[#E41E26] text-lg sm:text-xl" />
                                ) : (
                                  <FaMoneyBillWave className="text-[#E41E26] text-lg sm:text-xl" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <h3
                                    className={`font-bold ${
                                      offer.isEnabled
                                        ? "text-gray-800 dark:text-gray-200"
                                        : "text-gray-500 dark:text-gray-400"
                                    } text-base sm:text-lg md:text-xl truncate`}
                                  >
                                    {offer.menuItem?.name ||
                                      `عنصر #${offer.menuItemId}`}
                                  </h3>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs whitespace-nowrap inline-flex items-center gap-1 self-start sm:self-center ${getStatusColor(
                                      offer,
                                    )}`}
                                  >
                                    {offer.isEnabled && (
                                      <FaStar className="text-xs" />
                                    )}
                                    {getStatusText(offer)}
                                  </span>
                                </div>
                                {offer.menuItem?.description ? (
                                  <p
                                    className={`${offer.isEnabled ? "text-gray-600 dark:text-gray-400" : "text-gray-400 dark:text-gray-500"} text-xs sm:text-sm truncate mt-1`}
                                  >
                                    {offer.menuItem.description}
                                  </p>
                                ) : (
                                  <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm italic truncate mt-1">
                                    لا يوجد وصف
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Discount and Price Info - Full Width */}
                          <div
                            className={`mb-4 ${offer.isEnabled ? "opacity-100" : "opacity-75"}`}
                          >
                            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl border border-green-200 dark:border-green-700 p-4 sm:p-5">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                                  {offer.isPercentage ? (
                                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                      <FaPercent className="text-green-600 dark:text-green-400 text-2xl" />
                                    </div>
                                  ) : (
                                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                      <FaMoneyBillWave className="text-green-600 dark:text-green-400 text-2xl" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                      قيمة الخصم
                                    </p>
                                    <p className="font-bold text-green-600 dark:text-green-400 text-2xl">
                                      {offer.isPercentage
                                        ? `${offer.discountValue}%`
                                        : `ج.م ${offer.discountValue}`}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                    <FaHamburger className="text-blue-600 dark:text-blue-400 text-2xl" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                      السعر الأصلي
                                    </p>
                                    <p className="font-bold text-blue-600 dark:text-blue-400 text-2xl">
                                      {offer.menuItem?.basePrice === 0 ? (
                                        <span className="text-[#E41E26] dark:text-[#E41E26] font-bold">
                                          حسب الطلب
                                        </span>
                                      ) : (
                                        `ج.م ${
                                          offer.menuItem?.basePrice ||
                                          "غير متاح"
                                        }`
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Date Info - Full Width */}
                          <div className="mb-4">
                            <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl border border-orange-200 dark:border-orange-700 p-4 sm:p-5">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                                    <FaCalendarAlt className="text-orange-600 dark:text-orange-400 text-2xl" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                      تاريخ ووقت البداية
                                    </p>
                                    <p className="font-bold text-orange-600 dark:text-orange-400 text-lg">
                                      {formatDateTime(offer.startDate)}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                                    <FaCalendarAlt className="text-purple-600 dark:text-purple-400 text-2xl" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                      تاريخ ووقت النهاية
                                    </p>
                                    <p className="font-bold text-purple-600 dark:text-purple-400 text-lg">
                                      {formatDateTime(offer.endDate)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Branches */}
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <FaStore className="text-blue-600 dark:text-blue-400 text-sm" />
                              </div>
                              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                الفروع المطبق عليها:
                              </p>
                            </div>
                            {offer.branchNames &&
                            offer.branchNames.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {offer.branchNames.map((branchName, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1.5 bg-[#E41E26] text-white rounded-lg text-xs font-medium flex items-center gap-1"
                                  >
                                    <FaStore className="text-xs" />
                                    {branchName}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                لم يتم تحديد فروع
                              </p>
                            )}
                          </div>

                          {/* Created At */}
                          <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xs mt-2">
                            <FaClock className="text-xs" />
                            <span>
                              تم الإنشاء: {formatDateTime(offer.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-row sm:flex-col lg:flex-row gap-1 sm:gap-2 justify-end sm:justify-start items-center mt-2 sm:mt-0">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => handleToggleActive(offer.id, e)}
                            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 ${
                              offer.isEnabled
                                ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300 dark:hover:bg-yellow-800 border-yellow-200 dark:border-yellow-800"
                                : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-800 border-green-200 dark:border-green-800"
                            } rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center border`}
                          >
                            {offer.isEnabled ? (
                              <>
                                <FaTimesCircle className="text-xs sm:text-sm" />
                                <span className="whitespace-nowrap">تعطيل</span>
                              </>
                            ) : (
                              <>
                                <FaCheckCircle className="text-xs sm:text-sm" />
                                <span className="whitespace-nowrap">تفعيل</span>
                              </>
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEdit(offer)}
                            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center border border-blue-200 dark:border-blue-800"
                          >
                            <FaEdit className="text-xs sm:text-sm" />
                            <span className="whitespace-nowrap">تعديل</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(offer.id)}
                            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-800 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center border border-red-200 dark:border-red-800"
                          >
                            <FaTrash className="text-xs sm:text-sm" />
                            <span className="whitespace-nowrap">حذف</span>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {!loading && !loadingPage && filteredOffers.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 sm:py-10 md:py-12 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 dark:bg-gray-700/80 dark:border-gray-600"
                >
                  <FaTag className="mx-auto text-3xl sm:text-4xl md:text-5xl text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                    لم يتم العثور على عروض عناصر
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500 text-sm sm:text-base mb-4 sm:mb-6 max-w-xs sm:max-w-sm mx-auto">
                    {searchTerm
                      ? "حاول ضبط معايير البحث الخاصة بك"
                      : "قم بإنشاء أول عرض عنصر للبدء"}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddNewOffer}
                    className="flex items-center gap-2 bg-[#E41E26] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base mx-auto"
                  >
                    <FaPlus className="text-xs sm:text-sm" />
                    <span>إنشاء أول عرض</span>
                  </motion.button>
                </motion.div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col items-center">
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1 || loadingPage}
                      className={`p-2 sm:p-3 rounded-xl ${
                        currentPage === 1 || loadingPage
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <FaChevronRight className="text-sm sm:text-base" />
                    </button>

                    <div className="flex items-center gap-1 sm:gap-2">
                      {getPaginationNumbers().map((pageNum, index) => (
                        <React.Fragment key={index}>
                          {pageNum === "..." ? (
                            <span className="px-2 sm:px-3 py-1 sm:py-2 text-gray-500">
                              ...
                            </span>
                          ) : (
                            <button
                              onClick={() => handlePageChange(pageNum)}
                              disabled={loadingPage}
                              className={`px-3 sm:px-4 py-1 sm:py-2 rounded-xl font-semibold ${
                                currentPage === pageNum
                                  ? "bg-[#E41E26] text-white shadow-lg"
                                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                              } ${loadingPage ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              {pageNum}
                            </button>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages || loadingPage}
                      className={`p-2 sm:p-3 rounded-xl ${
                        currentPage === totalPages || loadingPage
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <FaChevronLeft className="text-sm sm:text-base" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <AnimatePresence>
              {isAdding && (
                <motion.div
                  id="offer-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="xl:col-span-1"
                >
                  <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-5 lg:p-6 border border-gray-200/50 dark:bg-gray-800/90 dark:border-gray-600 sticky top-4 sm:top-6 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">
                        {editingId ? "تعديل العرض" : "إنشاء عرض جديد"}
                      </h3>
                      <button
                        onClick={resetForm}
                        className="text-gray-500 hover:text-[#E41E26] dark:text-gray-400 dark:hover:text-[#E41E26] transition-colors duration-200 flex-shrink-0 ml-2"
                      >
                        <FaTimes size={16} className="sm:size-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      className="space-y-3 sm:space-y-4"
                    >
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          العنصر *
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              if (editingId) return;
                              setOpenDropdown(
                                openDropdown === "menuItem" ? null : "menuItem",
                              );
                              if (
                                !menuItems.length &&
                                openDropdown !== "menuItem"
                              ) {
                                fetchMenuItems();
                              }
                            }}
                            disabled={editingId !== null}
                            className="w-full flex items-center justify-between border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed text-right"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <FaHamburger className="text-[#E41E26] flex-shrink-0" />
                              {formData.menuItemId
                                ? (() => {
                                    const selectedItem = menuItems.find(
                                      (item) =>
                                        item.id.toString() ===
                                        formData.menuItemId,
                                    );
                                    return selectedItem
                                      ? `${selectedItem.name} - ${
                                          selectedItem.basePrice === 0
                                            ? "السعر حسب الطلب"
                                            : `ج.م ${selectedItem.basePrice}`
                                        }${
                                          selectedItem.category
                                            ? ` (${selectedItem.category.name})`
                                            : ""
                                        }`
                                      : "اختر عنصر";
                                  })()
                                : "اختر عنصر"}
                            </span>
                            <motion.div
                              animate={{
                                rotate: openDropdown === "menuItem" ? 180 : 0,
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              {loadingItems ? (
                                <FaSpinner className="text-[#E41E26] animate-spin" />
                              ) : (
                                <FaChevronDown className="text-[#E41E26]" />
                              )}
                            </motion.div>
                          </button>

                          <AnimatePresence>
                            {openDropdown === "menuItem" && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2 }}
                                className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-2xl rounded-xl overflow-hidden max-h-64 overflow-y-auto"
                              >
                                {loadingItems ? (
                                  <div className="flex items-center justify-center py-4">
                                    <FaSpinner className="text-[#E41E26] animate-spin text-lg" />
                                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                                      جاري تحميل العناصر...
                                    </span>
                                  </div>
                                ) : menuItems.length === 0 ? (
                                  <div className="px-4 py-3 text-center">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                      {editingId
                                        ? "لا يمكن تغيير العنصر أثناء التعديل"
                                        : "لا توجد عناصر متاحة أو جميع العناصر لديها عروض نشطة بالفعل"}
                                    </p>
                                  </div>
                                ) : (
                                  <div>
                                    {menuItems.map((item) => (
                                      <div
                                        key={item.id}
                                        onClick={() => {
                                          handleSelectChange(
                                            "menuItemId",
                                            item.id.toString(),
                                          );
                                          setOpenDropdown(null);
                                        }}
                                        className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff5f5] hover:to-[#ffe5e5] dark:hover:from-gray-600 dark:hover:to-gray-500 cursor-pointer text-gray-700 dark:text-gray-300 transition-all text-sm sm:text-base border-b border-gray-100 dark:border-gray-600 last:border-b-0 flex flex-col text-right"
                                      >
                                        <div className="font-medium truncate">
                                          {item.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                          {item.basePrice === 0
                                            ? "السعر حسب الطلب"
                                            : `ج.م ${item.basePrice}`}
                                          {item.category &&
                                            ` • ${item.category.name}`}
                                        </div>
                                        {item.description && (
                                          <div className="text-xs text-gray-600 dark:text-gray-500 truncate mt-1">
                                            {item.description}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        {editingId && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                            لا يمكن تغيير العنصر أثناء تعديل عرض موجود
                          </p>
                        )}
                        {!editingId &&
                          !loadingItems &&
                          menuItems.length === 0 && (
                            <p className="text-xs text-orange-500 dark:text-orange-400 mt-1 text-right">
                              جميع العناصر لديها عروض نشطة بالفعل. قم بتعطيل
                              العروض الحالية لإضافة عروض جديدة.
                            </p>
                          )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            نوع الخصم
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="isPercentage"
                                checked={formData.isPercentage}
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    isPercentage: true,
                                  })
                                }
                                className="text-[#E41E26] focus:ring-[#E41E26]"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                نسبة مئوية (%)
                              </span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="isPercentage"
                                checked={!formData.isPercentage}
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    isPercentage: false,
                                  })
                                }
                                className="text-[#E41E26] focus:ring-[#E41E26]"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                مبلغ ثابت (ج.م)
                              </span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            قيمة الخصم *
                          </label>
                          <div className="relative group">
                            {formData.isPercentage ? (
                              <FaPercent className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm" />
                            ) : (
                              <FaMoneyBillWave className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm" />
                            )}
                            <input
                              type="number"
                              name="discountValue"
                              value={formData.discountValue}
                              onChange={handleInputChange}
                              required
                              min="0"
                              max={formData.isPercentage ? "100" : ""}
                              step={formData.isPercentage ? "1" : "0.01"}
                              className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl pl-3 pr-9 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base text-right"
                              placeholder={
                                formData.isPercentage ? "0-100" : "0.00"
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            تاريخ البداية *
                          </label>
                          <div className="relative group">
                            <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm" />
                            <input
                              type="date"
                              name="startDate"
                              value={formData.startDate}
                              onChange={handleInputChange}
                              required
                              className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl pl-3 pr-9 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            وقت البداية
                          </label>
                          <div className="relative group">
                            <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm" />
                            <input
                              type="time"
                              name="startTime"
                              value={formData.startTime}
                              onChange={handleInputChange}
                              className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl pl-3 pr-9 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            تاريخ النهاية *
                          </label>
                          <div className="relative group">
                            <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm" />
                            <input
                              type="date"
                              name="endDate"
                              value={formData.endDate}
                              onChange={handleInputChange}
                              required
                              min={formData.startDate}
                              className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl pl-3 pr-9 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            وقت النهاية
                          </label>
                          <div className="relative group">
                            <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm" />
                            <input
                              type="time"
                              name="endTime"
                              value={formData.endTime}
                              onChange={handleInputChange}
                              className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl pl-3 pr-9 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          الفروع المطبق عليها *
                        </label>
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl p-3 max-h-48 overflow-y-auto bg-white dark:bg-gray-700">
                          {branches.length === 0 ? (
                            <div className="text-center py-4">
                              <FaStore className="mx-auto text-2xl text-gray-400 dark:text-gray-500 mb-2" />
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                لا توجد فروع متاحة
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {branches.map((branch) => (
                                <label
                                  key={branch.id}
                                  className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.branchesIds.includes(
                                      branch.id,
                                    )}
                                    onChange={() =>
                                      handleBranchesChange(branch.id)
                                    }
                                    className="text-[#E41E26] focus:ring-[#E41E26] rounded"
                                  />
                                  <div className="flex items-center gap-2 flex-1 justify-between">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                      {branch.name}
                                    </span>
                                    <FaStore className="text-gray-400 dark:text-gray-500 text-sm" />
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                          اختر فرع واحد على الأقل للعرض
                        </p>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#fff5f5] to-[#ffe5e5] dark:from-gray-700 dark:to-gray-600 rounded-xl border border-[#E41E26]/30 dark:border-gray-500">
                        <input
                          type="checkbox"
                          name="isEnabled"
                          checked={formData.isEnabled}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-[#E41E26] bg-gray-100 border-gray-300 rounded focus:ring-[#E41E26] focus:ring-2"
                        />
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          نشط (متاح للاستخدام)
                        </label>
                      </div>

                      <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2 flex-col sm:flex-row">
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
                          disabled={
                            !isFormValid() ||
                            formData.branchesIds.length === 0 ||
                            isSubmitting
                          }
                          className={`flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-1 sm:gap-2 ${
                            isFormValid() &&
                            formData.branchesIds.length > 0 &&
                            !isSubmitting
                              ? "bg-[#E41E26] text-white hover:shadow-xl hover:shadow-[#E41E26]/25 cursor-pointer"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {isSubmitting ? (
                            <>
                              <FaSpinner className="animate-spin" />
                              <span>جاري الحفظ...</span>
                            </>
                          ) : (
                            <>
                              <FaSave className="text-xs sm:text-sm" />
                              <span>{editingId ? "تحديث" : "إنشاء"}</span>
                            </>
                          )}
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
    </>
  );
}
