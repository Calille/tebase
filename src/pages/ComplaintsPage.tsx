import React from "react";
import PageLayout from "@/components/tebase/PageLayout";
import Complaints from "@/components/tebase/complaints/Complaints";

const ComplaintsPage = () => {
  return (
    <PageLayout variant="fill" title="Complaints Management">
      <Complaints />
    </PageLayout>
  );
};

export default ComplaintsPage;
