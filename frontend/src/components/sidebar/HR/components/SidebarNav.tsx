import React from "react";
import SidebarItem from "../../Student/components/SidebarItem";
import {
  Home,
  FileText,
  BarChart,
  Users,
  Calendar,
  GraduationCap,
  ClipboardCheck,
  Bell,
} from "lucide-react";

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
            label="Requirements"
            onClick={handlers.requirements}
            IconComponent={FileText}
          />
        </li>
        <li>
          <SidebarItem
            label="Analytics"
            onClick={handlers.analytics}
            IconComponent={BarChart}
          />
        </li>
        <li>
          <SidebarItem
            label="Applications"
            onClick={handlers.applications}
            IconComponent={FileText}
          />
        </li>
        <li>
          <SidebarItem
            label="Reapplications"
            onClick={handlers.reapplications}
            IconComponent={FileText}
          />
        </li>
        <li>
          <SidebarItem
            label="Users"
            onClick={handlers.users}
            IconComponent={Users}
          />
        </li>
        <li>
          <SidebarItem
            label="Trainees"
            onClick={handlers.trainees}
            IconComponent={GraduationCap}
          />
        </li>
        <li>
          <SidebarItem
            label="Leave Management"
            onClick={handlers.leaves}
            IconComponent={Calendar}
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
