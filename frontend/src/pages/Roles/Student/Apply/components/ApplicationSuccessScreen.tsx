import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface ApplicationSuccessScreenProps {
  submitMessage: string;
  onOkay: () => void;
  renderSidebar: () => React.ReactNode;
  isSidebarCollapsed: boolean;
}

const ApplicationSuccessScreen: React.FC<ApplicationSuccessScreenProps> = ({
  submitMessage,
  onOkay,
  renderSidebar,
  isSidebarCollapsed,
}) => (
  <div className="flex min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
    {renderSidebar()}
    <div
      className={`flex-1 pt-16 md:pt-0 transition-all duration-300 ${
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
        <h1 className="text-2xl font-bold text-white dark:text-white ml-4">
          Application Submitted Successfully
        </h1>
      </div>
      <div className="p-4 md:p-10 flex items-center justify-center min-h-screen">
        <Card className="bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 max-w-2xl w-full mx-4 border border-green-100 dark:border-green-700/60 shadow-lg">
          <CardContent className="p-6 md:p-8 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  Application Submitted Successfully!
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
                  {submitMessage}
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Next Steps:</strong>
                    <br />
                    1. Check your email for a confirmation message
                    <br />
                    2. Wait for HR to review your application
                    <br />
                    3. You will receive email notifications for any status
                    updates
                    <br />
                    4. You will be contacted if selected for an interview
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

export default ApplicationSuccessScreen;
