import React, { useState, useEffect } from "react";
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
import { Booking, bookingService } from "@/services/bookingService";
import { schoolService } from "@/services/schoolService";
import { teacherService } from "@/services/teacherService";
import DemoBanner from "@/components/tebase/shared/DemoBanner";
import { toast } from "@/components/ui/use-toast";
import { errorMessage } from "@/lib/errors";

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
  const [bookings, setBookings] = useState<Booking[]>(initialBookings || []);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [loading, setLoading] = useState(!initialBookings);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Booking>("startDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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

  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);

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

  const itemsPerPage = 25;

  // Fetch bookings from the API
  useEffect(() => {
    const fetchBookings = async () => {
      if (initialBookings) {
        // If bookings are provided as props, use them
        setBookings(initialBookings);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [data, schoolRows, teacherRows] = await Promise.all([
          bookingService.getBookings(),
          schoolService.getSchools(),
          teacherService.getTeachers(),
        ]);
        setBookings(data);
        setSchools(schoolRows.map((school) => ({ id: school.id, name: school.name })));
        setTeachers(teacherRows.map((teacher) => ({ id: teacher.id, name: teacher.name })));
        setUsingSampleData(false);
      } catch (err) {
        setError(errorMessage(err, "Failed to load bookings. Please try again later."));
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [initialBookings]);

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
  const handleAddBooking = async (bookingData: Omit<Booking, "id">) => {
    try {
      const createdBooking = await bookingService.createBooking(bookingData);
      setBookings([...bookings, createdBooking]);
      setIsAddDialogOpen(false);
      setUsingSampleData(false);
      toast({
        title: "Booking created",
        description: "The booking has been saved.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: errorMessage(err, "Failed to add booking. Please try again."),
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: Booking["status"]) => {
    try {
      await bookingService.updateBooking(bookingId, { status });
      setBookings(
        bookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status } : booking
        )
      );
    } catch (err) {
      toast({
        title: "Error",
        description: errorMessage(err, "Failed to update booking status."),
        variant: "destructive",
      });
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await bookingService.deleteBooking(bookingId);
        setBookings(bookings.filter((booking) => booking.id !== bookingId));
      } catch (err) {
        toast({
          title: "Error",
          description: errorMessage(err, "Failed to delete booking."),
          variant: "destructive",
        });
      }
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
    <div className="space-y-4">
    {error && (
      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        {error}
      </div>
    )}
    {usingSampleData && (
      <DemoBanner message="Bookings are from the shared demo seed until Supabase is connected." />
    )}
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
            <Button onClick={() => handleAddBooking(newBooking as unknown as Omit<Booking, "id">)}>Add Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
};

export default BookingList;
