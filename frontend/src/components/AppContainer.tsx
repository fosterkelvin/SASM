import { Navigate, Outlet } from "react-router-dom";
import UserMenu from "./UserMenu";
import { useAuth } from "@/context/AuthContext";

const AppContainer = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="w-screen h-[90vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{
          redirectUrl: window.location.pathname,
        }}
      />
    );
  }

  return (
    <div className="p-4 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <UserMenu />
      <Outlet />
    </div>
  );
};

export default AppContainer;
