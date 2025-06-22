import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signin from "./pages/SigninPage";
import Signup from "./pages/SignupPage";
import StudentDashboard from "./pages/Roles/Student/StudentDashboard";
import Home from "./pages/home";
import Dashboard from "./pages/Dashboard";
import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import NotFound from "@/pages/NotFound";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        }
      />
      <Route
        path="/signin"
        element={
          <PublicRoute>
            <Signin />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/email/verify/:code" element={<VerifyEmail />} />
      <Route path="/password/forgot" element={<ForgotPassword />} />
      <Route path="/password/reset" element={<PublicRoute><ResetPassword /></PublicRoute>} />

      {/* catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
