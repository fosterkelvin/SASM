import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DefNav from "@/navbar/DefNav";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <DefNav />
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
        <p className="text-2xl text-gray-700 dark:text-gray-300 mb-8">
          Oops! Page not found.
        </p>
        <Button
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
          onClick={() => navigate("/")}
        >
          Go back home
        </Button>
      </div>
    </>
  );
};

export default NotFound;
