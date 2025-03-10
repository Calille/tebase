import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TeacherProfile from "@/components/tebase/teachers/TeacherProfile";
import { Loader2 } from "lucide-react";
import { teacherService } from "@/services/teacherService";

const TeacherDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherExists, setTeacherExists] = useState(false);

  useEffect(() => {
    const checkTeacher = async () => {
      if (!id) {
        setError("Teacher ID is required");
        setLoading(false);
        return;
      }

      try {
        const teacher = await teacherService.getTeacherById(id);
        if (teacher) {
          setTeacherExists(true);
        } else {
          setError("Teacher not found");
        }
      } catch (err) {
        console.error("Error checking teacher:", err);
        setError("Failed to load teacher data");
      } finally {
        setLoading(false);
      }
    };

    checkTeacher();
  }, [id]);

  const handleBack = () => {
    navigate("/teachers");
  };

  const handleSave = (data: any) => {
    console.log("Teacher data saved:", data);
    // Optionally navigate back to the teachers list
    // navigate("/teachers");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-lg">Loading teacher profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg text-destructive">{error}</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {teacherExists && id && (
        <TeacherProfile
          teacherId={id}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default TeacherDetailPage; 