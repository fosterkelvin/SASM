import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PersonalInfoAlertProps {
  missingFields: string[];
}

const PersonalInfoAlert = ({ missingFields }: PersonalInfoAlertProps) => {
  const navigate = useNavigate();

  if (missingFields.length === 0) return null;

  return (
    <Card className="mb-6 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
              Complete Your Personal Information
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
              You need to complete your personal information before you can
              apply for a position. Please fill in the following required
              fields: <strong>{missingFields.join(", ")}</strong>
            </p>
            <Button
              size="sm"
              onClick={() => navigate("/profile")}
              className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800 text-white"
            >
              Complete Profile Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoAlert;
