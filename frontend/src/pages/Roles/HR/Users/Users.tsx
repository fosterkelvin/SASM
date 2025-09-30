import React, { useEffect, useState } from "react";
import HRSidebar from "@/components/sidebar/HR/HRSidebar";
import UsersList from "./components/UsersList";
import UserFilters from "./components/UserFilters";
import UserModal from "./components/UserModal";
import type { UserRow } from "./types";

// Frontend-only mock users
const mockUsers: UserRow[] = [
  {
    _id: "u1",
    firstName: "Alice",
    lastName: "Mendez",
    email: "alice@example.com",
    role: "hr",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "u2",
    firstName: "Ben",
    lastName: "Lopez",
    email: "ben@example.com",
    role: "student",
    status: "inactive",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
];

const Users: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [data, setData] = useState<UserRow[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<UserRow | null>(null);

  useEffect(() => {
    document.title = "Users | SASM-IMS";
  }, []);

  const filtered = data.filter((d) => {
    const s = searchTerm.trim().toLowerCase();
    if (s) {
      const match =
        d.firstName.toLowerCase().includes(s) ||
        d.lastName.toLowerCase().includes(s) ||
        d.email.toLowerCase().includes(s);
      if (!match) return false;
    }
    if (roleFilter && d.role !== roleFilter) return false;
    if (statusFilter && d.status !== statusFilter) return false;
    return true;
  });

  const openUser = (u: UserRow) => setSelected(u);
  const closeModal = () => setSelected(null);

  const saveUser = (u: UserRow) => {
    setData((prev) => prev.map((p) => (p._id === u._id ? { ...p, ...u } : p)));
    closeModal();
  };

  const updateSelected = (patch: Partial<UserRow>) => {
    setSelected((s) => (s ? { ...s, ...patch } : s));
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20">
      <HRSidebar currentPage="Users" onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`flex-1 pt-16 md:pt-[81px] transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <div
          className={`hidden md:flex items-center gap-4 fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <h1 className="text-2xl font-bold text-white ml-4">Users</h1>
        </div>

        <div className="p-6 md:p-10">
          <UserFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            roleFilter={roleFilter}
            onRoleChange={setRoleFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />

          <UsersList data={filtered} onOpen={openUser} />
        </div>
      </div>

      <UserModal
        user={selected}
        onClose={closeModal}
        onSave={saveUser}
        onChange={updateSelected}
      />
    </div>
  );
};

export default Users;
