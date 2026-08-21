import React from "react";
import PageLayout from "@/components/tebase/PageLayout";
import TeamLeaders from "@/components/tebase/team-leaders/TeamLeaders";

const TeamLeadersPage = () => {
  return (
    <PageLayout variant="fill" title="Team Leaders">
      <TeamLeaders />
    </PageLayout>
  );
};

export default TeamLeadersPage;
