import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SchoolProfile from "@/components/tebase/schools/SchoolProfile";
import { Loader2 } from "lucide-react";
import { schoolService, School } from "@/services/schoolService";

const SchoolDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolExists, setSchoolExists] = useState(false);

  useEffect(() => {
    const checkSchool = async () => {
      if (!id) {
        setError("School ID is required");
        setLoading(false);
        return;
      }

      try {
        const school = await schoolService.getSchoolById(id);
        if (school) {
          setSchoolExists(true);
        } else {
          setError("School not found");
        }
      } catch (err) {
        console.error("Error checking school:", err);
        setError("Failed to load school data");
      } finally {
        setLoading(false);
      }
    };

    checkSchool();
  }, [id]);

  const handleBack = () => {
    navigate("/schools");
  };

  const handleSave = (_data: School) => {
    // Profile component already reports demo vs persisted status.
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-lg">Loading school profile...</p>
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
      {schoolExists && id && (
        <SchoolProfile
          schoolId={id}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default SchoolDetailPage; 