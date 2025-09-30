import React from "react";
import HRSidebar from "@/components/sidebar/HR/HRSidebar";
import OfficeSidebar from "@/components/sidebar/Office/OfficeSidebar";
import StudentSidebar from "@/components/sidebar/Student/StudentSidebar";

interface SidebarSwitcherProps {
  role?: string;
  currentPage: string;
  onCollapseChange: (collapsed: boolean) => void;
}

const SidebarSwitcher: React.FC<SidebarSwitcherProps> = ({
  role,
  currentPage,
  onCollapseChange,
}) => {
  switch (role) {
    case "hr":
      return (
        <HRSidebar
          currentPage={currentPage}
          onCollapseChange={onCollapseChange}
        />
      );
    case "office":
      return (
        <OfficeSidebar
          currentPage={currentPage}
          onCollapseChange={onCollapseChange}
        />
      );
    default:
      return (
        <StudentSidebar
          currentPage={currentPage}
          onCollapseChange={onCollapseChange}
        />
      );
  }
};

export default SidebarSwitcher;
