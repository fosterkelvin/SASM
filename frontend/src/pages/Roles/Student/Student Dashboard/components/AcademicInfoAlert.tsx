import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AcademicInfoAlertProps {
  missingFields: string[];
}

const AcademicInfoAlert = ({ missingFields }: AcademicInfoAlertProps) => {
  const navigate = useNavigate();

  if (missingFields.length === 0) return null;

  return (
    <Card className="mb-6 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-1">
              Complete Your Academic Information
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
              As a deployed scholar, you need to complete your academic
              information before you can submit leave applications. Please fill
              in the following required fields:{" "}
              <strong>{missingFields.join(", ")}</strong>
            </p>
            <Button
              size="sm"
              onClick={() => navigate("/profile")}
              className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800 text-white"
            >
              Complete Profile Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AcademicInfoAlert;
