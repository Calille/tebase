import React from "react";
import { Plus } from "lucide-react";
import PageLayout from "@/components/tebase/PageLayout";
import TeacherAvailability from "@/components/tebase/availability/TeacherAvailability";
import { Button } from "@/components/ui/button";
import { toastDemoAction } from "@/lib/persistence";

const TeacherAvailabilityPage = () => {
  return (
    <PageLayout
      title="Teacher Availability"
      actions={
        <Button
          className="gap-1"
          onClick={() =>
            toastDemoAction(
              "Update availability",
              "This grid is sample data — edits are not saved.",
            )
          }
        >
          <Plus className="h-4 w-4" />
          Update Availability
        </Button>
      }
    >
      <TeacherAvailability />
    </PageLayout>
  );
};

export default TeacherAvailabilityPage;
