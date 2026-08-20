import React from "react";
import PageLayout from "@/components/tebase/PageLayout";
import Alarms from "@/components/tebase/alarms/Alarms";

const AlarmsPage = () => {
  return (
    <PageLayout variant="fill" title="Alarms & Notifications">
      <Alarms />
    </PageLayout>
  );
};

export default AlarmsPage;
