import React from "react";
import { useNavigate } from "react-router-dom";
import SchoolProfile from "@/components/tebase/schools/SchoolProfile";
import { toast } from "@/components/ui/use-toast";
import { schoolService, School } from "@/services/schoolService";
import { toastWriteResult } from "@/lib/persistence";

const NewSchoolPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/schools");
  };

  const handleSave = async (data: School) => {
    try {
      const result = await schoolService.createSchool(data);
      toastWriteResult("School created", result);
      if (result.data) {
        navigate(`/schools/${result.data.id}`);
      }
    } catch (error) {
      console.error("Error creating school:", error);
      toast({
        title: "Error",
        description: "Failed to create the school. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <SchoolProfile
        onBack={handleBack}
        onSave={handleSave}
      />
    </div>
  );
};

export default NewSchoolPage; 