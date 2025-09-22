import { Building2 } from "lucide-react";

const WelcomeCard = () => {
  return (
    <div className="bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-lg border border-red-100 dark:border-red-700/60 p-6 mb-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-700 dark:from-red-700 dark:to-red-900 rounded-lg flex items-center justify-center">
          <Building2 className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-red-200">
            Welcome to SASM-IMS
          </h2>
          <p className="text-red-600 dark:text-red-400 font-medium">
            Office Management System
          </p>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
        Your comprehensive administrative portal for managing office operations,
        staff records, academic programs, and institutional resources.
        Streamline your workflow and maintain efficient oversight of all office
        activities.
      </p>
    </div>
  );
};

export default WelcomeCard;
