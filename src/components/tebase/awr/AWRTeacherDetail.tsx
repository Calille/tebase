import React from "react";
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  FileText,
  ChevronDown,
  Bell,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { TeacherWithAWR, School } from "@/types/awr";

interface AWRTeacherDetailProps {
  teacher: TeacherWithAWR;
  onClose: () => void;
  onSendNotification: (teacher: TeacherWithAWR, school: School | null) => void;
}

const AWRTeacherDetail: React.FC<AWRTeacherDetailProps> = ({
  teacher,
  onClose,
  onSendNotification,
}) => {
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Get status badge color based on AWR status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "qualified":
        return "bg-green-100 text-green-800";
      case "approaching":
        return "bg-amber-100 text-amber-800";
      case "tracking":
        return "bg-blue-100 text-blue-800";
      case "paused":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format AWR status for display
  const formatAWRStatus = (status: string) => {
    switch (status) {
      case "qualified":
        return "AWR Qualified";
      case "approaching":
        return "Approaching AWR";
      case "tracking":
        return "Tracking";
      case "paused":
        return "Paused";
      default:
        return "Not Applicable";
    }
  };

  // Create school object for notification
  const currentSchool: School | null = teacher.currentSchoolId
    ? {
        id: teacher.currentSchoolId,
        name: teacher.currentSchool || "",
      }
    : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{teacher.name}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AWR Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={getStatusBadgeColor(teacher.awrStatus)}
              >
                {formatAWRStatus(teacher.awrStatus)}
              </Badge>
              {teacher.awrStatus === "qualified" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Teacher has qualified for AWR</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {teacher.awrStatus === "approaching" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Teacher is approaching AWR qualification</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress toward AWR qualification</span>
                <span className="font-medium">
                  {teacher.awrWeeks} weeks {teacher.awrDays} days / 12 weeks
                </span>
              </div>
              <Progress
                value={(teacher.awrWeeks * 5 + teacher.awrDays) / 0.6}
                className="h-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Current School</p>
                <p className="font-medium">
                  {teacher.currentSchool || "Not assigned"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Assignment Start</p>
                <p className="font-medium">
                  {formatDate(teacher.assignmentStartDate)}
                </p>
              </div>
              {teacher.awrStatus === "qualified" && (
                <div>
                  <p className="text-sm text-gray-500">Qualification Date</p>
                  <p className="font-medium">
                    {formatDate(teacher.awrQualificationDate)}
                  </p>
                </div>
              )}
              {teacher.awrStatus === "paused" && (
                <div>
                  <p className="text-sm text-gray-500">Pause Reason</p>
                  <p className="font-medium">{teacher.pauseReason || "N/A"}</p>
                </div>
              )}
            </div>

            {teacher.awrStatus === "approaching" && (
              <Button
                className="w-full"
                onClick={() => onSendNotification(teacher, currentSchool)}
                disabled={!currentSchool || teacher.awrNotificationSent}
              >
                <Bell className="h-4 w-4 mr-2" />
                {teacher.awrNotificationSent
                  ? "Notification Already Sent"
                  : "Send AWR Notification"}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Teacher Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{teacher.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{teacher.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Subjects</p>
                <p className="font-medium">
                  {teacher.subjects?.join(", ") || "None"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Availability</p>
                <p className="font-medium">
                  {teacher.availability || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Region</p>
                <p className="font-medium">{teacher.region || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium capitalize">{teacher.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AWR History</CardTitle>
        </CardHeader>
        <CardContent>
          {teacher.awrHistory && teacher.awrHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Weeks Completed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacher.awrHistory.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>{entry.schoolName}</TableCell>
                    <TableCell>{formatDate(entry.startDate)}</TableCell>
                    <TableCell>
                      {entry.endDate ? formatDate(entry.endDate) : "Ongoing"}
                    </TableCell>
                    <TableCell>{entry.weeksCompleted}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusBadgeColor(entry.status)}
                      >
                        {formatAWRStatus(entry.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{entry.notes || "No notes"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No AWR history available for this teacher
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AWRTeacherDetail; 