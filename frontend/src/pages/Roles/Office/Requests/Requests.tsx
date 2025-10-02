import { useState } from "react";
import OfficeSidebar from "@/components/sidebar/OfficeSidebar";
import RequestForm from "./components/RequestForm";
import { Card, CardContent } from "@/components/ui/card";

const RequestsPage: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900">
      <OfficeSidebar
        currentPage="Requests"
        onCollapseChange={setIsSidebarCollapsed}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <div
          className={`hidden md:flex items-center gap-4 fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <h1 className="text-2xl font-bold text-white ml-4">Requests</h1>
        </div>

        <div className="p-4 md:p-10 mt-12">
          <Card className="max-w-6xl mx-auto">
            <CardContent className="p-6 md:p-8">
              <div className="text-center mb-6 md:mb-8 border-b pb-4 md:pb-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-4">
                  <img
                    src="/UBLogo.svg"
                    alt="University Logo"
                    className="h-12 sm:h-14 md:h-16 w-auto"
                  />
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200">
                      Requests
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-red-600 dark:text-red-400">
                      Create scholar requests. Specify the number of scholars
                      and the types of needs.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="max-w-4xl mx-auto">
                  <RequestForm />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RequestsPage;
