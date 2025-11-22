import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import type { UserRow } from "../types";

type Props = {
  user: UserRow | null;
  onClose: () => void;
  onSave: (u: UserRow) => void;
  onChange: (u: Partial<UserRow>) => void;
};

const UserModal: React.FC<Props> = ({ user, onClose, onSave, onChange }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 md:p-6 w-full max-w-3xl mx-2 md:mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-20 h-20 bg-red-100 rounded-lg flex items-center justify-center">
            <User className="w-10 h-10 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">
              {user.firstName || user.firstname}{" "}
              {user.lastName || user.lastname}
            </h3>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Role</Label>
            <select
              value={user.role}
              onChange={(e) => onChange({ role: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">(none)</option>
              <option value="admin">Admin</option>
              <option value="hr">HR</option>
              <option value="office">Office</option>
              <option value="student">Student</option>
            </select>
          </div>

          {user.role === "office" && (
            <div>
              <Label className="text-sm font-medium">Office Name</Label>
              <input
                type="text"
                value={user.officeName || ""}
                onChange={(e) => onChange({ officeName: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter office name"
              />
            </div>
          )}

          <div>
            <Label className="text-sm font-medium">Status</Label>
            <select
              value={user.status}
              onChange={(e) => onChange({ status: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              className="bg-gray-400 hover:bg-gray-500"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => onSave(user)}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
