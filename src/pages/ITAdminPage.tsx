import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/tebase/Sidebar";
import ITDashboard from "@/components/tebase/it/ITDashboard";

const ITAdminPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />

      <main
        className={cn(
          "flex-1 overflow-auto transition-all duration-300 p-6",
          sidebarCollapsed ? "ml-[70px]" : "ml-[50px]",
        )}
      >
        <div className="space-y-6">
          <ITDashboard />
        </div>
      </main>
    </div>
  );
};

export default ITAdminPage;
