import { Routes, Route, Outlet } from "react-router-dom";
import Signin from "./pages/Auth/SigninPage";
import Signup from "./pages/Auth/SignupPage";
import StudentDashboard from "./pages/Roles/Student/Student Dashboard/StudentDashboard";
import HRDashboard from "./pages/Roles/HR/HR Dashboard/HRDashboard";
import OfficeDashboard from "./pages/Roles/Office/Office Dashboard/OfficeDashboard";
import OfficeEvaluationPage from "./pages/Roles/Office/Evaluation/Evaluation";
import OfficeLeaveRequests from "./pages/Roles/Office/Leave Requests";
import OfficeRequests from "./pages/Roles/Office/Requests/Requests";
import Home from "./pages/Auth/home";
import Profile from "./pages/Auth/Profile/Profile";
import Application from "./pages/Roles/Student/Apply/Application";
import HRApplicationManagement from "./pages/Roles/HR/Application Management/ApplicationManagement";
import LeaveManagement from "./pages/Roles/HR/Leave Management/LeaveManagement";
import ReApplicationManagement from "./pages/Roles/HR/ReApplication Management/ReApplicationManagement";
import Users from "./pages/Roles/HR/Users/Users";
import EvaluationManagement from "./pages/Roles/HR/Evaluation Management/EvaluationManagement";
import TraineeManagement from "./pages/Roles/HR/Trainee Management/TraineeManagement";
import Scholars from "./pages/Roles/Office/Scholars/Scholars";
import MyTrainees from "./pages/Roles/Office/MyTrainees";
import OfficeDTRCheck from "./pages/Roles/Office/OfficeDTRCheck";
import HRDTRCheck from "./pages/Roles/HR/DTR Check/HRDTRCheck";
import Notifications from "./pages/Utils/Notifications";
import Analytics from "./pages/Roles/HR/Analytics/Analytics";
import PublicRoute from "./routes/PublicRoute";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";
import NotFound from "@/pages/Utils/NotFound";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import AppContainer from "./components/AppContainer";
import { ReactElement } from "react";
import { useState, useEffect } from "react";
import ReApply from "./pages/Roles/Student/ReApply/ReApply";
import Leave from "./pages/Roles/Student/Leave/Leave";
import Grades from "./pages/Roles/Student/Grades/Grades";
import Schedule from "./pages/Roles/Student/Schedule/Schedule";
import Dtr from "./pages/Roles/Student/DTR/Dtr";
import Requirements from "./pages/Roles/Student/Requirements/Requirements";
import HRRequirementsManagement from "./pages/Roles/HR/Requirements Management/RequirementsManagement";
import ProfileSelector from "./pages/Auth/ProfileSelector/ProfileSelector";
import AuditLogs from "./pages/Roles/Office/AuditLogs/AuditLogs";
import OfficeProfile from "./pages/Roles/Office/Profile/OfficeProfile";
// Small layout components to group routes
const PublicLayout = (): ReactElement => <Outlet />;

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

      {/* Protected routes: group under a shared layout (AppContainer) wrapped with RoleProtectedRoute */}
      <Route
        element={
          <RoleProtectedRoute>
            <AppContainer />
          </RoleProtectedRoute>
        }
      >
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/application" element={<Application />} />
        <Route path="/grades" element={<Grades />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/re-apply" element={<ReApply />} />
        <Route path="/leave" element={<Leave />} />
        <Route path="/dtr" element={<Dtr />} />
        <Route path="/requirements" element={<Requirements />} />
        <Route path="/hr/requirements" element={<HRRequirementsManagement />} />
        <Route path="/hr/analytics" element={<Analytics />} />
        <Route path="/hr-dashboard" element={<HRDashboard />} />
        <Route path="/office-dashboard" element={<OfficeDashboard />} />
        <Route path="/office/dtr-check" element={<OfficeDTRCheck />} />
        <Route path="/office/evaluation" element={<OfficeEvaluationPage />} />
        <Route path="/office/scholars" element={<Scholars />} />
        <Route path="/office/my-trainees" element={<MyTrainees />} />
        <Route
          path="/office/leave-requests"
          element={<OfficeLeaveRequests />}
        />
        <Route path="/office/requests" element={<OfficeRequests />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/office/profile" element={<OfficeProfile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/applications" element={<HRApplicationManagement />} />
        <Route path="/leave-management" element={<LeaveManagement />} />
        <Route path="/reapplications" element={<ReApplicationManagement />} />
        <Route path="/hr/users" element={<Users />} />
        <Route path="/hr/evaluations" element={<EvaluationManagement />} />
        <Route path="/hr/trainees" element={<TraineeManagement />} />
        <Route path="/hr/dtr-check" element={<HRDTRCheck />} />

        {/* Netflix-style Profile Selector - Must be outside AppContainer for full-screen effect */}
      </Route>

      {/* Profile Selector - Full screen layout (outside AppContainer) */}
      <Route
        element={
          <RoleProtectedRoute>
            <Outlet />
          </RoleProtectedRoute>
        }
      >
        <Route path="/profile-selector" element={<ProfileSelector />} />
        <Route path="/office/audit-logs" element={<AuditLogs />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
