import React, { useEffect, useState } from "react";
import HRSidebar from "@/components/sidebar/HR/HRSidebar";
import UsersList from "./components/UsersList";
import UserFilters from "./components/UserFilters";
import UserModal from "./components/UserModal";
import API from "@/config/apiClient";
import type { UserRow } from "./types";

const Users: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [data, setData] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<UserRow | null>(null);

  useEffect(() => {
    document.title = "Users | SASM-IMS";
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching users from /users endpoint...");
      // Add a dummy query parameter to trigger getUsersHandler instead of getUserHandler
      const response = await API.get("/users", { params: { all: "true" } });
      console.log("API response:", response);
      console.log("API response.data:", response.data);

      // The API returns { users: [...], count: number }
      if (response.data && response.data.users) {
        // Map the API response to match our UserRow type
        const mappedUsers = response.data.users.map((user: any) => ({
          ...user,
          firstName: user.firstname,
          lastName: user.lastname,
        }));
        console.log("Mapped users:", mappedUsers);
        setData(mappedUsers);
      } else {
        console.warn("No users found in response");
        setData([]);
      }
    } catch (err: any) {
      console.error("Error fetching users:", err);
      console.error("Error details:", err.response);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch users"
      );
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.filter((d) => {
    const s = searchTerm.trim().toLowerCase();
    if (s) {
      const firstName = d.firstName || d.firstname || "";
      const lastName = d.lastName || d.lastname || "";
      const match =
        firstName.toLowerCase().includes(s) ||
        lastName.toLowerCase().includes(s) ||
        d.email.toLowerCase().includes(s);
      if (!match) return false;
    }
    if (roleFilter && d.role !== roleFilter) return false;
    if (statusFilter && d.status !== statusFilter) return false;
    return true;
  });

  const openUser = (u: UserRow) => setSelected(u);
  const closeModal = () => setSelected(null);

  const saveUser = async (u: UserRow) => {
    try {
      // Call API to update user
      const response = await API.patch(`/users/${u._id}`, {
        role: u.role,
        status: u.status,
        officeName: u.officeName,
        maxProfiles: u.maxProfiles,
      });
      
      console.log("User updated:", response.data);
      
      // Update local state
      setData((prev) => prev.map((p) => (p._id === u._id ? { ...p, ...u } : p)));
      closeModal();
    } catch (err: any) {
      console.error("Error saving user:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to save user"
      );
    }
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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading users...</div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
              {error}
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Found {data.length} users ({filtered.length} after filters)
              </div>
              <UsersList data={filtered} onOpen={openUser} />
            </>
          )}
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
