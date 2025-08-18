import { Routes, Route } from "react-router-dom";
import Signin from "./pages/Auth/SigninPage";
import Signup from "./pages/Auth/SignupPage";
import StudentDashboard from "./pages/Roles/Student/StudentDashboard";
import HRDashboard from "./pages/Roles/HR/HRDashboard";
import OfficeDashboard from "./pages/Roles/Office/OfficeDashboard";
import Home from "./pages/Auth/home";
import Profile from "./pages/Auth/Profile";
import Application from "./pages/Roles/Student/Application";
import ApplicationManagement from "./pages/Roles/HR/ApplicationManagement";
import Notifications from "./pages/Utils/Notifications";
import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import NotFound from "@/pages/Utils/NotFound";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import AppContainer from "./components/AppContainer";
import { ReactElement } from "react";
import { useState, useEffect } from "react";

const withPublic = (element: ReactElement): ReactElement => (
  <PublicRoute>{element}</PublicRoute>
);

const withProtected = (element: ReactElement): ReactElement => (
  <ProtectedRoute>{element}</ProtectedRoute>
);

function App(): ReactElement {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for demonstration, replace with actual logic if needed
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%)",
          animation: "fadeIn 0.7s",
        }}
      >
        <img
          src={"/UBLogo.svg"}
          alt="UB Logo"
          style={{ width: "90px", height: "90px", marginBottom: "32px" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              border: "8px solid #e0e7ff",
              borderTop: "8px solid #6366f1",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
        <div
          style={{
            fontSize: "1.25rem",
            color: "#6366f1",
            fontWeight: 500,
            letterSpacing: "0.05em",
          }}
        >
          Loading, please wait...
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={withPublic(
          <>
            <AppContainer />
            <Home />
          </>
        )}
      />
      <Route path="/signin" element={withPublic(<Signin />)} />
      <Route path="/signup" element={withPublic(<Signup />)} />
      <Route path="/password/forgot" element={withPublic(<ForgotPassword />)} />
      <Route path="/password/reset" element={withPublic(<ResetPassword />)} />

      {/* Protected Routes */}
      <Route
        path="/student-dashboard"
        element={withProtected(<StudentDashboard />)}
      />
      <Route path="/HR-dashboard" element={withProtected(<HRDashboard />)} />
      <Route
        path="/office-dashboard"
        element={withProtected(<OfficeDashboard />)}
      />
      <Route path="/profile" element={withProtected(<Profile />)} />
      <Route path="/notifications" element={withProtected(<Notifications />)} />
      <Route path="/application" element={withProtected(<Application />)} />
      <Route
        path="/applications"
        element={withProtected(<ApplicationManagement />)}
      />

      {/* Standalone Routes */}
      <Route path="/email/verify/:code" element={<VerifyEmail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
