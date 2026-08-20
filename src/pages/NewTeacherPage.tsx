import React from "react";
import { useNavigate } from "react-router-dom";
import TeacherProfile from "@/components/tebase/teachers/TeacherProfile";
import { Teacher } from "@/services/teacherService";

const NewTeacherPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/teachers");
  };

  const handleSave = (data: Teacher) => {
    if (data.id) {
      navigate(`/teachers/${data.id}`);
    } else {
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