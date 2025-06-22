// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { getUser, signin, signout, signup } from "@/lib/api";

interface AuthContextProps {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUser()
      .then((userData) => {
        setUser(userData);
      })
      .catch((err) => {
        console.groupCollapsed("%c🔴 User Load Error", "color: red; font-weight: bold");
      
        if (err.response) {
          console.log("🔸 Status:", err.response.status);
          console.log("🔸 Message:", err.response.data?.message);
          console.log("🔸 Full Response:", err.response);
        } else if (err.request) {
          console.warn("⚠️ No response received:", err.request);
        } else {
          console.error("❌ Error setting up request:", err.message);
        }
      
        console.groupEnd();
      
        setUser(null);
      })      
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (data: any) => {
    await signin(data);
    const userData = await getUser();
    setUser(userData);
  };

  const logout = async () => {
    try {
      const response = await signout();
      console.log(
        "Signout successful:",
        response.data?.message ?? "No message returned"
      );
      setUser(null);
    } catch (error: any) {
      if (error.response) {
        console.error("Signout failed with response:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Signout error:", error.message);
      }
    }
  };

  const register = async (data: any) => {
    await signup(data);
    const userData = await getUser();
    setUser(userData);
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
