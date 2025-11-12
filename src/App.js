import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ConfirmEmail from "./pages/ConfirmEmail";
import ResetPassword from "./pages/ResetPassword";
import AuthPage from "./pages/AuthPage";
import Profile from "./pages/Profile";

function App() {
  const location = useLocation();

  const hideNavbarFooterPaths = [
    "/login",
    "/register",
    "/auth/verify-email-address",
    "/reset-password",
    "/profile",
  ];

  const shouldShowNavbarFooter = !hideNavbarFooterPaths.includes(
    location.pathname
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      {shouldShowNavbarFooter && <Navbar />}

      {/* Main content */}
      <main className="flex-grow w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/auth/verify-email-address" element={<ConfirmEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
