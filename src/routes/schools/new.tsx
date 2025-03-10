import React from "react";
import { useNavigate } from "react-router-dom";
import SchoolProfile from "@/components/tebase/schools/SchoolProfile";
import { toast } from "@/components/ui/use-toast";
import { schoolService } from "@/services/schoolService";

const NewSchoolPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/schools");
  };

  const handleSave = async (data: any) => {
    try {
      const newSchoolId = await schoolService.createSchool(data);
      toast({
        title: "School created",
        description: "The school has been successfully created.",
        variant: "default",
      });
      navigate(`/schools/${newSchoolId}`);
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