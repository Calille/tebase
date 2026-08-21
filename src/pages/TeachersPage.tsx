import React, { useState } from "react";
import PageLayout from "@/components/tebase/PageLayout";
import TeacherList from "@/components/tebase/teachers/TeacherList";
import TeacherDetail from "@/components/tebase/teachers/TeacherDetail";

const TeachersPage = () => {
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);

  return (
    <PageLayout title={selectedTeacher ? undefined : "Teachers"}>
      {!selectedTeacher ? (
        <TeacherList onViewTeacher={setSelectedTeacher} />
      ) : (
        <TeacherDetail
          teacherId={selectedTeacher}
          onBack={() => setSelectedTeacher(null)}
        />
      )}
    </PageLayout>
  );
};

export default TeachersPage;
