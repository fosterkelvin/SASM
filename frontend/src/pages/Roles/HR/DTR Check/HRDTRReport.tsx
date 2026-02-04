import React from "react";
import HRSidebar from "@/components/sidebar/HR/HRSidebar";
import DTRReport from "@/pages/Roles/Shared/DTRReport";

const HRDTRReport: React.FC = () => {
  return <DTRReport role="hr" Sidebar={HRSidebar} />;
};

export default HRDTRReport;
