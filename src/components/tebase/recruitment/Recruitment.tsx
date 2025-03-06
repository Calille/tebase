import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  UserPlus,
  Mail,
  Phone,
  FileText,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  Building,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  status: "pending" | "review" | "interview" | "approved" | "rejected";
  appliedDate: string;
  avatar: string;
  resumeUrl?: string;
}

const Recruitment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("applicants");

  // Sample data for applicants
  const applicants: Applicant[] = [
    {
      id: "app-001",
      name: "Jessica Taylor",
      email: "jessica.taylor@example.com",
      phone: "(555) 123-4567",
      position: "Mathematics Teacher",
      status: "review",
      appliedDate: "2023-06-10",
      experience: "5 years",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jessica",
      resumeUrl: "#",
    },
    {
      id: "app-002",
      name: "Robert Brown",
      email: "robert.brown@example.com",
      phone: "(555) 234-5678",
      position: "Science Teacher",
      status: "interview",
      appliedDate: "2023-06-05",
      experience: "3 years",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=robert",
      resumeUrl: "#",
    },
    {
      id: "app-003",
      name: "Amanda Lee",
      email: "amanda.lee@example.com",
      phone: "(555) 345-6789",
      position: "English Teacher",
      status: "pending",
      appliedDate: "2023-06-12",
      experience: "2 years",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=amanda",
      resumeUrl: "#",
    },
    {
      id: "app-004",
      name: "Michael Wilson",
      email: "michael.wilson@example.com",
      phone: "(555) 456-7890",
      position: "Physical Education Teacher",
      status: "approved",
      appliedDate: "2023-06-01",
      experience: "7 years",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
      resumeUrl: "#",
    },
    {
      id: "app-005",
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      phone: "(555) 567-8901",
      position: "Art Teacher",
      status: "rejected",
      appliedDate: "2023-06-03",
      experience: "4 years",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      resumeUrl: "#",
    },
  ];

  // Sample data for job postings
  const jobPostings = [
    {
      id: "job-001",
      title: "Mathematics Teacher",
      department: "Secondary Education",
      type: "Full-time",
      location: "Manchester",
      postedDate: "2023-06-01",
      applicants: 12,
      status: "active",
    },
    {
      id: "job-002",
      title: "Science Teacher",
      department: "Secondary Education",
      type: "Full-time",
      location: "Liverpool",
      postedDate: "2023-06-03",
      applicants: 8,
      status: "active",
    },
    {
      id: "job-003",
      title: "English Teacher",
      department: "Primary Education",
      type: "Part-time",
      location: "Birmingham",
      postedDate: "2023-06-05",
      applicants: 5,
      status: "active",
    },
    {
      id: "job-004",
      title: "Physical Education Teacher",
      department: "Secondary Education",
      type: "Full-time",
      location: "Leeds",
      postedDate: "2023-05-25",
      applicants: 10,
      status: "closed",
    },
  ];

  // Filter applicants based on search term and status filter
  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch =
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || applicant.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get status badge for applicants
  const getStatusBadge = (status: Applicant["status"]) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
      case "review":
        return <Badge className="bg-blue-100 text-blue-800">In Review</Badge>;
      case "interview":
        return (
          <Badge className="bg-purple-100 text-purple-800">Interview</Badge>
        );
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return null;
    }
  };

  // Get status icon for applicants
  const getStatusIcon = (status: Applicant["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <Tabs
        defaultValue="applicants"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="applicants">Applicants</TabsTrigger>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
          <TabsTrigger value="pipeline">Recruitment Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="applicants" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search applicants..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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
                  <SelectItem value="review">In Review</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplicants.length > 0 ? (
                    filteredApplicants.map((applicant) => (
                      <TableRow key={applicant.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={applicant.avatar}
                                alt={applicant.name}
                              />
                              <AvatarFallback>
                                {applicant.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {applicant.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {applicant.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{applicant.position}</TableCell>
                        <TableCell>{applicant.experience}</TableCell>
                        <TableCell>{applicant.appliedDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(applicant.status)}
                            {getStatusBadge(applicant.status)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download Resume
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Phone className="h-4 w-4 mr-2" />
                                Call
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule Interview
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <UserPlus className="h-12 w-12 text-gray-300 mb-2" />
                          <p className="text-gray-500">
                            No applicants found matching your criteria.
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

        <TabsContent value="jobs" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Active Job Postings</h2>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Post New Job
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobPostings.map((job) => (
              <Card
                key={job.id}
                className={`overflow-hidden hover:shadow-md transition-shadow ${job.status === "closed" ? "opacity-70" : ""}`}
              >
                <div className="bg-gray-50 p-4 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <p className="text-sm text-gray-500">
                        {job.department} • {job.type}
                      </p>
                    </div>
                    <Badge
                      className={`${job.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {job.status === "active" ? "Active" : "Closed"}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Posted: {job.postedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {job.applicants} applicants
                      </span>
                    </div>
                    <div className="pt-2 flex justify-between">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={job.status === "closed"}
                      >
                        View Applicants
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Recruitment Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="relative">
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-8">
                    <div className="relative">
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                          <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center z-10">
                            <span className="text-lg font-bold">8</span>
                          </div>
                        </div>
                        <div className="ml-6 bg-gray-50 p-4 rounded-lg flex-1">
                          <h3 className="font-semibold text-lg">
                            New Applications
                          </h3>
                          <p className="text-gray-600 mb-2">
                            Applications awaiting initial screening
                          </p>
                          <Button variant="outline" size="sm">
                            View Applications
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center z-10">
                            <span className="text-lg font-bold text-blue-800">
                              5
                            </span>
                          </div>
                        </div>
                        <div className="ml-6 bg-blue-50 p-4 rounded-lg flex-1">
                          <h3 className="font-semibold text-lg">In Review</h3>
                          <p className="text-gray-600 mb-2">
                            Applications being reviewed by hiring managers
                          </p>
                          <Button variant="outline" size="sm">
                            View Applications
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                          <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center z-10">
                            <span className="text-lg font-bold text-purple-800">
                              3
                            </span>
                          </div>
                        </div>
                        <div className="ml-6 bg-purple-50 p-4 rounded-lg flex-1">
                          <h3 className="font-semibold text-lg">
                            Interview Stage
                          </h3>
                          <p className="text-gray-600 mb-2">
                            Candidates scheduled for or completed interviews
                          </p>
                          <Button variant="outline" size="sm">
                            View Candidates
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center z-10">
                            <span className="text-lg font-bold text-green-800">
                              2
                            </span>
                          </div>
                        </div>
                        <div className="ml-6 bg-green-50 p-4 rounded-lg flex-1">
                          <h3 className="font-semibold text-lg">
                            Offer Extended
                          </h3>
                          <p className="text-gray-600 mb-2">
                            Candidates who have received job offers
                          </p>
                          <Button variant="outline" size="sm">
                            View Offers
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                          <div className="h-16 w-16 rounded-full bg-green-200 flex items-center justify-center z-10">
                            <span className="text-lg font-bold text-green-800">
                              1
                            </span>
                          </div>
                        </div>
                        <div className="ml-6 bg-green-50 p-4 rounded-lg flex-1">
                          <h3 className="font-semibold text-lg">Hired</h3>
                          <p className="text-gray-600 mb-2">
                            Candidates who have accepted offers and completed
                            onboarding
                          </p>
                          <Button variant="outline" size="sm">
                            View New Hires
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Recruitment;
