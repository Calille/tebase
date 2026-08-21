import React from "react";
import PageLayout from "@/components/tebase/PageLayout";
import Management from "@/components/tebase/management/Management";

const ManagementPage = () => {
  return (
    <PageLayout variant="fill" title="Management">
      <Management />
    </PageLayout>
  );
};

export default ManagementPage;
