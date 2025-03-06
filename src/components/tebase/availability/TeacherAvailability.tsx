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
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";

interface TeacherAvailabilityProps {}

const TeacherAvailability: React.FC<TeacherAvailabilityProps> = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);

  // Sample data for teachers and their availability
  const teachers = [
    {
      id: "t1",
      name: "John Smith",
      subject: "Mathematics",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      status: "available",
      availability: [
        { day: "Monday", slots: ["Morning", "Afternoon"] },
        { day: "Tuesday", slots: ["Morning", "Afternoon"] },
        { day: "Wednesday", slots: ["Morning"] },
        { day: "Thursday", slots: ["Afternoon"] },
        { day: "Friday", slots: ["Morning", "Afternoon"] },
      ],
      preferredLocations: ["Manchester", "Liverpool", "Leeds"],
      notes: "Prefers secondary schools. Available for last-minute bookings.",
    },
    {
      id: "t2",
      name: "Sarah Johnson",
      subject: "English",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      status: "partially",
      availability: [
        { day: "Monday", slots: ["Afternoon"] },
        { day: "Tuesday", slots: [] },
        { day: "Wednesday", slots: ["Morning", "Afternoon"] },
        { day: "Thursday", slots: ["Morning", "Afternoon"] },
        { day: "Friday", slots: ["Morning"] },
      ],
      preferredLocations: ["Birmingham", "Coventry"],
      notes: "Prefers primary schools. Requires 48 hours notice for bookings.",
    },
    {
      id: "t3",
      name: "Michael Chen",
      subject: "Science",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
      status: "unavailable",
      availability: [
        { day: "Monday", slots: [] },
        { day: "Tuesday", slots: [] },
        { day: "Wednesday", slots: [] },
        { day: "Thursday", slots: [] },
        { day: "Friday", slots: [] },
      ],
      preferredLocations: ["London", "Cambridge"],
      notes: "On leave until September 15th, 2023.",
    },
    {
      id: "t4",
      name: "Emily Rodriguez",
      subject: "Art",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
      status: "available",
      availability: [
        { day: "Monday", slots: ["Morning", "Afternoon"] },
        { day: "Tuesday", slots: ["Morning", "Afternoon"] },
        { day: "Wednesday", slots: ["Morning", "Afternoon"] },
        { day: "Thursday", slots: ["Morning", "Afternoon"] },
        { day: "Friday", slots: ["Morning", "Afternoon"] },
      ],
      preferredLocations: ["Bristol", "Bath"],
      notes:
        "Flexible with locations and timings. Can take on short notice bookings.",
    },
    {
      id: "t5",
      name: "David Wilson",
      subject: "Physical Education",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
      status: "partially",
      availability: [
        { day: "Monday", slots: ["Morning"] },
        { day: "Tuesday", slots: ["Morning"] },
        { day: "Wednesday", slots: [] },
        { day: "Thursday", slots: ["Morning"] },
        { day: "Friday", slots: ["Morning"] },
      ],
      preferredLocations: ["Newcastle", "Sunderland"],
      notes: "Available mornings only. Prefers secondary schools.",
    },
  ];

  // Filter teachers based on search term and status filter
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || teacher.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case "partially":
        return (
          <Badge className="bg-amber-100 text-amber-800">
            Partially Available
          </Badge>
        );
      case "unavailable":
        return <Badge className="bg-red-100 text-red-800">Unavailable</Badge>;
      default:
        return null;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "partially":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "unavailable":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  // Toggle expanded teacher
  const toggleExpandTeacher = (teacherId: string) => {
    if (expandedTeacher === teacherId) {
      setExpandedTeacher(null);
    } else {
      setExpandedTeacher(teacherId);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <Card className="bg-white">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3">
          <CardTitle>Teacher Availability</CardTitle>
          <Button className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Update Availability
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search teachers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="partially">Partially Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <React.Fragment key={teacher.id}>
                    <TableRow
                      className={`cursor-pointer ${expandedTeacher === teacher.id ? "bg-gray-50" : "hover:bg-gray-50"}`}
                      onClick={() => toggleExpandTeacher(teacher.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={teacher.avatar}
                              alt={teacher.name}
                            />
                            <AvatarFallback>
                              {teacher.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{teacher.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{teacher.subject}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(teacher.status)}
                          {getStatusBadge(teacher.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {teacher.availability
                            .filter((day) => day.slots.length > 0)
                            .map((day) => (
                              <Badge
                                key={day.day}
                                variant="outline"
                                className="text-xs"
                              >
                                {day.day.substring(0, 3)}
                              </Badge>
                            ))}
                          {teacher.availability.filter(
                            (day) => day.slots.length > 0,
                          ).length === 0 && (
                            <span className="text-gray-500 text-sm">
                              No availability
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandTeacher(teacher.id);
                          }}
                        >
                          {expandedTeacher === teacher.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedTeacher === teacher.id && (
                      <TableRow className="bg-gray-50">
                        <TableCell colSpan={5} className="p-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">
                                Weekly Availability
                              </h4>
                              <div className="grid grid-cols-5 gap-2">
                                {teacher.availability.map((day) => (
                                  <div
                                    key={day.day}
                                    className="border rounded-md p-3"
                                  >
                                    <h5 className="font-medium text-sm mb-2">
                                      {day.day}
                                    </h5>
                                    {day.slots.length > 0 ? (
                                      <div className="space-y-1">
                                        {day.slots.map((slot) => (
                                          <div
                                            key={slot}
                                            className="flex items-center gap-1 text-sm"
                                          >
                                            <Clock className="h-3 w-3 text-gray-500" />
                                            <span>{slot}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-gray-500 text-sm">
                                        Not available
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">
                                Preferred Locations
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {teacher.preferredLocations.map((location) => (
                                  <Badge
                                    key={location}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {location}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Notes</h4>
                              <p className="text-sm text-gray-600">
                                {teacher.notes}
                              </p>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <Calendar className="h-4 w-4" />
                                Book Teacher
                              </Button>
                              <Button
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <Clock className="h-4 w-4" />
                                Edit Availability
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <Calendar className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500">
                        No teachers found matching your criteria.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherAvailability;
