import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { signout } from "../lib/api";

const UserMenu = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: signOut } = useMutation({
    mutationFn: signout,
    onSettled: () => {
      queryClient.clear();
      navigate("/signin", { replace: true });
    },
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="absolute bottom-6 left-6" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full w-10 h-10 bg-gray-300 flex items-center justify-center hover:bg-gray-400"
      >
        <img
          src="#"
          alt="User Avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
      </button>

      {open && (
        <div className="mt-2 w-40 bg-white shadow-md rounded-md py-2 z-50 absolute">
          <button
            onClick={() => navigate("/")}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Profile
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Settings
          </button>
          <button
            onClick={() => signOut()}
            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
