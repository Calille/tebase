import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  School,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";

interface Vacancy {
  id: string;
  title: string;
  schoolId: string;
  schoolName: string;
  location: string;
  subject: string;
  type: "full-time" | "part-time" | "temporary";
  startDate: string;
  endDate?: string;
  rate: number;
  status: "open" | "filled" | "closed";
  description: string;
  requirements: string[];
  postedDate: string;
}

const Vacancies = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newVacancy, setNewVacancy] = useState({
    title: "",
    schoolId: "",
    location: "",
    subject: "",
    type: "full-time" as const,
    startDate: "",
    endDate: "",
    rate: 0,
    description: "",
    requirements: [] as string[],
  });

  // Sample data
  const schools = [
    { id: "sch-001", name: "Westfield High School" },
    { id: "sch-002", name: "Oakridge Elementary" },
    { id: "sch-003", name: "Riverside College" },
    { id: "sch-004", name: "Sunshine Special School" },
    { id: "sch-005", name: "Northside Academy" },
  ];

  const vacancies: Vacancy[] = [
    {
      id: "vac-001",
      title: "Mathematics Teacher",
      schoolId: "sch-001",
      schoolName: "Westfield High School",
      location: "Manchester",
      subject: "Mathematics",
      type: "full-time",
      startDate: "2023-09-01",
      rate: 150,
      status: "open",
      description:
        "We are seeking a qualified Mathematics teacher to join our team. The successful candidate will be responsible for teaching Mathematics to students in grades 9-12.",
      requirements: [
        "Bachelor's degree in Mathematics or related field",
        "Teaching certification",
        "2+ years of teaching experience",
      ],
      postedDate: "2023-06-01",
    },
    {
      id: "vac-002",
      title: "English Teacher",
      schoolId: "sch-002",
      schoolName: "Oakridge Elementary",
      location: "Birmingham",
      subject: "English",
      type: "part-time",
      startDate: "2023-09-01",
      rate: 120,
      status: "open",
      description:
        "Seeking a part-time English teacher for elementary school students. Responsibilities include teaching grammar, reading comprehension, and writing skills.",
      requirements: [
        "Bachelor's degree in English or Education",
        "Experience working with elementary school students",
        "Strong communication skills",
      ],
      postedDate: "2023-06-05",
    },
    {
      id: "vac-003",
      title: "Science Teacher",
      schoolId: "sch-003",
      schoolName: "Riverside College",
      location: "Liverpool",
      subject: "Biology",
      type: "full-time",
      startDate: "2023-09-01",
      rate: 160,
      status: "filled",
      description:
        "Biology teacher needed for college-level courses. Will be teaching introductory and advanced biology concepts to students.",
      requirements: [
        "Master's degree in Biology or related field",
        "Previous teaching experience at college level",
        "Strong laboratory skills",
      ],
      postedDate: "2023-05-20",
    },
    {
      id: "vac-004",
      title: "Special Education Teacher",
      schoolId: "sch-004",
      schoolName: "Sunshine Special School",
      location: "Leeds",
      subject: "Special Education",
      type: "full-time",
      startDate: "2023-09-01",
      rate: 170,
      status: "open",
      description:
        "Special education teacher needed to work with students with various learning disabilities. Will develop and implement individualized education plans.",
      requirements: [
        "Degree in Special Education",
        "Experience working with special needs students",
        "Patience and adaptability",
      ],
      postedDate: "2023-06-10",
    },
    {
      id: "vac-005",
      title: "Substitute Teacher",
      schoolId: "sch-005",
      schoolName: "Northside Academy",
      location: "Newcastle",
      subject: "Various",
      type: "temporary",
      startDate: "2023-09-01",
      endDate: "2023-12-20",
      rate: 110,
      status: "closed",
      description:
        "Substitute teacher needed for various subjects. Will fill in for absent teachers as needed throughout the school year.",
      requirements: [
        "Bachelor's degree",
        "Flexibility and adaptability",
        "Experience with classroom management",
      ],
      postedDate: "2023-05-15",
    },
  ];

  // Filter vacancies based on search term and filters
  const filteredVacancies = vacancies.filter((vacancy) => {
    const matchesSearch =
      vacancy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacancy.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacancy.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacancy.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || vacancy.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || vacancy.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Get type badge
  const getTypeBadge = (type: Vacancy["type"]) => {
    switch (type) {
      case "full-time":
        return <Badge className="bg-blue-100 text-blue-800">Full-time</Badge>;
      case "part-time":
        return (
          <Badge className="bg-purple-100 text-purple-800">Part-time</Badge>
        );
      case "temporary":
        return <Badge className="bg-amber-100 text-amber-800">Temporary</Badge>;
      default:
        return null;
    }
  };

  // Get status badge
  const getStatusBadge = (status: Vacancy["status"]) => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-100 text-green-800">Open</Badge>;
      case "filled":
        return <Badge className="bg-blue-100 text-blue-800">Filled</Badge>;
      case "closed":
        return (
          <Badge variant="outline" className="text-gray-500">
            Closed
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleAddVacancy = () => {
    // Logic to add vacancy would go here
    console.log("Adding vacancy:", newVacancy);
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Open Vacancies</CardTitle>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Post Vacancy</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vacancies..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <SelectValue placeholder="Type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="filled">Filled</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVacancies.length > 0 ? (
              filteredVacancies.map((vacancy) => (
                <Card
                  key={vacancy.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="bg-gray-50 p-4 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {vacancy.title}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                          <School className="h-4 w-4" />
                          <span>{vacancy.schoolName}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Vacancy</DropdownMenuItem>
                          <DropdownMenuItem>View Applicants</DropdownMenuItem>
                          {vacancy.status === "open" && (
                            <DropdownMenuItem>Mark as Filled</DropdownMenuItem>
                          )}
                          {vacancy.status !== "closed" && (
                            <DropdownMenuItem>Close Vacancy</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{vacancy.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{vacancy.subject}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          Start: {vacancy.startDate}
                          {vacancy.endDate && ` | End: ${vacancy.endDate}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex gap-2">
                          {getTypeBadge(vacancy.type)}
                          {getStatusBadge(vacancy.status)}
                        </div>
                        <div className="text-sm font-semibold">
                          £{vacancy.rate}/day
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">
                  No vacancies found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Vacancy Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Post New Vacancy</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Job Title
              </label>
              <Input
                id="title"
                value={newVacancy.title}
                onChange={(e) =>
                  setNewVacancy({ ...newVacancy, title: e.target.value })
                }
                placeholder="Mathematics Teacher"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="school" className="text-sm font-medium">
                School
              </label>
              <Select
                value={newVacancy.schoolId}
                onValueChange={(value) =>
                  setNewVacancy({ ...newVacancy, schoolId: value })
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
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <Input
                id="location"
                value={newVacancy.location}
                onChange={(e) =>
                  setNewVacancy({ ...newVacancy, location: e.target.value })
                }
                placeholder="Manchester"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="subject" className="text-sm font-medium">
                Subject
              </label>
              <Input
                id="subject"
                value={newVacancy.subject}
                onChange={(e) =>
                  setNewVacancy({ ...newVacancy, subject: e.target.value })
                }
                placeholder="Mathematics"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="type" className="text-sm font-medium">
                Employment Type
              </label>
              <Select
                value={newVacancy.type}
                onValueChange={(
                  value: "full-time" | "part-time" | "temporary",
                ) => setNewVacancy({ ...newVacancy, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="startDate" className="text-sm font-medium">
                  Start Date
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={newVacancy.startDate}
                  onChange={(e) =>
                    setNewVacancy({ ...newVacancy, startDate: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="endDate" className="text-sm font-medium">
                  End Date (Optional)
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={newVacancy.endDate}
                  onChange={(e) =>
                    setNewVacancy({ ...newVacancy, endDate: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="rate" className="text-sm font-medium">
                Daily Rate (£)
              </label>
              <Input
                id="rate"
                type="number"
                min="0"
                value={newVacancy.rate}
                onChange={(e) =>
                  setNewVacancy({
                    ...newVacancy,
                    rate: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="150"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Job Description
              </label>
              <Textarea
                id="description"
                value={newVacancy.description}
                onChange={(e) =>
                  setNewVacancy({ ...newVacancy, description: e.target.value })
                }
                placeholder="Describe the role and responsibilities"
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="requirements" className="text-sm font-medium">
                Requirements (one per line)
              </label>
              <Textarea
                id="requirements"
                value={newVacancy.requirements.join("\n")}
                onChange={(e) =>
                  setNewVacancy({
                    ...newVacancy,
                    requirements: e.target.value
                      .split("\n")
                      .filter((line) => line.trim() !== ""),
                  })
                }
                placeholder="Bachelor's degree in relevant field\nTeaching certification\n2+ years of experience"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddVacancy}
              disabled={
                !newVacancy.title ||
                !newVacancy.schoolId ||
                !newVacancy.startDate
              }
            >
              Post Vacancy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vacancies;
