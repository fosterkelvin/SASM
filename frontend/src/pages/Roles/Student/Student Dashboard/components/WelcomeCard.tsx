import { BookOpen, Building2, Briefcase } from "lucide-react";

interface WelcomeCardProps {
  traineeOffice?: string;
  traineeStatus?: string;
}

const WelcomeCard = ({ traineeOffice, traineeStatus }: WelcomeCardProps) => {
  const isTrainee =
    traineeStatus === "trainee" || traineeStatus === "training_completed";

  return (
    <div className="bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700/60 p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Welcome Section */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 dark:from-red-600 dark:to-red-800 rounded-xl flex items-center justify-center shadow-md">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Welcome to SASM-IMS
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Student Assistant and Student Marshal Information Management
                System
              </p>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            This dashboard provides you with an overview of your important
            information and quick access to essential features.
          </p>
        </div>

        {/* Trainee Office Badge - Prominent placement */}
        {isTrainee && traineeOffice && (
          <div className="lg:flex-shrink-0">
            <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 dark:from-blue-600 dark:via-blue-700 dark:to-blue-800 rounded-2xl p-6 shadow-xl border-2 border-blue-400/30 dark:border-blue-500/30 overflow-hidden">
              {/* Decorative background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="w-4 h-4 text-blue-100" />
                      <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">
                        Current Deployment
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-white leading-tight">
                      {traineeOffice}
                    </p>
                  </div>
                </div>

                {/* Status badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-white">
                    {traineeStatus === "training_completed"
                      ? "Training Completed"
                      : "Active Trainee"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeCard;
