import React, { useState, useEffect } from "react";
import { X, Send, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeacherWithAWR, School, EmailTemplate } from "@/types/awr";

interface AWRNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: TeacherWithAWR | null;
  school: School | null;
  emailPreview: { subject: string; body: string } | null;
  isLoading: boolean;
  onSend: () => Promise<void>;
  onPreview: () => void;
}

const AWRNotificationModal: React.FC<AWRNotificationModalProps> = ({
  isOpen,
  onClose,
  teacher,
  school,
  emailPreview,
  isLoading,
  onSend,
  onPreview,
}) => {
  const [activeTab, setActiveTab] = useState("details");

  // Reset to details tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("details");
    }
  }, [isOpen]);

  if (!teacher || !school) return null;

  // Calculate projected qualification date (12 weeks from start date)
  const getProjectedQualificationDate = () => {
    if (!teacher.assignmentStartDate) return "Unknown";
    
    const startDate = new Date(teacher.assignmentStartDate);
    const qualificationDate = new Date(startDate);
    qualificationDate.setDate(startDate.getDate() + (12 * 7)); // Add 12 weeks
    
    return qualificationDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Send AWR Notification</DialogTitle>
          <DialogDescription>
            Send an AWR notification to the school regarding this teacher's approaching AWR status.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Notification Details</TabsTrigger>
            <TabsTrigger value="preview" onClick={onPreview}>
              Email Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Teacher</h3>
                <p className="font-medium">{teacher.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">School</h3>
                <p className="font-medium">{school.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Current AWR Status
                </h3>
                <p className="font-medium">
                  {teacher.awrWeeks} weeks {teacher.awrDays} days completed
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Projected Qualification Date
                </h3>
                <p className="font-medium">{getProjectedQualificationDate()}</p>
              </div>
            </div>

            <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Eye className="h-5 w-5 text-amber-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Notification Preview
                  </h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      This notification will inform the school that {teacher.name} is
                      approaching AWR qualification after working at {school.name} for{" "}
                      {teacher.awrWeeks} weeks.
                    </p>
                    <p className="mt-2">
                      Click on "Email Preview" to see the exact email that will be sent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4 mt-4">
            {emailPreview ? (
              <div className="border rounded-md p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Subject</h3>
                  <p className="font-medium">{emailPreview.subject}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Body</h3>
                  <div
                    className="prose max-w-none mt-2 border rounded-md p-4 bg-gray-50"
                    dangerouslySetInnerHTML={{ __html: emailPreview.body }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Click "Preview Email" to see the email content
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {activeTab === "details" && (
              <Button variant="outline" onClick={() => {
                onPreview();
                setActiveTab("preview");
              }}>
                <Eye className="h-4 w-4 mr-2" />
                Preview Email
              </Button>
            )}
            <Button onClick={onSend} disabled={isLoading}>
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? "Sending..." : "Send Notification"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AWRNotificationModal; 