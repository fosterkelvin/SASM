import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface ApplicationWithdrawnScreenProps {
  submitMessage: string;
  onOkay: () => void;
  renderSidebar: () => React.ReactNode;
  isSidebarCollapsed: boolean;
}

const ApplicationWithdrawnScreen: React.FC<ApplicationWithdrawnScreenProps> = ({
  submitMessage,
  onOkay,
  renderSidebar,
  isSidebarCollapsed,
}) => (
  <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
    {renderSidebar()}
    <div
      className={`flex-1 pt-20 transition-all duration-300 ${
        isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
      }`}
    >
      <div
        className={`hidden md:flex fixed top-0 right-0 z-30 items-center bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-700/60 p-4 md:p-6 transition-all duration-300 ${
          isSidebarCollapsed ? "md:left-20" : "md:left-64"
        }`}
      >
        <h1 className="text-2xl font-bold text-white dark:text-white">
          Application Withdrawn Successfully
        </h1>
      </div>
      <div className="p-4 md:p-10 flex items-center justify-center min-h-screen">
        <Card className="bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 max-w-2xl w-full mx-4 border border-red-200 dark:border-red-700/60 shadow-lg">
          <CardContent className="p-6 md:p-8 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-red-800 dark:text-red-200">
                  Application Withdrawn Successfully!
                </h1>
                <p className="text-lg text-gray-700 dark:text-gray-400 max-w-md">
                  {submitMessage}
                </p>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/60 rounded-lg p-4">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    Your application has been completely removed from our
                    system. If you change your mind, you can submit a new
                    application at any time.
                  </p>
                </div>
              </div>
              <Button
                onClick={onOkay}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Okay
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export default ApplicationWithdrawnScreen;
