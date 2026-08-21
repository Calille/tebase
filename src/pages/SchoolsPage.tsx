import React from "react";
import PageLayout from "@/components/tebase/PageLayout";
import SchoolList from "@/components/tebase/schools/SchoolList";

const SchoolsPage = () => {
  return (
    <PageLayout title="Schools">
      <SchoolList />
    </PageLayout>
  );
};

export default SchoolsPage;
