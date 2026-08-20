import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Search,
  Filter,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Clock,
  User,
  FileText,
  Check,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toastDemoAction } from "@/lib/persistence";

interface Timesheet {
  id: string;
  teacherId: string;
  teacherName: string;
  schoolId: string;
  schoolName: string;
  date: string;
  hoursWorked: number;
  status: "pending" | "approved" | "rejected";
  notes?: string;
}

const Timesheets = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTimesheet, setNewTimesheet] = useState({
    teacherId: "",
    schoolId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    hoursWorked: 8,
    notes: "",
  });

  // Sample data
  const teachers = [
    { id: "teach-001", name: "John Smith" },
    { id: "teach-002", name: "Sarah Johnson" },
    { id: "teach-003", name: "Michael Chen" },
    { id: "teach-004", name: "Emily Rodriguez" },
    { id: "teach-005", name: "David Wilson" },
  ];

  const schools = [
    { id: "sch-001", name: "Westfield High School" },
    { id: "sch-002", name: "Oakridge Elementary" },
    { id: "sch-003", name: "Riverside College" },
    { id: "sch-004", name: "Sunshine Special School" },
    { id: "sch-005", name: "Northside Academy" },
  ];

  const timesheets: Timesheet[] = [
    {
      id: "ts-001",
      teacherId: "teach-001",
      teacherName: "John Smith",
      schoolId: "sch-001",
      schoolName: "Westfield High School",
      date: "2023-06-15",
      hoursWorked: 8,
      status: "approved",
      notes: "Regular teaching hours",
    },
    {
      id: "ts-002",
      teacherId: "teach-002",
      teacherName: "Sarah Johnson",
      schoolId: "sch-002",
      schoolName: "Oakridge Elementary",
      date: "2023-06-15",
      hoursWorked: 6.5,
      status: "pending",
      notes: "Half day due to staff meeting",
    },
    {
      id: "ts-003",
      teacherId: "teach-003",
      teacherName: "Michael Chen",
      schoolId: "sch-003",
      schoolName: "Riverside College",
      date: "2023-06-14",
      hoursWorked: 8,
      status: "approved",
    },
    {
      id: "ts-004",
      teacherId: "teach-004",
      teacherName: "Emily Rodriguez",
      schoolId: "sch-004",
      schoolName: "Sunshine Special School",
      date: "2023-06-14",
      hoursWorked: 7,
      status: "rejected",
      notes: "Hours don't match school records",
    },
    {
      id: "ts-005",
      teacherId: "teach-005",
      teacherName: "David Wilson",
      schoolId: "sch-005",
      schoolName: "Northside Academy",
      date: "2023-06-13",
      hoursWorked: 8,
      status: "approved",
    },
  ];

  // Filter timesheets based on search term and status filter
  const filteredTimesheets = timesheets.filter((timesheet) => {
    const matchesSearch =
      timesheet.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      timesheet.schoolName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || timesheet.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get status badge
  const getStatusBadge = (status: Timesheet["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return null;
    }
  };

  const handleAddTimesheet = () => {
    toastDemoAction("Timesheet added");
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Timesheets</CardTitle>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add Timesheet</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search timesheets..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[180px] justify-start text-left font-normal",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "MMMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTimesheets.length > 0 ? (
                  filteredTimesheets.map((timesheet) => (
                    <TableRow key={timesheet.id}>
                      <TableCell className="font-medium">
                        {timesheet.teacherName}
                      </TableCell>
                      <TableCell>{timesheet.schoolName}</TableCell>
                      <TableCell>{timesheet.date}</TableCell>
                      <TableCell>{timesheet.hoursWorked} hrs</TableCell>
                      <TableCell>{getStatusBadge(timesheet.status)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {timesheet.notes || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Timesheet</DropdownMenuItem>
                            {timesheet.status === "pending" && (
                              <>
                                <DropdownMenuItem className="text-green-600">
                                  <Check className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <X className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-gray-500">No timesheets found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Timesheet Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Timesheet</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="teacher" className="text-sm font-medium">
                Teacher
              </label>
              <Select
                value={newTimesheet.teacherId}
                onValueChange={(value) =>
                  setNewTimesheet({ ...newTimesheet, teacherId: value })
                }
              >
                <SelectTrigger id="teacher">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="school" className="text-sm font-medium">
                School
              </label>
              <Select
                value={newTimesheet.schoolId}
                onValueChange={(value) =>
                  setNewTimesheet({ ...newTimesheet, schoolId: value })
                }
              >
                <SelectTrigger id="school">
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="date" className="text-sm font-medium">
                Date
              </label>
              <Input
                id="date"
                type="date"
                value={newTimesheet.date}
                onChange={(e) =>
                  setNewTimesheet({ ...newTimesheet, date: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="hours" className="text-sm font-medium">
                Hours Worked
              </label>
              <Input
                id="hours"
                type="number"
                min="0"
                step="0.5"
                value={newTimesheet.hoursWorked}
                onChange={(e) =>
                  setNewTimesheet({
                    ...newTimesheet,
                    hoursWorked: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes (Optional)
              </label>
              <Input
                id="notes"
                value={newTimesheet.notes}
                onChange={(e) =>
                  setNewTimesheet({ ...newTimesheet, notes: e.target.value })
                }
                placeholder="Add any additional information"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddTimesheet}
              disabled={
                !newTimesheet.teacherId ||
                !newTimesheet.schoolId ||
                !newTimesheet.date
              }
            >
              Submit Timesheet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Timesheets;
