import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TeacherWithAWR } from "@/types/awr";

interface AWRTeacherListProps {
  teachers: TeacherWithAWR[];
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onTeacherSelect: (teacher: TeacherWithAWR) => void;
}

const AWRTeacherList: React.FC<AWRTeacherListProps> = ({
  teachers,
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onTeacherSelect,
}) => {
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search teachers or schools..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="qualified">AWR Qualified</SelectItem>
              <SelectItem value="approaching">Approaching AWR</SelectItem>
              <SelectItem value="tracking">Tracking</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="not-applicable">Not Applicable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher</TableHead>
              <TableHead>Current School</TableHead>
              <TableHead>AWR Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No teachers found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    <div className="font-medium">{teacher.name}</div>
                    <div className="text-sm text-gray-500">{teacher.email}</div>
                  </TableCell>
                  <TableCell>
                    {teacher.currentSchool || "Not assigned"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusBadgeColor(teacher.awrStatus)}
                    >
                      {formatAWRStatus(teacher.awrStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="w-full max-w-xs">
                      <div className="flex justify-between text-xs mb-1">
                        <span>
                          {teacher.awrWeeks} weeks {teacher.awrDays} days
                        </span>
                        <span>12 weeks</span>
                      </div>
                      <Progress
                        value={(teacher.awrWeeks * 5 + teacher.awrDays) / 0.6}
                        className="h-2"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTeacherSelect(teacher)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AWRTeacherList; 