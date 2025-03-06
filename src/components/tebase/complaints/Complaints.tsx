import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
import {
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Clock,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  MessageSquare,
  User,
  Building,
  FileText,
} from "lucide-react";
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

interface Complaint {
  id: string;
  title: string;
  description: string;
  type: "teacher" | "school" | "system" | "other";
  severity: "low" | "medium" | "high";
  status: "new" | "in-progress" | "resolved" | "closed";
  submittedBy: string;
  submittedDate: string;
  assignedTo?: string;
  resolvedDate?: string;
}

const Complaints = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("active");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    title: "",
    description: "",
    type: "teacher" as const,
    severity: "medium" as const,
  });

  // Sample complaints data
  const complaints: Complaint[] = [
    {
      id: "comp-001",
      title: "Teacher Late Arrival",
      description:
        "John Smith was 30 minutes late for his class at Westfield High School.",
      type: "teacher",
      severity: "medium",
      status: "new",
      submittedBy: "Jane Wilson (School Admin)",
      submittedDate: "2023-06-15 09:30",
    },
    {
      id: "comp-002",
      title: "Unprofessional Conduct",
      description:
        "Teacher Sarah Johnson displayed unprofessional behavior during class.",
      type: "teacher",
      severity: "high",
      status: "in-progress",
      submittedBy: "Robert Brown (Principal)",
      submittedDate: "2023-06-14 14:45",
      assignedTo: "HR Department",
    },
    {
      id: "comp-003",
      title: "Booking System Error",
      description:
        "Unable to book teachers through the system for the past 2 days.",
      type: "system",
      severity: "high",
      status: "in-progress",
      submittedBy: "Emily Davis (Admin)",
      submittedDate: "2023-06-13 11:20",
      assignedTo: "IT Support",
    },
    {
      id: "comp-004",
      title: "Poor Facilities",
      description:
        "Classroom at Oakridge Elementary lacks proper heating and ventilation.",
      type: "school",
      severity: "medium",
      status: "new",
      submittedBy: "Michael Chen (Teacher)",
      submittedDate: "2023-06-12 16:10",
    },
    {
      id: "comp-005",
      title: "Payment Delay",
      description: "Teacher has not received payment for May assignments.",
      type: "other",
      severity: "medium",
      status: "resolved",
      submittedBy: "David Wilson (Teacher)",
      submittedDate: "2023-06-10 08:15",
      resolvedDate: "2023-06-15 14:30",
      assignedTo: "Finance Department",
    },
    {
      id: "comp-006",
      title: "Inappropriate Teaching Material",
      description:
        "Teacher used inappropriate teaching materials for primary school students.",
      type: "teacher",
      severity: "high",
      status: "closed",
      submittedBy: "Amanda Lee (Parent)",
      submittedDate: "2023-06-05 13:40",
      resolvedDate: "2023-06-08 15:20",
      assignedTo: "Education Standards Team",
    },
  ];

  // Filter complaints based on search term, status, and severity filters
  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || complaint.status === statusFilter;

    const matchesSeverity =
      severityFilter === "all" || complaint.severity === severityFilter;

    const matchesTab =
      (activeTab === "active" &&
        (complaint.status === "new" || complaint.status === "in-progress")) ||
      (activeTab === "resolved" &&
        (complaint.status === "resolved" || complaint.status === "closed")) ||
      activeTab === "all";

    return matchesSearch && matchesStatus && matchesSeverity && matchesTab;
  });

  // Get severity badge
  const getSeverityBadge = (severity: Complaint["severity"]) => {
    switch (severity) {
      case "low":
        return <Badge className="bg-blue-100 text-blue-800">Low</Badge>;
      case "medium":
        return <Badge className="bg-amber-100 text-amber-800">Medium</Badge>;
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      default:
        return null;
    }
  };

  // Get status badge
  const getStatusBadge = (status: Complaint["status"]) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-100 text-blue-800">New</Badge>;
      case "in-progress":
        return (
          <Badge className="bg-amber-100 text-amber-800">In Progress</Badge>
        );
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return null;
    }
  };

  // Get type icon
  const getTypeIcon = (type: Complaint["type"]) => {
    switch (type) {
      case "teacher":
        return <User className="h-5 w-5 text-blue-500" />;
      case "school":
        return <Building className="h-5 w-5 text-green-500" />;
      case "system":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "other":
        return <FileText className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Handle add complaint
  const handleAddComplaint = () => {
    // Logic to add complaint would go here
    console.log("Adding complaint:", newComplaint);
    setIsAddDialogOpen(false);
    // Reset form
    setNewComplaint({
      title: "",
      description: "",
      type: "teacher",
      severity: "medium",
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <Tabs
        defaultValue="active"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="active">Active Complaints</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="all">All Complaints</TabsTrigger>
          </TabsList>

          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            File Complaint
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search complaints..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[150px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={severityFilter}
              onValueChange={(value) => setSeverityFilter(value)}
            >
              <SelectTrigger className="w-[150px]">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <SelectValue placeholder="Severity" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="active" className="space-y-6">
          <Card className="bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Complaint</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.length > 0 ? (
                    filteredComplaints.map((complaint) => (
                      <TableRow key={complaint.id}>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getTypeIcon(complaint.type)}
                            </div>
                            <div>
                              <div className="font-medium">
                                {complaint.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {complaint.description.length > 60
                                  ? `${complaint.description.substring(0, 60)}...`
                                  : complaint.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getSeverityBadge(complaint.severity)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(complaint.status)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">
                                {complaint.submittedDate}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              by {complaint.submittedBy}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {complaint.assignedTo || (
                            <span className="text-gray-400 text-sm">
                              Not assigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              Respond
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>Assign To</DropdownMenuItem>
                                <DropdownMenuItem>
                                  Change Status
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Mark as Resolved
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <AlertTriangle className="h-12 w-12 text-gray-300 mb-2" />
                          <p className="text-gray-500">
                            No complaints found matching your criteria.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolved" className="space-y-6">
          <Card className="bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Complaint</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Resolved</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.length > 0 ? (
                    filteredComplaints.map((complaint) => (
                      <TableRow key={complaint.id}>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getTypeIcon(complaint.type)}
                            </div>
                            <div>
                              <div className="font-medium">
                                {complaint.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {complaint.description.length > 60
                                  ? `${complaint.description.substring(0, 60)}...`
                                  : complaint.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getSeverityBadge(complaint.severity)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(complaint.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {complaint.submittedDate}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">
                              {complaint.resolvedDate}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <CheckCircle className="h-12 w-12 text-gray-300 mb-2" />
                          <p className="text-gray-500">
                            No resolved complaints found matching your criteria.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <Card className="bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Complaint</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.length > 0 ? (
                    filteredComplaints.map((complaint) => (
                      <TableRow key={complaint.id}>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getTypeIcon(complaint.type)}
                            </div>
                            <div>
                              <div className="font-medium">
                                {complaint.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {complaint.description.length > 60
                                  ? `${complaint.description.substring(0, 60)}...`
                                  : complaint.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getSeverityBadge(complaint.severity)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(complaint.status)}
                        </TableCell>
                        <TableCell>{complaint.submittedBy}</TableCell>
                        <TableCell>
                          {complaint.assignedTo || (
                            <span className="text-gray-400 text-sm">
                              Not assigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <AlertTriangle className="h-12 w-12 text-gray-300 mb-2" />
                          <p className="text-gray-500">
                            No complaints found matching your criteria.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Complaint Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>File New Complaint</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Complaint Title
              </label>
              <Input
                id="title"
                value={newComplaint.title}
                onChange={(e) =>
                  setNewComplaint({ ...newComplaint, title: e.target.value })
                }
                placeholder="Brief title of the complaint"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={newComplaint.description}
                onChange={(e) =>
                  setNewComplaint({
                    ...newComplaint,
                    description: e.target.value,
                  })
                }
                placeholder="Detailed description of the complaint"
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="type" className="text-sm font-medium">
                Complaint Type
              </label>
              <Select
                value={newComplaint.type}
                onValueChange={(
                  value: "teacher" | "school" | "system" | "other",
                ) => setNewComplaint({ ...newComplaint, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Teacher Related</SelectItem>
                  <SelectItem value="school">School Related</SelectItem>
                  <SelectItem value="system">System Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="severity" className="text-sm font-medium">
                Severity
              </label>
              <Select
                value={newComplaint.severity}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setNewComplaint({ ...newComplaint, severity: value })
                }
              >
                <SelectTrigger id="severity">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddComplaint}
              disabled={!newComplaint.title || !newComplaint.description}
            >
              Submit Complaint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Complaints;
