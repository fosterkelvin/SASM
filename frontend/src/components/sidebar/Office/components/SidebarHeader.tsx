import React from "react";
import { Menu } from "lucide-react";

interface Props {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const SidebarHeader: React.FC<Props> = ({ collapsed, onToggleCollapse }) => {
  return (
    <div
      className={`hidden md:flex transition-all duration-300 ${
        collapsed ? "px-4 py-10" : "px-6 py-10"
      } border-b border-red-200 dark:border-red-800 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 items-center h-[73px]`}
    >
      <div
        className={`flex items-center w-full ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        <div
          className={`flex items-center ${
            collapsed ? "flex-col gap-2" : "gap-3"
          } flex-1 min-w-0`}
        >
          <div
            className={`relative transition-all duration-300 ${
              collapsed ? "transform hover:scale-110" : ""
            }`}
          >
            <img
              src="/UBLogo.svg"
              alt="Logo"
              className={`w-auto flex-shrink-0 transition-all duration-300 drop-shadow-sm ${
                collapsed ? "h-12" : "h-10"
              }`}
            />
            {collapsed && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white rounded-full opacity-90"></div>
            )}
          </div>
          {!collapsed && (
            <span className="text-base font-bold text-white dark:text-white tracking-tight whitespace-nowrap">
              SASM-IMS
            </span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            className="group p-3 rounded-xl text-white dark:text-white bg-red-700/30 hover:bg-red-800 dark:hover:bg-red-700 hover:text-white dark:hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl border border-red-400/50 hover:border-red-300 dark:hover:border-red-600 backdrop-blur-sm flex-shrink-0"
            aria-label="Collapse sidebar"
          >
            <Menu
              size={20}
              className="transform group-hover:scale-110 transition-transform duration-200 drop-shadow-sm"
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default SidebarHeader;
