import React from "react";
import SidebarItem from "./SidebarItem";
import { Home, Bell, BookOpen, FileText, Calendar } from "lucide-react";

interface NavProps {
  unreadCount?: number;
  handlers: Record<string, () => void>;
}

const SidebarNav: React.FC<NavProps> = ({ unreadCount = 0, handlers }) => {
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
            label="Notifications"
            onClick={handlers.notifications}
            IconComponent={Bell}
            badge={
              unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount) : null
            }
          />
        </li>
        <li>
          <SidebarItem
            label="Grades"
            onClick={handlers.grades}
            IconComponent={BookOpen}
          />
        </li>
        <li>
          <SidebarItem
            label="DTR"
            onClick={handlers.dtr}
            IconComponent={FileText}
          />
        </li>
        <li>
          <SidebarItem
            label="Schedule"
            onClick={handlers.schedule}
            IconComponent={Calendar}
          />
        </li>
        <li>
          <SidebarItem
            label="Apply"
            onClick={handlers.apply}
            IconComponent={FileText}
          />
        </li>
        <li>
          <SidebarItem
            label="Re-apply"
            onClick={handlers.reapply}
            IconComponent={FileText}
          />
        </li>
        <li>
          <SidebarItem
            label="Leave"
            onClick={handlers.leave}
            IconComponent={FileText}
          />
        </li>
        <li>
          <SidebarItem
            label="Requirements"
            onClick={handlers.requirements}
            IconComponent={FileText}
          />
        </li>
      </ul>
    </nav>
  );
};

export default SidebarNav;
