import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Search,
  Plus,
  Phone,
  Mail,
  Users,
  UserCog,
  Calendar,
  MessageSquare,
} from "lucide-react";
import DemoBanner from "@/components/tebase/shared/DemoBanner";
import { toastDemoAction } from "@/lib/persistence";
import {
  extrasService,
  type TeamLeaderCard as TeamLeader,
} from "@/services/extrasService";

function formatDays(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

const TeamLeaders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [teamLeaders, setTeamLeaders] = useState<TeamLeader[]>([]);

  useEffect(() => {
    extrasService.getTeamLeaders().then(setTeamLeaders);
  }, []);

  const query = searchTerm.trim().toLowerCase();
  const filteredTeamLeaders = teamLeaders.filter((leader) => {
    if (!query) return true;
    const haystack = [
      leader.name,
      leader.department,
      leader.role,
      leader.email,
      ...leader.members.flatMap((member) => [member.name, member.role, member.email]),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  const getStatusBadge = (status: TeamLeader["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "on leave":
        return <Badge className="bg-amber-100 text-amber-800">On Leave</Badge>;
      case "training":
        return <Badge className="bg-blue-100 text-blue-800">Training</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-6">
      <DemoBanner message="North and South desks from the demo seed, including coordinators who do not take bookings." />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search leaders or members..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          className="flex items-center gap-1"
          onClick={() => toastDemoAction("Add team leader")}
        >
          <Plus className="h-4 w-4" />
          Add Team Leader
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredTeamLeaders.map((leader) => (
          <Card key={leader.id} className="bg-white overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="text-sm text-gray-500">{leader.department}</p>
                  <CardTitle className="text-xl">{leader.name}</CardTitle>
                  <p className="text-sm text-gray-500">{leader.role}</p>
                </div>
                {getStatusBadge(leader.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                <a
                  href={`mailto:${leader.email}`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <Mail className="h-4 w-4 text-gray-500" />
                  {leader.email}
                </a>
                <a
                  href={`tel:${leader.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <Phone className="h-4 w-4 text-gray-500" />
                  {leader.phone}
                </a>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Users className="h-3.5 w-3.5" />
                    Members
                  </div>
                  <p className="mt-1 text-lg font-semibold">{leader.teamSize}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">This week</p>
                  <p className="mt-1 text-lg font-semibold">{leader.bookingsThisWeek}</p>
                  <p className="text-xs text-gray-500">bookings</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Days booked</p>
                  <p className="mt-1 text-lg font-semibold">{formatDays(leader.daysThisWeek)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => toastDemoAction(`Message ${leader.name}`)}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Message
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => toastDemoAction(`Schedule ${leader.name}`)}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Schedule
                </Button>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Desk members</h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="hidden lg:table-cell">Phone</TableHead>
                        <TableHead className="text-right">This week</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leader.members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-xs text-gray-500 md:hidden">{member.email}</div>
                          </TableCell>
                          <TableCell className="text-gray-600">{member.role}</TableCell>
                          <TableCell className="hidden md:table-cell text-gray-600">
                            {member.email}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-gray-600">
                            {member.phone}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {member.bookingsThisWeek}
                            <span className="text-gray-400"> / </span>
                            {formatDays(member.daysThisWeek)}d
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeamLeaders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <UserCog className="h-12 w-12 mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500">
            No team leaders found matching your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamLeaders;
