import React from "react";
import OfficeSidebar from "@/components/sidebar/Office/OfficeSidebar";
import DTRReport from "@/pages/Roles/Shared/DTRReport";

const OfficeDTRReport: React.FC = () => {
  return <DTRReport role="office" Sidebar={OfficeSidebar} />;
};

export default OfficeDTRReport;
