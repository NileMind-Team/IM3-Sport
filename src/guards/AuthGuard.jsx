import { Navigate, Outlet, useLocation } from "react-router-dom";

const AuthGuard = () => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/auth",
    "/auth/verify-email-address",
    "/reset-password",
    "/product",
  ];

  const isPublicRoute = publicRoutes.some(
    (route) =>
      location.pathname === route || location.pathname.startsWith(route + "/"),
  );

  if (!token && !isPublicRoute) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
