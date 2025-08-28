import { Routes, Route, Outlet } from "react-router-dom";
import Signin from "./pages/Auth/SigninPage";
import Signup from "./pages/Auth/SignupPage";
import StudentDashboard from "./pages/Roles/Student/StudentDashboard";
import HRDashboard from "./pages/Roles/HR/HRDashboard";
import OfficeDashboard from "./pages/Roles/Office/OfficeDashboard";
import Home from "./pages/Auth/home";
import Profile from "./pages/Auth/Profile";
import Application from "./pages/Roles/Student/Apply/Application";
import HRApplicationManagement from "./pages/Roles/HR/ApplicationManagement";
import Notifications from "./pages/Utils/Notifications";
import PublicRoute from "./routes/PublicRoute";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";
import NotFound from "@/pages/Utils/NotFound";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import AppContainer from "./components/AppContainer";
import { ReactElement } from "react";
import { useState, useEffect } from "react";
// Small layout components to group routes
const PublicLayout = (): ReactElement => (
  <>
    <AppContainer />
    <Outlet />
  </>
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
      {/* Public routes grouped under a public layout so shared UI (AppContainer) renders once */}
      <Route
        element={
          <PublicRoute>
            <PublicLayout />
          </PublicRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/password/reset" element={<ResetPassword />} />
        <Route path="/email/verify/:code" element={<VerifyEmail />} />
      </Route>

      {/* Protected routes: each route wrapped with RoleProtectedRoute to enforce role-based access */}
      <Route
        path="/student-dashboard"
        element={
          <RoleProtectedRoute>
            <StudentDashboard />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/application"
        element={
          <RoleProtectedRoute>
            <Application />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/hr-dashboard"
        element={
          <RoleProtectedRoute>
            <HRDashboard />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/office-dashboard"
        element={
          <RoleProtectedRoute>
            <OfficeDashboard />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <RoleProtectedRoute>
            <Profile />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <RoleProtectedRoute>
            <Notifications />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/applications"
        element={
          <RoleProtectedRoute>
            <HRApplicationManagement />
          </RoleProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
