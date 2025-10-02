import React from "react";

interface SidebarItemProps {
  label: string;
  onClick: () => void;
  IconComponent: React.ComponentType<any>;
  badge?: string | number | null;
  className?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  onClick,
  IconComponent,
  badge,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center gap-3 px-4 py-3.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-red-700 dark:hover:text-red-400 rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-red-200 dark:hover:border-red-800 ${className}`}
      tabIndex={0}
      aria-label={label}
      title={label}
    >
      <div className="relative">
        <IconComponent
          size={20}
          className="group-hover:scale-110 transition-transform duration-200"
        />
        {badge ? (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {badge}
          </span>
        ) : null}
      </div>
      <span className="font-medium">{label}</span>
    </button>
  );
};

export default SidebarItem;
