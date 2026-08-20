import React from "react";
import PageLayout from "@/components/tebase/PageLayout";
import Directors from "@/components/tebase/directors/Directors";

const DirectorsPage = () => {
  return (
    <PageLayout variant="fill" title="Directors Portal">
      <Directors />
    </PageLayout>
  );
};

export default DirectorsPage;
