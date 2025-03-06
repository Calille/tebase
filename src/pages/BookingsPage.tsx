import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/tebase/Sidebar";
import BookingList from "@/components/tebase/bookings/BookingList";

const BookingsPage = () => {
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
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
          </div>

          <BookingList />
        </div>
      </main>
    </div>
  );
};

export default BookingsPage;
