import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  ChevronDown,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Star,
  StarOff,
  FileText,
  Clock,
  Eye,
} from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  status: "active" | "inactive" | "pending";
  lastBooking: string;
  rating: number;
  favorite: boolean;
  availability: "full-time" | "part-time" | "weekends";
}

interface TeacherListProps {
  teachers?: Teacher[];
  onViewTeacher?: (teacherId: string) => void;
  onAddTeacher?: (teacher: Omit<Teacher, "id">) => void;
  onUpdateTeacher?: (teacher: Teacher) => void;
  onDeleteTeacher?: (teacherId: string) => void;
}

const TeacherList = ({
  teachers: initialTeachers,
  onViewTeacher,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
}: TeacherListProps) => {
  // Default teachers data if none provided
  const defaultTeachers: Teacher[] = [
    {
      id: "teach-001",
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "(555) 123-4567",
      subjects: ["Mathematics", "Physics"],
      status: "active",
      lastBooking: "2023-06-15",
      rating: 4.8,
      favorite: true,
      availability: "full-time",
    },
    {
      id: "teach-002",
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "(555) 987-6543",
      subjects: ["English", "Literature"],
      status: "active",
      lastBooking: "2023-06-10",
      rating: 4.5,
      favorite: false,
      availability: "part-time",
    },
    {
      id: "teach-003",
      name: "Michael Chen",
      email: "m.chen@example.com",
      phone: "(555) 456-7890",
      subjects: ["Chemistry", "Biology"],
      status: "active",
      lastBooking: "2023-06-05",
      rating: 4.9,
      favorite: true,
      availability: "full-time",
    },
    {
      id: "teach-004",
      name: "Emily Rodriguez",
      email: "emily.r@example.com",
      phone: "(555) 234-5678",
      subjects: ["Art", "History"],
      status: "inactive",
      lastBooking: "2023-05-28",
      rating: 4.2,
      favorite: false,
      availability: "weekends",
    },
    {
      id: "teach-005",
      name: "David Wilson",
      email: "d.wilson@example.com",
      phone: "(555) 876-5432",
      subjects: ["Physical Education", "Health"],
      status: "active",
      lastBooking: "2023-06-12",
      rating: 4.7,
      favorite: false,
      availability: "full-time",
    },
    {
      id: "teach-006",
      name: "Jennifer Lee",
      email: "j.lee@example.com",
      phone: "(555) 345-6789",
      subjects: ["Music", "Drama"],
      status: "pending",
      lastBooking: "2023-06-08",
      rating: 4.6,
      favorite: true,
      availability: "part-time",
    },
    {
      id: "teach-007",
      name: "Robert Taylor",
      email: "r.taylor@example.com",
      phone: "(555) 654-3210",
      subjects: ["Computer Science", "Mathematics"],
      status: "active",
      lastBooking: "2023-06-01",
      rating: 4.9,
      favorite: false,
      availability: "full-time",
    },
  ];

  const [teachers, setTeachers] = useState<Teacher[]>(
    initialTeachers || defaultTeachers,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Teacher>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    email: "",
    phone: "",
    subjects: [] as string[],
    status: "pending" as const,
    availability: "part-time" as const,
  });

  const itemsPerPage = 5;

  // Filter teachers based on search term and status filter
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subjects.some((subject) =>
        subject.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesStatus =
      statusFilter === "all" || teacher.status === statusFilter;

    const matchesAvailability =
      availabilityFilter === "all" ||
      teacher.availability === availabilityFilter;

    return matchesSearch && matchesStatus && matchesAvailability;
  });

  // Sort teachers
  const sortedTeachers = [...filteredTeachers].sort((a, b) => {
    if (sortField === "rating") {
      return sortDirection === "asc"
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField];
    } else {
      const aValue = String(a[sortField]).toLowerCase();
      const bValue = String(b[sortField]).toLowerCase();
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
  });

  // Paginate teachers
  const totalPages = Math.ceil(sortedTeachers.length / itemsPerPage);
  const paginatedTeachers = sortedTeachers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Handle sort
  const handleSort = (field: keyof Teacher) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle view teacher
  const handleViewTeacher = (teacherId: string) => {
    if (onViewTeacher) {
      onViewTeacher(teacherId);
    } else {
      console.log(`View teacher with ID: ${teacherId}`);
    }
  };

  // Handle add teacher
  const handleAddTeacher = () => {
    const teacher = {
      ...newTeacher,
      lastBooking: "-",
      rating: 0,
      favorite: false,
    };

    if (onAddTeacher) {
      onAddTeacher(teacher);
    } else {
      const newTeacherWithId: Teacher = {
        ...teacher,
        id: `teach-${Date.now().toString().slice(-6)}`,
      };
      setTeachers([...teachers, newTeacherWithId]);
    }

    setNewTeacher({
      name: "",
      email: "",
      phone: "",
      subjects: [],
      status: "pending",
      availability: "part-time",
    });
    setIsAddDialogOpen(false);
  };

  // Handle toggle favorite
  const handleToggleFavorite = (teacherId: string) => {
    const updatedTeachers = teachers.map((teacher) =>
      teacher.id === teacherId
        ? { ...teacher, favorite: !teacher.favorite }
        : teacher,
    );

    if (onUpdateTeacher) {
      const teacherToUpdate = updatedTeachers.find((c) => c.id === teacherId);
      if (teacherToUpdate) {
        onUpdateTeacher(teacherToUpdate);
      }
    }

    setTeachers(updatedTeachers);
  };

  // Handle delete teacher
  const handleDeleteTeacher = (teacherId: string) => {
    if (onDeleteTeacher) {
      onDeleteTeacher(teacherId);
    } else {
      setTeachers(teachers.filter((teacher) => teacher.id !== teacherId));
    }
  };

  // Get status badge
  const getStatusBadge = (status: Teacher["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return (
          <Badge variant="outline" className="text-gray-500">
            Inactive
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get availability badge
  const getAvailabilityBadge = (availability: Teacher["availability"]) => {
    switch (availability) {
      case "full-time":
        return <Badge className="bg-blue-100 text-blue-800">Full-time</Badge>;
      case "part-time":
        return (
          <Badge className="bg-purple-100 text-purple-800">Part-time</Badge>
        );
      case "weekends":
        return (
          <Badge className="bg-indigo-100 text-indigo-800">Weekends</Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Teachers</h2>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add Teacher</span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search teachers..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={availabilityFilter}
              onValueChange={(value) => setAvailabilityFilter(value)}
            >
              <SelectTrigger className="w-[150px]">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <SelectValue placeholder="Availability" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availability</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="weekends">Weekends</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  Name
                  {sortField === "name" && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                    />
                  )}
                </div>
              </TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("lastBooking")}
              >
                <div className="flex items-center gap-1">
                  Last Booking
                  {sortField === "lastBooking" && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                    />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort("rating")}
              >
                <div className="flex items-center justify-end gap-1">
                  Rating
                  {sortField === "rating" && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                    />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTeachers.length > 0 ? (
              paginatedTeachers.map((teacher) => (
                <TableRow
                  key={teacher.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleViewTeacher(teacher.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(teacher.id);
                        }}
                        className="text-gray-400 hover:text-yellow-400 transition-colors"
                      >
                        {teacher.favorite ? (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </button>
                      <span className="font-medium">{teacher.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subject) => (
                        <Badge
                          key={subject}
                          variant="outline"
                          className="text-xs"
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                  <TableCell>
                    {getAvailabilityBadge(teacher.availability)}
                  </TableCell>
                  <TableCell>{teacher.lastBooking}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <span className="font-medium">
                        {teacher.rating.toFixed(1)}
                      </span>
                      <Star className="h-4 w-4 ml-1 text-yellow-400 fill-yellow-400" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewTeacher(teacher.id);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `mailto:${teacher.email}`;
                          }}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `tel:${teacher.phone}`;
                          }}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            // Book teacher logic would go here
                            console.log(`Book ${teacher.name}`);
                          }}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Teacher
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            // View availability logic would go here
                            console.log(
                              `View availability for ${teacher.name}`,
                            );
                          }}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          View Availability
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            // View timesheets logic would go here
                            console.log(`View timesheets for ${teacher.name}`);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Timesheets
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTeacher(teacher.id);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {searchTerm ||
                  statusFilter !== "all" ||
                  availabilityFilter !== "all" ? (
                    <div className="text-gray-500">
                      No teachers found matching your search criteria.
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <UserPlus className="h-12 w-12 text-gray-300 mb-2" />
                      <div className="text-gray-500 mb-2">
                        No teachers added yet
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(true)}
                      >
                        Add Your First Teacher
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Add Teacher Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                value={newTeacher.name}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, name: e.target.value })
                }
                placeholder="John Smith"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={newTeacher.email}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, email: e.target.value })
                }
                placeholder="john.smith@example.com"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone
              </label>
              <Input
                id="phone"
                value={newTeacher.phone}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, phone: e.target.value })
                }
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="subjects" className="text-sm font-medium">
                Subjects (comma separated)
              </label>
              <Input
                id="subjects"
                value={newTeacher.subjects.join(", ")}
                onChange={(e) =>
                  setNewTeacher({
                    ...newTeacher,
                    subjects: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter((s) => s),
                  })
                }
                placeholder="Mathematics, Physics"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select
                value={newTeacher.status}
                onValueChange={(value: "active" | "inactive" | "pending") =>
                  setNewTeacher({ ...newTeacher, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="availability" className="text-sm font-medium">
                Availability
              </label>
              <Select
                value={newTeacher.availability}
                onValueChange={(
                  value: "full-time" | "part-time" | "weekends",
                ) => setNewTeacher({ ...newTeacher, availability: value })}
              >
                <SelectTrigger id="availability">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="weekends">Weekends</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddTeacher}
              disabled={!newTeacher.name || !newTeacher.email}
            >
              Add Teacher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherList;
