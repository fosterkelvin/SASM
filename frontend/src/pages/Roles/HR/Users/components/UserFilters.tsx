import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

type Props = {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  roleFilter: string;
  onRoleChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
};

const UserFilters: React.FC<Props> = ({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <Label htmlFor="search">Search Users</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e: any) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="w-48">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            value={roleFilter}
            onChange={(e) => onRoleChange(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">All roles</option>
            <option value="hr">HR</option>
            <option value="office">Office</option>
            <option value="student">Student</option>
          </select>
        </div>

        <div className="w-48">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default UserFilters;
