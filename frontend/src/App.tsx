import { Routes, Route } from "react-router-dom";
import Signin from "./pages/SigninPage";
import Signup from "./pages/SignupPage";
import StudentDashboard from "./pages/Roles/Student/StudentDashboard";
import HRDashboard from "./pages/Roles/HR/HRDashboard";
import OfficeDashboard from "./pages/Roles/Office/OfficeDashboard";
import Home from "./pages/home";
import Profile from "./pages/Profile";
import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import NotFound from "@/pages/NotFound";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AppContainer from "./components/AppContainer";
import { ReactElement } from "react";

const withPublic = (element: ReactElement): ReactElement => (
  <PublicRoute>{element}</PublicRoute>
);

const withProtected = (element: ReactElement): ReactElement => (
  <ProtectedRoute>{element}</ProtectedRoute>
);

function App(): ReactElement {
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

      {/* Standalone Routes */}
      <Route path="/email/verify/:code" element={<VerifyEmail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
