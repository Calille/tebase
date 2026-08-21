import React from "react";
import PageLayout from "@/components/tebase/PageLayout";
import WeeklyReport from "@/components/tebase/reports/WeeklyReport";

const WeeklyReportPage = () => {
  return (
    <PageLayout title="Weekly Report">
      <WeeklyReport />
    </PageLayout>
  );
};

export default WeeklyReportPage;
