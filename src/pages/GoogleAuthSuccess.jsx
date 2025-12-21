import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loginUser } from "../redux/slices/loginSlice";
import Swal from "sweetalert2";

export default function GoogleAuthSuccess() {
  const { getToken, isSignedIn } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    const syncWithBackend = async () => {
      if (!isSignedIn) return;

      try {
        const token = await getToken();

        const res = await axios.post(
          "https://restaurant-template.runasp.net/api/auth/clerk-login",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        if (res.data?.token) {
          dispatch(loginUser.fulfilled(res.data));

          Swal.fire({
            icon: "success",
            title: "Login successful",
            showConfirmButton: false,
            timer: 1500,
          });

          window.location.href = "/";
        } else {
          Swal.fire({
            icon: "error",
            title: "Login failed",
            text: "Unable to login with Google. Please try again.",
          });
          window.location.href = "/login";
        }
      } catch (err) {
        console.log("Google login error:", err);
        Swal.fire({
          icon: "error",
          title: "An error occurred",
          text: "Please check your connection or try again later",
        });
        window.location.href = "/login";
      }
    };

    syncWithBackend();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, dispatch]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-600 dark:text-gray-300 text-lg">
        Logging you in...
      </p>
    </div>
  );
}
