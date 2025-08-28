// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { getUser, signin, signout, signup } from "@/lib/api";
import { getRoleBasedRedirect } from "@/lib/roleUtils";
import { useInactivityTimer } from "@/hooks/useInactivityTimer";
import { useToast } from "./ToastContext";

interface AuthContextProps {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<{ redirectUrl?: string }>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<{ message?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  // Auto-signout timeout: 1 hour (60 minutes)
  const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
  const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before timeout

  const handleInactivityTimeout = () => {
    console.log("Auto-signout due to inactivity");
    addToast("You have been signed out due to inactivity.", "warning", 5000);
    logout();
  };

  const handleInactivityWarning = () => {
    console.log("Warning: Session will expire in 5 minutes due to inactivity");
    addToast(
      "Your session will expire in 5 minutes due to inactivity. Please interact with the page to stay logged in.",
      "warning",
      10000 // Show for 10 seconds
    );
  };

  // Use the inactivity timer hook
  useInactivityTimer({
    timeout: INACTIVITY_TIMEOUT,
    onTimeout: handleInactivityTimeout,
    enabled: !!user && !isLoading,
    warningTime: WARNING_TIME,
    onWarning: handleInactivityWarning,
  });

  useEffect(() => {
    getUser()
      .then((userData) => {
        setUser(userData.data);
      })
      .catch(() => {
        // Error is already handled by the API interceptor
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (data: any) => {
    const signinResponse = await signin(data);
    const userData = await getUser();
    setUser(userData.data);
    // Prefer server-provided redirectUrl but fallback to a role-based URL
    // computed from the freshly fetched user to avoid navigation loops.
    const redirectUrl =
      signinResponse?.redirectUrl ||
      getRoleBasedRedirect(userData?.data?.role || "");

    return { redirectUrl };
  };

  const logout = async () => {
    try {
      // Always clear user state first to update UI immediately
      setUser(null);

      // Then attempt to call signout endpoint
      const response = await signout();
      console.log(
        "Signout successful:",
        response.data?.message ?? "No message returned"
      );
    } catch (error: any) {
      if (error.response) {
        console.error("Signout failed with response:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Signout error:", error.message);
      }
      // User is already set to null above
    }

    // Force a page reload to clear any remaining state and ensure cookies are cleared
    if (typeof window !== "undefined") {
      window.location.href = "/signin";
    }
  };

  const register = async (data: any) => {
    // Signup no longer automatically signs in the user
    const signupResponse = await signup(data);
    // Don't call getUser() or set user data - user needs to verify email first
    return { message: signupResponse.message };
  };

  const refreshUser = async () => {
    try {
      const userData = await getUser();
      setUser(userData.data);
    } catch (error) {
      // Error is already handled by the API interceptor
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
