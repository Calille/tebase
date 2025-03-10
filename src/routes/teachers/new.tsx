import React from "react";
import { useNavigate } from "react-router-dom";
import TeacherProfile from "@/components/tebase/teachers/TeacherProfile";

const NewTeacherPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/teachers");
  };

  const handleSave = (data: any) => {
    console.log("New teacher data saved:", data);
    // Navigate to the teacher detail page if we have an ID
    if (data && data.id) {
      navigate(`/teachers/${data.id}`);
    } else {
      // Otherwise go back to the teachers list
      navigate("/teachers");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <TeacherProfile
        isNewTeacher={true}
        onBack={handleBack}
        onSave={handleSave}
      />
    </div>
  );
};

export default NewTeacherPage; 