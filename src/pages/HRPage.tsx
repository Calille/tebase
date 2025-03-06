import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/tebase/Sidebar";
import HR from "@/components/tebase/hr/HR";

const HRPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />

      <main
        className={cn(
          "flex-1 h-screen overflow-hidden transition-all duration-300",
          sidebarCollapsed ? "ml-[70px]" : "ml-[50px]",
        )}
      >
        <div className="flex flex-col h-full w-full">
          <div className="flex items-center justify-between p-4 bg-gray-100">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Human Resources
            </h1>
          </div>

          <div className="flex-1 overflow-auto">
            <HR />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HRPage;
