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
  isAccepted?: boolean;
  isEmailUpdateRequired?: boolean;
  isPersonalInfoIncomplete?: boolean;
  isTrainee?: boolean;
  isDeployedToOffice?: boolean;
  isScholar?: boolean;
  hasActiveApplication?: boolean;
  isReapplicant?: boolean;
}

const SidebarNav: React.FC<NavProps> = ({
  unreadCount = 0,
  handlers,
  isVerified = false,
  isApplicant = false,
  isAccepted = false,
  isEmailUpdateRequired = false,
  isPersonalInfoIncomplete = false,
  isTrainee = false,
  isDeployedToOffice = false,
  isScholar = false,
  hasActiveApplication = false,
  isReapplicant = false,
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
            disabled={isEmailUpdateRequired}
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
            disabled={false}
          />
        </li>
        {/* Show DTR, Schedule, and Leave for deployed trainees OR scholars (but NOT re-applicants) */}
        {isVerified && (isDeployedToOffice || isScholar) && !isReapplicant && (
          <>
            <li>
              <SidebarItem
                label="DTR"
                onClick={handlers.dtr}
                IconComponent={CalendarClock}
                disabled={isEmailUpdateRequired}
              />
            </li>
            <li>
              <SidebarItem
                label="Leave"
                onClick={handlers.leave}
                IconComponent={CalendarMinus}
                disabled={isEmailUpdateRequired}
              />
            </li>
            <li>
              <SidebarItem
                label="Schedule"
                onClick={handlers.schedule}
                IconComponent={Calendar}
                disabled={isEmailUpdateRequired}
              />
            </li>
          </>
        )}

        {/* Show Apply only for applicants without accepted status and not re-applicants */}
        {!isAccepted && !hasActiveApplication && !isReapplicant && (
          <li>
            <SidebarItem
              label="Apply"
              onClick={handlers.apply}
              IconComponent={FileEdit}
              disabled={isEmailUpdateRequired || isPersonalInfoIncomplete}
            />
          </li>
        )}

        {/* Show Re-apply ONLY for re-applicants (verified users with reapplicant status) */}
        {isVerified && !hasActiveApplication && isReapplicant && (
          <li>
            <SidebarItem
              label="Re-apply"
              onClick={handlers.reapply}
              IconComponent={RefreshCw}
              disabled={isEmailUpdateRequired || isPersonalInfoIncomplete}
            />
          </li>
        )}

        {/* Show Requirements for verified users */}
        {isVerified && (
          <li>
            <SidebarItem
              label="Requirements"
              onClick={handlers.requirements}
              IconComponent={ClipboardList}
              disabled={isEmailUpdateRequired}
            />
          </li>
        )}
      </ul>
    </nav>
  );
};

export default SidebarNav;
