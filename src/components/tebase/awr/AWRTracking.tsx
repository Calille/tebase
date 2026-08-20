import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { toastDemoAction } from "@/lib/persistence";
import DemoBanner from "@/components/tebase/shared/DemoBanner";
import { TeacherWithAWR, School } from "@/types/awr";
import { AWRService } from "@/services/awrService";
import { generateAWRNotificationEmail } from "@/services/emailTemplateService";

// Import our new components
import AWRTeacherList from "./AWRTeacherList";
import AWRTeacherDetail from "./AWRTeacherDetail";
import AWRNotificationModal from "./AWRNotificationModal";

const AWRTracking = () => {
  // State management
  const [teachers, setTeachers] = useState<TeacherWithAWR[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherWithAWR | null>(null);
  const [showTeacherDetails, setShowTeacherDetails] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailPreview, setEmailPreview] = useState<{ subject: string; body: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch teachers on component mount
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Fetch teachers from the service
  const fetchTeachers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const teachersData = await AWRService.getAllTeachersWithAWR();
      setTeachers(teachersData);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setError("Failed to load teachers. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to load teachers. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter teachers based on search term and status filter
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.currentSchool && 
       teacher.currentSchool.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || teacher.awrStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle teacher selection
  const handleTeacherSelect = (teacher: TeacherWithAWR) => {
    setSelectedTeacher(teacher);
    setShowTeacherDetails(true);
  };

  // Handle closing teacher details
  const handleCloseTeacherDetails = () => {
    setShowTeacherDetails(false);
    setSelectedTeacher(null);
  };

  // Handle opening notification modal
  const handleOpenNotificationModal = (teacher: TeacherWithAWR, school: School | null) => {
    setSelectedTeacher(teacher);
    setSelectedSchool(school);
    setIsEmailModalOpen(true);
  };

  // Handle closing notification modal
  const handleCloseNotificationModal = () => {
    setIsEmailModalOpen(false);
    setEmailPreview(null);
  };

  // Generate email preview
  const handlePreviewEmail = () => {
    if (!selectedTeacher || !selectedSchool) return;

    try {
      // Calculate qualification date (2 weeks from now)
      const startDate = new Date(selectedTeacher.assignmentStartDate || "");
      const qualificationDate = new Date(startDate);
      qualificationDate.setDate(startDate.getDate() + (12 * 7)); // Add 12 weeks

      // Generate email template
      const emailTemplate = generateAWRNotificationEmail(
        selectedTeacher,
        selectedSchool,
        selectedTeacher.awrWeeks,
        qualificationDate
      );

      // Set email preview
      setEmailPreview({
        subject: emailTemplate.subject,
        body: emailTemplate.body,
      });
    } catch (error) {
      console.error("Error generating email preview:", error);
      toast({
        title: "Error",
        description: "Failed to generate email preview",
        variant: "destructive",
      });
    }
  };

  // Send AWR notification
  const handleSendNotification = async () => {
    if (!selectedTeacher || !selectedSchool) return;

    setEmailSending(true);

    try {
      // Send notification
      const success = await AWRService.checkAndSendAWRNotification(
        selectedTeacher,
        selectedSchool
      );

      if (success) {
        // Update teacher in state
        const updatedTeachers = teachers.map((t) =>
          t.id === selectedTeacher.id
            ? { ...t, awrNotificationSent: true }
            : t
        );
        setTeachers(updatedTeachers);

        // Show success message
        toastDemoAction(
          "Notification queued",
          "Email sending is not connected yet. Nothing was delivered."
        );

        // Close modal
        handleCloseNotificationModal();
      } else {
        throw new Error("Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: "Failed to send AWR notification",
        variant: "destructive",
      });
    } finally {
      setEmailSending(false);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading AWR data...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-700 font-medium mb-2">Error Loading Data</p>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            className="px-4 py-2 bg-primary text-white rounded-md"
            onClick={fetchTeachers}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DemoBanner message="AWR tracking and school notification emails are sample-only until a mail provider is connected." />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">AWR Tracking</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {!showTeacherDetails ? (
          <Card>
            <CardHeader>
              <CardTitle>Teachers AWR Status</CardTitle>
            </CardHeader>
            <CardContent>
              <AWRTeacherList
                teachers={filteredTeachers}
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                onSearchChange={setSearchTerm}
                onStatusFilterChange={setStatusFilter}
                onTeacherSelect={handleTeacherSelect}
              />
            </CardContent>
          </Card>
        ) : (
          selectedTeacher && (
            <AWRTeacherDetail
              teacher={selectedTeacher}
              onClose={handleCloseTeacherDetails}
              onSendNotification={handleOpenNotificationModal}
            />
          )
        )}
      </div>

      {/* AWR Notification Modal */}
      <AWRNotificationModal
        isOpen={isEmailModalOpen}
        onClose={handleCloseNotificationModal}
        teacher={selectedTeacher}
        school={selectedSchool}
        emailPreview={emailPreview}
        isLoading={emailSending}
        onSend={handleSendNotification}
        onPreview={handlePreviewEmail}
      />

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
};

export default AWRTracking; 