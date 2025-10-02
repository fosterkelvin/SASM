import React from "react";
import { Menu, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  title?: string;
  subtitle?: string;
}

const MobileHeader: React.FC<Props> = ({
  isOpen,
  onToggle,
  title = "SASM-IMS",
  subtitle = "Dashboard",
}) => {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-red-600 dark:bg-red-700 shadow-md z-[100] h-16">
      <div className="flex items-center h-full">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg text-white hover:bg-red-700 dark:hover:bg-red-800 transition-colors duration-200 ml-4 mr-2 z-[101]"
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={isOpen}
          aria-controls="student-sidebar"
        >
          <div className="relative w-6 h-6">
            <Menu
              size={24}
              className={`absolute transition-all duration-300 ${
                isOpen ? "opacity-0 rotate-180" : "opacity-100 rotate-0"
              }`}
            />
            <X
              size={24}
              className={`absolute transition-all duration-300 ${
                isOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-180"
              }`}
            />
          </div>
        </button>
        <div className="flex items-center gap-3 pl-6">
          <img src="/UBLogo.svg" alt="Logo" className="h-6 w-auto" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">{title}</span>
            <span className="text-xs text-red-200">{subtitle}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
