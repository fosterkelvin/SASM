import { useState, useEffect, useRef } from "react";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "@/components/ui/menubar";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const HRNav = () => {
  const { logout } = useAuth();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // Auto-close mobile menu on screen resize (fix bug)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isClickOutsideMenu =
        mobileMenuRef.current && !mobileMenuRef.current.contains(target);
      const isClickOutsideToggle =
        toggleButtonRef.current && !toggleButtonRef.current.contains(target);

      if (isClickOutsideMenu && isClickOutsideToggle) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close mobile menu when pressing Escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isMenuOpen]);

  return (
    <Menubar className="fixed w-full shadow-md px-6 md:px-10 flex items-center justify-between bg-red-600 dark:bg-red-700 rounded-none border-none h-15">
      {/* Logo and Title (Left Side) */}
      <div className="flex items-center gap-2">
        <img src="/UBLogo.svg" alt="Logo" className="h-8 w-auto" />
        <span className="text-xl font-semibold text-gray-200 dark:text-gray-200">
          SASM-IMS
        </span>
      </div>

      {/* Desktop Menu & Theme Switcher */}
      <div className="hidden md:flex items-center gap-6 text-gray-200 dark:text-gray-200">
        {/* Menu Dropdown */}
        <MenubarMenu>
          <MenubarTrigger>Menu</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Dashboard</MenubarItem>
            <MenubarItem>Settings</MenubarItem>
            <MenubarItem onClick={logout}>Signout</MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* Divider */}
        <span className="text-gray-200 dark:text-gray-200">|</span>

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

      {/* Mobile Menu Toggle (☰ / ❌) */}
      <button
        ref={toggleButtonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden text-gray-200 dark:text-gray-200 p-2 rounded-lg transition-all duration-200 hover:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-400"
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-menu"
      >
        <div className="relative w-6 h-6">
          <Menu
            size={24}
            className={`absolute transition-all duration-300 ${
              isMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
            }`}
          />
          <X
            size={24}
            className={`absolute transition-all duration-300 ${
              isMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
            }`}
          />
        </div>
      </button>

      {/* Mobile Full-Width Menu (Only Visible on Mobile) */}
      <div
        ref={mobileMenuRef}
        id="mobile-menu"
        className={`absolute top-full left-0 w-full bg-red-700 dark:bg-red-900 shadow-lg transition-all duration-300 ease-in-out transform ${
          isMenuOpen
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-4 invisible"
        } md:hidden`}
        aria-hidden={!isMenuOpen}
      >
        <div className="py-4 px-6 flex flex-col gap-4">
          {/* Menu Items */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                // Add navigation logic for Dashboard
              }}
              className="text-left text-gray-200 dark:text-gray-200 py-2 px-4 rounded-lg transition-all duration-200 hover:bg-red-600 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-400"
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                // Add navigation logic for Settings
              }}
              className="text-left text-gray-200 dark:text-gray-200 py-2 px-4 rounded-lg transition-all duration-200 hover:bg-red-600 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-400"
            >
              Settings
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                logout();
              }}
              className="text-left text-gray-200 dark:text-gray-200 py-2 px-4 rounded-lg transition-all duration-200 hover:bg-red-600 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-400"
            >
              Signout
            </button>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-red-600 dark:bg-red-800"></div>

          {/* Theme Switcher */}
          <div className="flex items-center justify-between">
            <span className="text-gray-200 dark:text-gray-200 text-sm">
              Theme
            </span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg transition-all duration-200 hover:bg-red-600 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-400"
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-200" />
              )}
            </button>
          </div>
        </div>
      </div>
    </Menubar>
  );
};

export default HRNav;
