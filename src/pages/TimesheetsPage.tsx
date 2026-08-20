import React from "react";
import PageLayout from "@/components/tebase/PageLayout";
import Timesheets from "@/components/tebase/timesheets/Timesheets";

const TimesheetsPage = () => {
  return (
    <PageLayout title="Timesheets">
      <Timesheets />
    </PageLayout>
  );
};

export default TimesheetsPage;
