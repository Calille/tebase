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
  Calendar,
  Mail,
  Phone,
  Clock,
  FileText,
  School,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

interface Booking {
  id: string;
  reference: string;
  school: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    name: string;
  };
  subject: string;
  startDate: string;
  endDate: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  duration: string;
  rate: number;
  notes?: string;
}

interface BookingListProps {
  bookings?: Booking[];
  onViewBooking?: (bookingId: string) => void;
  onAddBooking?: (booking: Omit<Booking, "id">) => void;
  onUpdateBooking?: (booking: Booking) => void;
  onDeleteBooking?: (bookingId: string) => void;
}

const BookingList = ({
  bookings: initialBookings,
  onViewBooking,
  onAddBooking,
  onUpdateBooking,
  onDeleteBooking,
}: BookingListProps) => {
  // Default bookings data if none provided
  const defaultBookings: Booking[] = [
    {
      id: "book-001",
      reference: "TB-2023-001",
      school: {
        id: "sch-001",
        name: "Westfield High School",
      },
      teacher: {
        id: "teach-001",
        name: "John Smith",
      },
      subject: "Mathematics",
      startDate: "2023-06-15",
      endDate: "2023-06-30",
      status: "confirmed",
      duration: "2 weeks",
      rate: 150,
      notes: "Covering for Mrs. Johnson who is on maternity leave",
    },
    {
      id: "book-002",
      reference: "TB-2023-002",
      school: {
        id: "sch-002",
        name: "Oakridge Elementary",
      },
      teacher: {
        id: "teach-002",
        name: "Sarah Johnson",
      },
      subject: "English",
      startDate: "2023-06-20",
      endDate: "2023-07-10",
      status: "pending",
      duration: "3 weeks",
      rate: 130,
      notes: "Temporary position for summer school program",
    },
    {
      id: "book-003",
      reference: "TB-2023-003",
      school: {
        id: "sch-003",
        name: "Riverside College",
      },
      teacher: {
        id: "teach-003",
        name: "Michael Chen",
      },
      subject: "Chemistry",
      startDate: "2023-06-01",
      endDate: "2023-06-10",
      status: "completed",
      duration: "2 weeks",
      rate: 175,
      notes: "Advanced placement chemistry course",
    },
    {
      id: "book-004",
      reference: "TB-2023-004",
      school: {
        id: "sch-004",
        name: "Sunshine Special School",
      },
      teacher: {
        id: "teach-004",
        name: "Emily Rodriguez",
      },
      subject: "Art Therapy",
      startDate: "2023-06-25",
      endDate: "2023-07-25",
      status: "confirmed",
      duration: "1 month",
      rate: 145,
      notes: "Working with special needs students",
    },
    {
      id: "book-005",
      reference: "TB-2023-005",
      school: {
        id: "sch-005",
        name: "Northside Academy",
      },
      teacher: {
        id: "teach-005",
        name: "David Wilson",
      },
      subject: "Physical Education",
      startDate: "2023-05-15",
      endDate: "2023-06-15",
      status: "completed",
      duration: "1 month",
      rate: 125,
      notes: "Covering all PE classes for grades 9-12",
    },
    {
      id: "book-006",
      reference: "TB-2023-006",
      school: {
        id: "sch-007",
        name: "Tech Institute",
      },
      teacher: {
        id: "teach-007",
        name: "Robert Taylor",
      },
      subject: "Computer Science",
      startDate: "2023-07-01",
      endDate: "2023-08-15",
      status: "confirmed",
      duration: "6 weeks",
      rate: 185,
      notes: "Teaching introductory programming and web development",
    },
    {
      id: "book-007",
      reference: "TB-2023-007",
      school: {
        id: "sch-002",
        name: "Oakridge Elementary",
      },
      teacher: {
        id: "teach-006",
        name: "Jennifer Lee",
      },
      subject: "Music",
      startDate: "2023-06-10",
      endDate: "2023-06-24",
      status: "cancelled",
      duration: "2 weeks",
      rate: 140,
      notes: "Cancelled due to teacher illness",
    },
  ];

  const [bookings, setBookings] = useState<Booking[]>(
    initialBookings || defaultBookings,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Booking>("startDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // State for new booking form
  const [newBooking, setNewBooking] = useState({
    teacherId: "",
    schoolId: "",
    date: new Date(),
    endDate: new Date(),
    startTime: "",
    endTime: "",
    notes: "",
    recurring: false,
    recurringDays: [] as string[],
    durationWeeks: 1,
    untilEaster: false,
    untilSummer: false,
    untilChristmas: false,
  });

  // Sample data for dropdowns
  const schools = [
    { id: "sch-001", name: "Westfield High School" },
    { id: "sch-002", name: "Oakridge Elementary" },
    { id: "sch-003", name: "Riverside College" },
    { id: "sch-004", name: "Sunshine Special School" },
    { id: "sch-005", name: "Northside Academy" },
  ];

  const teachers = [
    { id: "teach-001", name: "John Smith" },
    { id: "teach-002", name: "Sarah Johnson" },
    { id: "teach-003", name: "Michael Chen" },
    { id: "teach-004", name: "Emily Rodriguez" },
    { id: "teach-005", name: "David Wilson" },
  ];

  // Expanded time slots with 30-minute intervals
  const timeSlots = [
    "07:00",
    "07:30",
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
  ];

  const itemsPerPage = 5;

  // Filter bookings based on search term and status filter
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortField === "rate") {
      return sortDirection === "asc"
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField];
    } else if (sortField === "startDate" || sortField === "endDate") {
      const aDate = new Date(a[sortField]).getTime();
      const bDate = new Date(b[sortField]).getTime();
      return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
    } else {
      const aValue = String(a[sortField]).toLowerCase();
      const bValue = String(b[sortField]).toLowerCase();
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
  });

  // Paginate bookings
  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);
  const paginatedBookings = sortedBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Handle sort
  const handleSort = (field: keyof Booking) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle view booking
  const handleViewBooking = (bookingId: string) => {
    if (onViewBooking) {
      onViewBooking(bookingId);
    } else {
      console.log(`View booking with ID: ${bookingId}`);
    }
  };

  // Handle add booking
  const handleAddBooking = () => {
    // Create a booking object from the form data
    const selectedSchool = schools.find(
      (school) => school.id === newBooking.schoolId,
    );
    const selectedTeacher = teachers.find(
      (teacher) => teacher.id === newBooking.teacherId,
    );

    if (!selectedSchool || !selectedTeacher || !newBooking.date) {
      alert("Please fill in all required fields");
      return; // Don't proceed if required fields are missing
    }

    if (!newBooking.startTime || !newBooking.endTime) {
      alert("Please select start and end times");
      return;
    }

    const startDate = format(newBooking.date, "yyyy-MM-dd");
    // Calculate end date based on duration weeks or term end options
    let endDate;

    if (newBooking.untilEaster) {
      // Example Easter date - in production this would be calculated properly
      endDate = "2023-04-09";
    } else if (newBooking.untilSummer) {
      // Example summer term end date
      endDate = "2023-07-21";
    } else if (newBooking.untilChristmas) {
      // Example Christmas term end date
      endDate = "2023-12-20";
    } else {
      // Calculate based on weeks duration
      const endDateObj = new Date(newBooking.date);
      endDateObj.setDate(endDateObj.getDate() + newBooking.durationWeeks * 7);
      endDate = format(endDateObj, "yyyy-MM-dd");
    }

    const booking = {
      reference: `TB-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
      school: {
        id: selectedSchool.id,
        name: selectedSchool.name,
      },
      teacher: {
        id: selectedTeacher.id,
        name: selectedTeacher.name,
      },
      subject: "General", // Default subject
      startDate,
      endDate,
      status: "pending" as const,
      duration: "1 day", // Default duration
      rate: 150, // Default rate
      notes: newBooking.notes,
      recurring: newBooking.recurring,
      recurringDays: newBooking.recurringDays,
    };

    if (onAddBooking) {
      onAddBooking(booking);
    } else {
      const newBookingWithId: Booking = {
        ...booking,
        id: `book-${Date.now().toString().slice(-6)}`,
      };
      setBookings([...bookings, newBookingWithId]);
    }

    // Reset form
    setNewBooking({
      teacherId: "",
      schoolId: "",
      date: new Date(),
      endDate: new Date(),
      startTime: "",
      endTime: "",
      notes: "",
      recurring: false,
      recurringDays: [],
      durationWeeks: 1,
      untilEaster: false,
      untilSummer: false,
      untilChristmas: false,
    });
    setIsAddDialogOpen(false);
  };

  // Handle delete booking
  const handleDeleteBooking = (bookingId: string) => {
    if (onDeleteBooking) {
      onDeleteBooking(bookingId);
    } else {
      setBookings(bookings.filter((booking) => booking.id !== bookingId));
    }
  };

  // Get status badge
  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return null;
    }
  };

  // Calculate duration between two dates
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks !== 1 ? "s" : ""}`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? "s" : ""}`;
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Bookings</h2>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add Booking</span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search bookings..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
                onClick={() => handleSort("reference")}
              >
                <div className="flex items-center gap-1">
                  Reference
                  {sortField === "reference" && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                    />
                  )}
                </div>
              </TableHead>
              <TableHead>School</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("startDate")}
              >
                <div className="flex items-center gap-1">
                  Start Date
                  {sortField === "startDate" && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                    />
                  )}
                </div>
              </TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort("rate")}
              >
                <div className="flex items-center justify-end gap-1">
                  Rate (£/day)
                  {sortField === "rate" && (
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
            {paginatedBookings.length > 0 ? (
              paginatedBookings.map((booking) => (
                <TableRow
                  key={booking.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleViewBooking(booking.id)}
                >
                  <TableCell className="font-medium">
                    {booking.reference}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <School className="h-4 w-4 text-blue-500" />
                      <span>{booking.school.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-green-500" />
                      <span>{booking.teacher.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{booking.subject}</TableCell>
                  <TableCell>{booking.startDate}</TableCell>
                  <TableCell>{booking.duration}</TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell className="text-right font-medium">
                    £{booking.rate}
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
                            handleViewBooking(booking.id);
                          }}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            // Edit booking logic would go here
                            console.log(`Edit booking ${booking.reference}`);
                          }}
                        >
                          Edit Booking
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            // Contact school logic would go here
                            window.location.href = `mailto:contact@${booking.school.name.toLowerCase().replace(/ /g, "")}.edu`;
                          }}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Contact School
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            // Contact teacher logic would go here
                            window.location.href = `mailto:${booking.teacher.name.toLowerCase().replace(/ /g, ".")}@example.com`;
                          }}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Contact Teacher
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {booking.status === "pending" && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              // Confirm booking logic would go here
                              console.log(
                                `Confirm booking ${booking.reference}`,
                              );
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            Confirm Booking
                          </DropdownMenuItem>
                        )}
                        {(booking.status === "pending" ||
                          booking.status === "confirmed") && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              // Cancel booking logic would go here
                              console.log(
                                `Cancel booking ${booking.reference}`,
                              );
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2 text-red-500" />
                            Cancel Booking
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBooking(booking.id);
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
                <TableCell colSpan={9} className="text-center py-8">
                  {searchTerm || statusFilter !== "all" ? (
                    <div className="text-gray-500">
                      No bookings found matching your search criteria.
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <Calendar className="h-12 w-12 text-gray-300 mb-2" />
                      <div className="text-gray-500 mb-2">
                        No bookings added yet
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(true)}
                      >
                        Create Your First Booking
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

      {/* Add Booking Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Booking</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="teacher">Teacher</Label>
              <Select
                value={newBooking.teacherId}
                onValueChange={(value) =>
                  setNewBooking({ ...newBooking, teacherId: value })
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
              <Label htmlFor="school">School</Label>
              <Select
                value={newBooking.schoolId}
                onValueChange={(value) =>
                  setNewBooking({ ...newBooking, schoolId: value })
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
              <Label htmlFor="date">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {newBooking.date ? (
                      format(newBooking.date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={newBooking.date}
                    onSelect={(date) =>
                      date && setNewBooking({ ...newBooking, date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">Duration</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Select
                    value={String(newBooking.durationWeeks)}
                    onValueChange={(value) =>
                      setNewBooking({
                        ...newBooking,
                        durationWeeks: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger id="duration">
                      <SelectValue placeholder="Select weeks" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((weeks) => (
                        <SelectItem key={weeks} value={String(weeks)}>
                          {weeks} {weeks === 1 ? "week" : "weeks"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500">
                    or select term end
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>School Calendar Terms</Label>
              <div className="space-y-2 border rounded-md p-3 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="until-easter"
                    checked={newBooking.untilEaster}
                    onCheckedChange={(checked) =>
                      setNewBooking({
                        ...newBooking,
                        untilEaster: !!checked,
                        untilSummer: false,
                        untilChristmas: false,
                      })
                    }
                  />
                  <Label htmlFor="until-easter" className="cursor-pointer">
                    Until Easter Break
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="until-summer"
                    checked={newBooking.untilSummer}
                    onCheckedChange={(checked) =>
                      setNewBooking({
                        ...newBooking,
                        untilSummer: !!checked,
                        untilEaster: false,
                        untilChristmas: false,
                      })
                    }
                  />
                  <Label htmlFor="until-summer" className="cursor-pointer">
                    Until Summer Break
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="until-christmas"
                    checked={newBooking.untilChristmas}
                    onCheckedChange={(checked) =>
                      setNewBooking({
                        ...newBooking,
                        untilChristmas: !!checked,
                        untilEaster: false,
                        untilSummer: false,
                      })
                    }
                  />
                  <Label htmlFor="until-christmas" className="cursor-pointer">
                    Until Christmas Break
                  </Label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Select
                  value={newBooking.startTime}
                  onValueChange={(value) =>
                    setNewBooking({ ...newBooking, startTime: value })
                  }
                >
                  <SelectTrigger id="startTime">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Select
                  value={newBooking.endTime}
                  onValueChange={(value) =>
                    setNewBooking({ ...newBooking, endTime: value })
                  }
                >
                  <SelectTrigger id="endTime">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="recurring">Recurring Booking</Label>
                <Switch
                  id="recurring"
                  checked={newBooking.recurring || false}
                  onCheckedChange={(checked) =>
                    setNewBooking({ ...newBooking, recurring: checked })
                  }
                />
              </div>
              {newBooking.recurring && (
                <div className="mt-2 border rounded-md p-3 bg-gray-50">
                  <p className="text-sm font-medium mb-2">
                    Repeat on these days:
                  </p>
                  <div className="grid grid-cols-7 gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => (
                        <div key={day} className="flex flex-col items-center">
                          <Checkbox
                            id={`day-${day}`}
                            checked={
                              newBooking.recurringDays?.includes(day) || false
                            }
                            onCheckedChange={(checked) => {
                              const currentDays =
                                newBooking.recurringDays || [];
                              const newDays = checked
                                ? [...currentDays, day]
                                : currentDays.filter((d) => d !== day);
                              setNewBooking({
                                ...newBooking,
                                recurringDays: newDays,
                              });
                            }}
                          />
                          <Label
                            htmlFor={`day-${day}`}
                            className="text-xs mt-1"
                          >
                            {day}
                          </Label>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional information"
                value={newBooking.notes}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, notes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBooking}>Add Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingList;
