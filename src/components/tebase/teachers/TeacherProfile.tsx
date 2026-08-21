import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { teacherService, Teacher, TeacherFormSeed } from "@/services/teacherService";
import { toastDemoAction, toastWriteResult } from "@/lib/persistence";
import DemoBanner from "@/components/tebase/shared/DemoBanner";

import TeacherPersonalInfo from "./TeacherPersonalInfo";
import TeacherProfessionalInfo from "./TeacherProfessionalInfo";
import TeacherFinancialInfo from "./TeacherFinancialInfo";
import TeacherAvailability from "./TeacherAvailability";
import TeacherAdditionalDetails from "./TeacherAdditionalDetails";
import TeacherDocuments from "../../../components/tebase/teachers/TeacherDocuments";

interface TeacherProfileProps {
  teacherId?: string;
  isNewTeacher?: boolean;
  onBack?: () => void;
  onSave?: (data: Teacher) => void;
  readOnly?: boolean;
}

const TeacherProfile = ({
  teacherId,
  isNewTeacher = false,
  onBack,
  onSave,
  readOnly = false,
}: TeacherProfileProps) => {
  const [activeTab, setActiveTab] = useState("personal");
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(!isNewTeacher);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch teacher data if teacherId is provided
  useEffect(() => {
    const fetchTeacher = async () => {
      if (!teacherId || isNewTeacher) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const teacherData = await teacherService.getTeacherById(teacherId);
        
        if (teacherData) {
          setTeacher(teacherData);
          setError(null);
        } else {
          setError("Teacher not found");
        }
      } catch (err) {
        console.error("Error fetching teacher:", err);
        setError("Failed to load teacher data");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [teacherId, isNewTeacher]);

  const handleSectionSave = (section: string, data: TeacherFormSeed) => {
    setTeacher((prevTeacher) =>
      prevTeacher ? ({ ...prevTeacher, ...data } as Teacher) : (data as Teacher)
    );

    toastDemoAction(`${section} section saved`);

    if (isNewTeacher && section === "Personal" && !teacherId) {
      handleCreateTeacher(data);
    }
  };

  const handleCreateTeacher = async (personalData: TeacherFormSeed) => {
    try {
      setIsSaving(true);

      const name = personalData.name || teacher?.name;
      const email = personalData.email || teacher?.email;
      if (!name || !email) {
        toast({
          title: "Error",
          description: "Name and email are required to create a teacher.",
          variant: "destructive",
        });
        return;
      }

      const result = await teacherService.createTeacher({
        ...teacher,
        ...personalData,
        name,
        email,
        address:
          typeof personalData.address === "string"
            ? personalData.address
            : personalData.address
              ? [
                  personalData.address.street,
                  personalData.address.city,
                  personalData.address.state,
                  personalData.address.zip,
                  personalData.address.country,
                ]
                  .filter(Boolean)
                  .join(", ")
              : teacher?.address,
      } as Parameters<typeof teacherService.createTeacher>[0]);

      toastWriteResult("Teacher created", result);

      if (result.data) {
        setTeacher(result.data);
        if (onSave) {
          onSave(result.data);
        }
        setActiveTab("professional");
      }
    } catch (error) {
      console.error("Error creating teacher:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle saving the entire profile
  const handleSaveProfile = async () => {
    if (!teacher) return;
    
    try {
      setIsSaving(true);
      
      // If this is a new teacher, we've already created it when saving the personal info
      if (!isNewTeacher && teacherId) {
        const result = await teacherService.updateTeacher(teacherId, teacher);
        toastWriteResult("Profile saved", result);
        if (result.ok && onSave) {
          onSave(teacher);
        }
      } else if (onSave) {
        onSave(teacher);
        toastDemoAction("Profile saved");
      }
    } catch (error) {
      console.error("Error saving teacher profile:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-lg">Loading teacher profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg text-destructive">{error}</p>
          {onBack && (
            <Button onClick={onBack} className="mt-4">
              Go Back
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DemoBanner />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-2xl font-bold">
            {isNewTeacher ? "New Teacher" : teacher?.name || "Teacher Profile"}
          </h1>
        </div>
        
        {!readOnly && (
          <Button onClick={handleSaveProfile} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="additional">Additional</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <TeacherPersonalInfo
            teacherId={teacherId}
            initialData={teacher}
            onSave={(data) => handleSectionSave("Personal", data)}
            readOnly={readOnly}
          />
        </TabsContent>

        <TabsContent value="professional">
          <TeacherProfessionalInfo
            teacherId={teacherId}
            initialData={teacher}
            onSave={(data) => handleSectionSave("Professional", data)}
            readOnly={readOnly}
          />
        </TabsContent>

        <TabsContent value="financial">
          <TeacherFinancialInfo
            teacherId={teacherId}
            initialData={teacher}
            onSave={(data) => handleSectionSave("Financial", data)}
            readOnly={readOnly}
          />
        </TabsContent>

        <TabsContent value="availability">
          <TeacherAvailability
            teacherId={teacherId}
            initialData={teacher}
            onSave={(data) => handleSectionSave("Availability", data)}
            readOnly={readOnly}
          />
        </TabsContent>

        <TabsContent value="additional">
          <div className="space-y-8">
            <TeacherAdditionalDetails
              teacherId={teacherId}
              initialData={teacher}
              onSave={(data) => handleSectionSave("Additional", data)}
              readOnly={readOnly}
            />
            
            {teacherId && (
              <TeacherDocuments
                teacherId={teacherId}
                documents={teacher?.documents || []}
                onDocumentAdded={() => {
                  // Refresh teacher data
                  teacherService.getTeacherById(teacherId).then(data => {
                    if (data) {
                      setTeacher(data);
                    }
                  });
                }}
                readOnly={readOnly}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer with navigation buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => {
            const tabs = ["personal", "professional", "financial", "availability", "additional"];
            const currentIndex = tabs.indexOf(activeTab);
            if (currentIndex > 0) {
              setActiveTab(tabs[currentIndex - 1]);
            }
          }}
          disabled={activeTab === "personal"}
        >
          Previous
        </Button>
        
        <Button
          onClick={() => {
            const tabs = ["personal", "professional", "financial", "availability", "additional"];
            const currentIndex = tabs.indexOf(activeTab);
            if (currentIndex < tabs.length - 1) {
              setActiveTab(tabs[currentIndex + 1]);
            }
          }}
          disabled={activeTab === "additional"}
        >
          Next
        </Button>
      </div>
      
      <Toaster />
    </div>
  );
};

export default TeacherProfile; 