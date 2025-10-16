import { AlertCircle, AlertTriangle, Info, Zap } from "lucide-react";

interface PriorityBadgeProps {
  priority: "low" | "medium" | "high" | "urgent";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const PriorityBadge = ({
  priority,
  size = "md",
  showIcon = true,
}: PriorityBadgeProps) => {
  const priorityConfig = {
    urgent: {
      label: "Urgent",
      icon: Zap,
      classes:
        "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    },
    high: {
      label: "High",
      icon: AlertTriangle,
      classes:
        "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
    },
    medium: {
      label: "Medium",
      icon: AlertCircle,
      classes:
        "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    },
    low: {
      label: "Low",
      icon: Info,
      classes:
        "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
    },
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${config.classes} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={iconSizeClasses[size]} />}
      {config.label}
    </span>
  );
};
