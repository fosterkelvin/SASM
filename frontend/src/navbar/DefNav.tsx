import { useState, useEffect } from "react";
import { Menubar } from "@/components/ui/menubar";
import { Sun, Moon } from "lucide-react";

const NoAuthNav = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // Apply theme on mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <Menubar className="no-select fixed w-full shadow-md px-6 md:px-10 flex items-center justify-between bg-red-600 dark:bg-red-700 rounded-none border-none h-15">
      {/* Logo and Title (Left Side) */}
      <div className="flex items-center gap-2">
        <img src="/UBLogo.svg" alt="Logo" className="h-8 w-auto" />
        <span className="text-xl font-semibold font-mono text-gray-200 dark:text-gray-200">
          SASM-IMS
        </span>
      </div>

      {/* Theme Switcher */}
      <div className="flex items-center gap-6 text-gray-200 dark:text-gray-200">
        {/* Theme Switcher */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-1 rounded-full transition duration-300 hover:bg-red-600 dark:hover:bg-gray-800"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-800" />
          )}
        </button>
      </div>
    </Menubar>
  );
};

export default NoAuthNav;
