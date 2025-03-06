import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/tebase/Sidebar";
import TeacherList from "@/components/tebase/teachers/TeacherList";
import TeacherDetail from "@/components/tebase/teachers/TeacherDetail";

const TeachersPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleViewTeacher = (teacherId: string) => {
    setSelectedTeacher(teacherId);
  };

  const handleBackToList = () => {
    setSelectedTeacher(null);
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
          {!selectedTeacher ? (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Teachers</h1>
              </div>
              <TeacherList onViewTeacher={handleViewTeacher} />
            </>
          ) : (
            <TeacherDetail
              teacherId={selectedTeacher}
              onBack={handleBackToList}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default TeachersPage;
