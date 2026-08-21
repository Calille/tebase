import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
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
  Bell,
  Search,
  Filter,
  Plus,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Settings,
  Users,
  Building,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { extrasService } from "@/services/extrasService";

interface Alarm {
  id: string;
  title: string;
  description: string;
  type: "system" | "booking" | "teacher" | "school";
  priority: "low" | "medium" | "high" | "critical";
  status: "active" | "resolved" | "snoozed";
  createdAt: string;
  resolvedAt?: string;
}

const Alarms = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("current");

  const [alarms, setAlarms] = useState<Alarm[]>([]);

  useEffect(() => {
    extrasService.getAlarms().then((rows) => {
      setAlarms(
        rows.map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          type: row.type,
          priority: row.priority,
          status: row.status === "resolved" ? "resolved" : row.status === "acknowledged" ? "snoozed" : "active",
          createdAt: row.date,
        })),
      );
    });
  }, []);

  // Filter alarms based on search term, status, and priority filters
  const filteredAlarms = alarms.filter((alarm) => {
    const matchesSearch =
      alarm.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alarm.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || alarm.status === statusFilter;

    const matchesPriority =
      priorityFilter === "all" || alarm.priority === priorityFilter;

    const matchesTab =
      (activeTab === "current" && alarm.status !== "resolved") ||
      (activeTab === "resolved" && alarm.status === "resolved") ||
      activeTab === "all";

    return matchesSearch && matchesStatus && matchesPriority && matchesTab;
  });

  // Get priority badge
  const getPriorityBadge = (priority: Alarm["priority"]) => {
    switch (priority) {
      case "low":
        return <Badge className="bg-blue-100 text-blue-800">Low</Badge>;
      case "medium":
        return <Badge className="bg-amber-100 text-amber-800">Medium</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default:
        return null;
    }
  };

  // Get status badge
  const getStatusBadge = (status: Alarm["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "resolved":
        return <Badge className="bg-gray-100 text-gray-800">Resolved</Badge>;
      case "snoozed":
        return <Badge className="bg-purple-100 text-purple-800">Snoozed</Badge>;
      default:
        return null;
    }
  };

  // Get type icon
  const getTypeIcon = (type: Alarm["type"]) => {
    switch (type) {
      case "system":
        return <Settings className="h-5 w-5 text-gray-500" />;
      case "booking":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "teacher":
        return <Users className="h-5 w-5 text-green-500" />;
      case "school":
        return <Building className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <Tabs
        defaultValue="current"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="current">Current Alarms</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="all">All Alarms</TabsTrigger>
          </TabsList>

          <Button className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Create Alert
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search alarms..."
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
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="snoozed">Snoozed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={priorityFilter}
              onValueChange={(value) => setPriorityFilter(value)}
            >
              <SelectTrigger className="w-[150px]">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <SelectValue placeholder="Priority" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="current" className="space-y-6">
          <Card className="bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alarm</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlarms.length > 0 ? (
                    filteredAlarms.map((alarm) => (
                      <TableRow key={alarm.id}>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getTypeIcon(alarm.type)}
                            </div>
                            <div>
                              <div className="font-medium">{alarm.title}</div>
                              <div className="text-sm text-gray-500">
                                {alarm.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(alarm.priority)}
                        </TableCell>
                        <TableCell>{getStatusBadge(alarm.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{alarm.createdAt}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {alarm.status !== "resolved" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Resolve
                              </Button>
                            )}
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
                                {alarm.status === "active" && (
                                  <DropdownMenuItem>
                                    Snooze Alarm
                                  </DropdownMenuItem>
                                )}
                                {alarm.status === "snoozed" && (
                                  <DropdownMenuItem>
                                    Unsnooze Alarm
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  Assign to User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <Bell className="h-12 w-12 text-gray-300 mb-2" />
                          <p className="text-gray-500">
                            No alarms found matching your criteria.
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
                    <TableHead>Alarm</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Resolved</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlarms.length > 0 ? (
                    filteredAlarms.map((alarm) => (
                      <TableRow key={alarm.id}>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getTypeIcon(alarm.type)}
                            </div>
                            <div>
                              <div className="font-medium">{alarm.title}</div>
                              <div className="text-sm text-gray-500">
                                {alarm.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(alarm.priority)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{alarm.createdAt}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{alarm.resolvedAt}</span>
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
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <CheckCircle className="h-12 w-12 text-gray-300 mb-2" />
                          <p className="text-gray-500">
                            No resolved alarms found matching your criteria.
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
                    <TableHead>Alarm</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlarms.length > 0 ? (
                    filteredAlarms.map((alarm) => (
                      <TableRow key={alarm.id}>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getTypeIcon(alarm.type)}
                            </div>
                            <div>
                              <div className="font-medium">{alarm.title}</div>
                              <div className="text-sm text-gray-500">
                                {alarm.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(alarm.priority)}
                        </TableCell>
                        <TableCell>{getStatusBadge(alarm.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{alarm.createdAt}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {alarm.status !== "resolved" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Resolve
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <Bell className="h-12 w-12 text-gray-300 mb-2" />
                          <p className="text-gray-500">
                            No alarms found matching your criteria.
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

      <Card className="mt-6 bg-white">
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-500">
                  Receive alarm notifications via email
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">SMS Notifications</h3>
                <p className="text-sm text-gray-500">
                  Receive critical alarm notifications via SMS
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Push Notifications</h3>
                <p className="text-sm text-gray-500">
                  Receive in-app push notifications
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Critical Alarms Only</h3>
                <p className="text-sm text-gray-500">
                  Only notify for high and critical priority alarms
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Alarms;
