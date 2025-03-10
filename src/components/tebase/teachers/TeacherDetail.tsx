import React from "react";
import TeacherProfile from "./TeacherProfile";

interface TeacherDetailProps {
  teacherId?: string;
  onBack?: () => void;
}

const TeacherDetail = ({
  teacherId,
  onBack,
}: TeacherDetailProps) => {
  return (
    <TeacherProfile
      teacherId={teacherId}
      onBack={onBack}
    />
  );
};

export default TeacherDetail;
