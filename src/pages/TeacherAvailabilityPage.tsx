import React from "react";
import PageLayout from "@/components/tebase/PageLayout";
import TeacherAvailability from "@/components/tebase/availability/TeacherAvailability";

const TeacherAvailabilityPage = () => {
  return (
    <PageLayout variant="fill" title="Teacher Availability">
      <TeacherAvailability />
    </PageLayout>
  );
};

export default TeacherAvailabilityPage;
