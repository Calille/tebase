import { useMemo, useState } from "react";
import { Calendar, Check, Filter, Search, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DemoBanner from "@/components/tebase/shared/DemoBanner";
import {
  buildAvailabilityTeachers,
  formatDayHeader,
  initials,
  weekdaysMonToFri,
  weekdayIndex,
  JOB_GROUP_LABELS,
  type AvailabilityDayCell,
  type DayCellStatus,
  type JobGroup,
} from "./mockAvailability";

const JOB_GROUP_BADGE: Record<JobGroup, string> = {
  teacher: "bg-blue-600 text-white hover:bg-blue-600",
  ta: "bg-sky-100 text-sky-800 hover:bg-sky-100",
  cover_supervisor: "bg-orange-100 text-orange-800 hover:bg-orange-100",
};

function DayCell({ cell }: { cell: AvailabilityDayCell }) {
  if (cell.status === "off") {
    return (
      <div className="flex h-14 items-center justify-center rounded-md border border-gray-100 bg-white text-sm text-gray-400">
        Off
      </div>
    );
  }

  const booked = cell.status === "booked";
  return (
    <div
      className={
        booked
          ? "flex h-14 flex-col items-center justify-center gap-0.5 rounded-md bg-sky-500 text-white"
          : "flex h-14 flex-col items-center justify-center gap-0.5 rounded-md bg-emerald-500 text-white"
      }
    >
      {booked ? (
        <Calendar className="h-4 w-4" />
      ) : (
        <Check className="h-4 w-4 stroke-[3]" />
      )}
      <span className="text-[11px] font-medium leading-none">
        {cell.start}–{cell.end}
      </span>
    </div>
  );
}

const TeacherAvailability = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [jobGroupFilter, setJobGroupFilter] = useState<JobGroup | "all">("all");
  const [statusFilter, setStatusFilter] = useState<DayCellStatus | "all">("all");

  const teachers = useMemo(() => buildAvailabilityTeachers(), []);
  const weekdays = useMemo(() => weekdaysMonToFri(), []);
  const todayIndex = weekdayIndex();

  const filtered = teachers.filter((teacher) => {
    const hay = `${teacher.name} ${teacher.subject}`.toLowerCase();
    if (searchTerm.trim() && !hay.includes(searchTerm.trim().toLowerCase())) {
      return false;
    }
    if (jobGroupFilter !== "all" && teacher.jobGroup !== jobGroupFilter) {
      return false;
    }
    if (statusFilter !== "all" && teacher.days[todayIndex]?.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const todayCells = teachers.map((teacher) => teacher.days[todayIndex]);
  const availableToday = todayCells.filter((cell) => cell.status === "available").length;
  const bookedToday = todayCells.filter((cell) => cell.status === "booked").length;
  const unavailableToday = teachers.filter((teacher) =>
    teacher.days.every((day) => day.status === "off"),
  ).length;

  return (
    <div className="space-y-4">
      <DemoBanner message="Sample week grid — availability is not written to the database." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Teachers
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{teachers.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Available Today
            </CardTitle>
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
              Available
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{availableToday}</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Booked Today
            </CardTitle>
            <Calendar className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{bookedToday}</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Unavailable Today
            </CardTitle>
            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
              Unavailable
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{unavailableToday}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search teachers..."
            className="bg-white pl-8"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={jobGroupFilter}
            onValueChange={(value) => setJobGroupFilter(value as JobGroup | "all")}
          >
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="All Job Groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Job Groups</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="ta">TA</SelectItem>
              <SelectItem value="cover_supervisor">Cover Supervisor</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as DayCellStatus | "all")}
          >
            <SelectTrigger className="w-[180px] bg-white">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <SelectValue placeholder="All Statuses" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="off">Off</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-white">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">Teacher</TableHead>
                <TableHead className="min-w-[140px]">Job Group</TableHead>
                {weekdays.map((date) => (
                  <TableHead key={date.toISOString()} className="min-w-[120px] text-center">
                    {formatDayHeader(date)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-gray-500">
                    No teachers match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-slate-200 text-xs font-semibold text-slate-700">
                            {initials(teacher.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold leading-tight">{teacher.name}</p>
                          <p className="text-xs text-gray-500">{teacher.subject}</p>
                          <Badge
                            className={`mt-1 text-[10px] ${JOB_GROUP_BADGE[teacher.jobGroup]}`}
                          >
                            {JOB_GROUP_LABELS[teacher.jobGroup]}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={JOB_GROUP_BADGE[teacher.jobGroup]}>
                        {JOB_GROUP_LABELS[teacher.jobGroup]}
                      </Badge>
                    </TableCell>
                    {teacher.days.map((cell, index) => (
                      <TableCell key={`${teacher.id}-${index}`} className="p-2">
                        <DayCell cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherAvailability;
