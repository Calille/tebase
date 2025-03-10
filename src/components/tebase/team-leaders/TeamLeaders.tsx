import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Phone,
  Mail,
  Users,
  UserCog,
  BarChart3,
  Calendar,
  MessageSquare,
} from "lucide-react";

interface TeamLeader {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  department: string;
  teamSize: number;
  performance: number;
  status: "active" | "on leave" | "training";
}

const TeamLeaders = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Sample team leaders data
  const teamLeaders: TeamLeader[] = [
    {
      id: "tl-001",
      name: "Sarah Johnson",
      role: "Senior Team Leader",
      email: "s.johnson@tebase.edu",
      phone: "+44 161 234 5678",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      department: "Secondary Education",
      teamSize: 12,
      performance: 92,
      status: "active",
    },
    {
      id: "tl-002",
      name: "Michael Chen",
      role: "Team Leader",
      email: "m.chen@tebase.edu",
      phone: "+44 161 345 6789",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
      department: "Primary Education",
      teamSize: 8,
      performance: 88,
      status: "active",
    },
    {
      id: "tl-003",
      name: "Emily Rodriguez",
      role: "Team Leader",
      email: "e.rodriguez@tebase.edu",
      phone: "+44 161 456 7890",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
      department: "Special Education",
      teamSize: 6,
      performance: 95,
      status: "on leave",
    },
    {
      id: "tl-004",
      name: "David Wilson",
      role: "Senior Team Leader",
      email: "d.wilson@tebase.edu",
      phone: "+44 161 567 8901",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
      department: "Higher Education",
      teamSize: 15,
      performance: 90,
      status: "active",
    },
    {
      id: "tl-005",
      name: "Jessica Taylor",
      role: "Team Leader",
      email: "j.taylor@tebase.edu",
      phone: "+44 161 678 9012",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jessica",
      department: "Primary Education",
      teamSize: 7,
      performance: 86,
      status: "training",
    },
  ];

  // Filter team leaders based on search term
  const filteredTeamLeaders = teamLeaders.filter(
    (leader) =>
      leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leader.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leader.role.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Get status badge
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
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search team leaders..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Team Leader
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeamLeaders.map((leader) => (
          <Card key={leader.id} className="bg-white overflow-hidden">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarImage src={leader.avatar} alt={leader.name} />
                    <AvatarFallback>{leader.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{leader.name}</CardTitle>
                    <p className="text-sm text-gray-500">{leader.role}</p>
                  </div>
                </div>
                {getStatusBadge(leader.status)}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="info" className="flex-1">
                    Info
                  </TabsTrigger>
                  <TabsTrigger value="team" className="flex-1">
                    Team
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="flex-1">
                    Performance
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a
                      href={`mailto:${leader.email}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {leader.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a
                      href={`tel:${leader.phone}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {leader.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCog className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{leader.department}</span>
                  </div>
                  <div className="flex justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Message
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      Schedule
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="team" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Team Size:</span>
                    </div>
                    <span className="font-bold">{leader.teamSize} members</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">
                      Team Composition
                    </h4>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, leader.teamSize) }).map(
                        (_, i) => (
                          <Avatar
                            key={i}
                            className="h-8 w-8 border border-white"
                          >
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=team${leader.id}${i}`}
                            />
                            <AvatarFallback>T</AvatarFallback>
                          </Avatar>
                        ),
                      )}
                      {leader.teamSize > 5 && (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                          +{leader.teamSize - 5}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    View Full Team
                  </Button>
                </TabsContent>

                <TabsContent value="performance" className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Performance Score
                    </span>
                    <span className="font-bold text-lg">
                      {leader.performance}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: `${leader.performance}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                  <div className="flex justify-center mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <BarChart3 className="h-3.5 w-3.5" />
                      View Detailed Report
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
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
