import React from "react";
import SidebarItem from "./SidebarItem";
import {
  Home,
  Bell,
  BookOpen,
  Calendar,
  CalendarClock,
  FileEdit,
  RefreshCw,
  CalendarMinus,
  ClipboardList,
} from "lucide-react";

interface NavProps {
  unreadCount?: number;
  handlers: Record<string, () => void>;
  isVerified?: boolean;
  isApplicant?: boolean;
}

const SidebarNav: React.FC<NavProps> = ({
  unreadCount = 0,
  handlers,
  isVerified = false,
  isApplicant = false,
}) => {
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
        {isVerified && (
          <>
            <li>
              <SidebarItem
                label="Grades"
                onClick={handlers.grades}
                IconComponent={BookOpen}
              />
            </li>
            {!isApplicant && (
              <li>
                <SidebarItem
                  label="DTR"
                  onClick={handlers.dtr}
                  IconComponent={CalendarClock}
                />
              </li>
            )}
            <li>
              <SidebarItem
                label="Schedule"
                onClick={handlers.schedule}
                IconComponent={Calendar}
              />
            </li>
          </>
        )}

        <li>
          <SidebarItem
            label="Apply"
            onClick={handlers.apply}
            IconComponent={FileEdit}
          />
        </li>
        {isVerified && (
          <>
            {!isApplicant && (
              <>
                <li>
                  <SidebarItem
                    label="Re-apply"
                    onClick={handlers.reapply}
                    IconComponent={RefreshCw}
                  />
                </li>
                <li>
                  <SidebarItem
                    label="Leave"
                    onClick={handlers.leave}
                    IconComponent={CalendarMinus}
                  />
                </li>
              </>
            )}
            <li>
              <SidebarItem
                label="Requirements"
                onClick={handlers.requirements}
                IconComponent={ClipboardList}
              />
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default SidebarNav;
