import React from "react";
import SidebarItem from "./SidebarItem";
import { Home, Calendar, FileText, Users, ClipboardCheck, Bell } from "lucide-react";

interface NavProps {
  handlers: Record<string, () => void>;
}

const SidebarNav: React.FC<NavProps> = ({ handlers }) => {
  return (
    <nav
      className={`transition-all duration-300 p-4 flex-1 overflow-y-auto mt-0`}
      aria-label="Sidebar Navigation"
    >
      <ul className="space-y-2">
        <li>
          <SidebarItem
            label="Dashboard"
            onClick={handlers.dashboard}
            IconComponent={Home}
          />
        </li>
        <li>
          <SidebarItem
            label="DTR Check"
            onClick={handlers.dtrCheck}
            IconComponent={ClipboardCheck}
          />
        </li>
        <li>
          <SidebarItem
            label="Evaluation"
            onClick={handlers.evaluation}
            IconComponent={Calendar}
          />
        </li>
        <li>
          <SidebarItem
            label="Leave Requests"
            onClick={handlers.leave}
            IconComponent={FileText}
          />
        </li>
        <li>
          <SidebarItem
            label="Requests"
            onClick={handlers.requests}
            IconComponent={FileText}
          />
        </li>
        <li>
          <SidebarItem
            label="Scholars"
            onClick={handlers.scholars}
            IconComponent={FileText}
          />
        </li>
        <li>
          <SidebarItem
            label="My Trainees"
            onClick={handlers.trainees}
            IconComponent={Users}
          />
        </li>
        <li>
          <SidebarItem
            label="Notifications"
            onClick={handlers.notifications}
            IconComponent={Bell}
          />
        </li>
      </ul>
    </nav>
  );
};

export default SidebarNav;
