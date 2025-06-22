import { useState, useEffect } from "react";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "@/components/ui/menubar";
import { Sun, Moon, Menu, X } from "lucide-react";

const StudentNav = () => {
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
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden text-gray-200 dark:text-gray-200"
      >
        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Full-Width Menu (Only Visible on Mobile) */}
      <div
        className={`absolute top-14 left-0 w-full bg-red-700 dark:bg-red-900 py-4 flex flex-col items-center gap-4 text-gray-200 dark:text-gray-200 transition-all ${
          isMenuOpen ? "block" : "hidden"
        }`}
      >
        <MenubarMenu>
          <MenubarTrigger>Menu</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Dashboard</MenubarItem>
            <MenubarItem>Settings</MenubarItem>
          </MenubarContent>
        </MenubarMenu>

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

export default StudentNav;
