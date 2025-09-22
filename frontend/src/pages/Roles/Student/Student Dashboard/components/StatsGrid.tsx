import { useNavigate } from "react-router-dom";
import { useUnreadNotificationCount } from "@/hooks/useUnreadNotificationCount";

const StatsGrid = () => {
  const navigate = useNavigate();
  const { data: unreadData } = useUnreadNotificationCount();
  const unreadCount = unreadData?.unreadCount ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      
    </div>
  );
};

export default StatsGrid;
