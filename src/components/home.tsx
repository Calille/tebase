import React, { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import Sidebar from "./tebase/Sidebar";
import DemoBanner from "./tebase/shared/DemoBanner";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Phone,
  TrendingUp,
  UserCheck,
  Headphones,
  Calendar,
  Building,
  Users,
  DollarSign,
  AlertTriangle,
  Clock,
  ChevronRight,
  BarChart3,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const Home = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Sample data for low margin bookings
  const lowMarginBookings = [
    {
      consultant: "David Wilson",
      school: "Northside Academy",
      currentRate: 125,
      targetRate: 179,
      currentMargin: 21,
    },
    {
      consultant: "Sarah Johnson",
      school: "Oakridge Elementary",
      currentRate: 130,
      targetRate: 186,
      currentMargin: 25,
    },
    {
      consultant: "Jennifer Lee",
      school: "Riverside College",
      currentRate: 140,
      targetRate: 200,
      currentMargin: 27,
    },
  ];

  // Sample data for upcoming bookings
  const upcomingBookings = [
    {
      id: "book-001",
      school: "Westfield High School",
      teacher: "John Smith",
      date: "Today, 9:00 AM",
      subject: "Mathematics",
      status: "confirmed",
    },
    {
      id: "book-002",
      school: "Oakridge Elementary",
      teacher: "Sarah Johnson",
      date: "Today, 1:30 PM",
      subject: "English",
      status: "pending",
    },
    {
      id: "book-003",
      school: "Riverside College",
      teacher: "Michael Chen",
      date: "Tomorrow, 10:15 AM",
      subject: "Chemistry",
      status: "confirmed",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />

      <main
        className={cn(
          "flex-1 h-screen overflow-y-auto transition-all duration-300",
          sidebarCollapsed ? "ml-[70px]" : "ml-[50px]",
        )}
        style={{
          marginLeft: sidebarCollapsed ? "70px" : "50px",
          marginRight: 0,
          paddingLeft: 0,
        }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10 shadow-sm">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Dashboard
            </h1>
            <div className="flex gap-2">
              <Button variant="outline" className="bg-white">
                <Link to="/weekly-report" className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  View Reports
                </Link>
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Link
                  to="/bookings"
                  className="flex items-center gap-1 text-white"
                >
                  <Calendar className="h-4 w-4" />
                  Manage Bookings
                </Link>
              </Button>
            </div>
          </div>

          <div className="p-6">
            <div className="max-w-[1400px] mx-auto space-y-6">
              <DemoBanner message="Dashboard figures are sample data until bookings, payroll, and margins are connected to live queries." />
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Active Teaching Staff
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-gray-800">248</p>
                        <p className="text-xs text-gray-500">
                          Available for booking
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-full">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center text-xs">
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-green-500 font-medium">12%</span>
                      <span className="text-gray-500 ml-1">
                        from last month
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Live Schools
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-gray-800">52</p>
                        <p className="text-xs text-gray-500">
                          Currently partnered
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-full">
                        <Building className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center text-xs">
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-green-500 font-medium">8%</span>
                      <span className="text-gray-500 ml-1">
                        from last quarter
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Weekly Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-gray-800">124</p>
                        <p className="text-xs text-gray-500">This week</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-full">
                        <Calendar className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center text-xs">
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-green-500 font-medium">23%</span>
                      <span className="text-gray-500 ml-1">from last week</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Weekly Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-gray-800">
                          £22,500
                        </p>
                        <p className="text-xs text-gray-500">This week</p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-full">
                        <DollarSign className="h-6 w-6 text-amber-600" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center text-xs">
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-green-500 font-medium">8.5%</span>
                      <span className="text-gray-500 ml-1">
                        vs previous week
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Low Margin Bookings */}
              <Card className="bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <CardHeader className="border-b bg-gray-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Low Margin Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Consultant
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            School
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Current Rate
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Target Rate
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Current Margin
                          </th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowMarginBookings.map((booking, index) => (
                          <tr
                            key={index}
                            className="border-b hover:bg-gray-50 transition-colors"
                            style={
                              booking.currentMargin < 25
                                ? {
                                    backgroundColor: "rgba(254, 226, 226, 0.3)",
                                  }
                                : {}
                            }
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">
                                  {booking.consultant}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">{booking.school}</td>
                            <td className="py-3 px-4">
                              £{booking.currentRate}
                            </td>
                            <td className="py-3 px-4 font-medium text-green-600">
                              £{booking.targetRate}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                className={
                                  booking.currentMargin < 25
                                    ? "bg-red-100 text-red-800"
                                    : "bg-amber-100 text-amber-800"
                                }
                              >
                                {booking.currentMargin}%
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              >
                                <Link
                                  to="/bookings"
                                  className="flex items-center gap-1"
                                >
                                  <span>Adjust</span>
                                  <ChevronRight className="h-4 w-4" />
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-white hover:bg-gray-50"
                    >
                      <Link
                        to="/weekly-report"
                        className="flex items-center justify-center gap-1 w-full"
                      >
                        <BarChart3 className="h-4 w-4" />
                        View All Margin Reports
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Bookings */}
              <Card className="bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50 rounded-t-lg">
                  <CardTitle className="text-gray-800">
                    Upcoming Bookings
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-gray-50"
                  >
                    <Link to="/bookings" className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      View Calendar
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            School
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Teacher
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Date & Time
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Subject
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Status
                          </th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingBookings.map((booking) => (
                          <tr
                            key={booking.id}
                            className="border-b hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">
                                  {booking.school}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-green-500" />
                                <span>{booking.teacher}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>{booking.date}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">{booking.subject}</td>
                            <td className="py-3 px-4">
                              <Badge
                                className={
                                  booking.status === "confirmed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-amber-100 text-amber-800"
                                }
                              >
                                {booking.status === "confirmed"
                                  ? "Confirmed"
                                  : "Pending"}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              >
                                <Link
                                  to={`/bookings?id=${booking.id}`}
                                  className="flex items-center gap-1"
                                >
                                  <span>Details</span>
                                  <ChevronRight className="h-4 w-4" />
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-white hover:bg-gray-50"
                    >
                      <Link
                        to="/bookings"
                        className="flex items-center justify-center gap-1 w-full"
                      >
                        <Calendar className="h-4 w-4" />
                        View All Bookings
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Access */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  to="/teachers"
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center gap-3 group"
                >
                  <div className="p-3 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Teachers</h3>
                    <p className="text-sm text-gray-500">
                      Manage teacher profiles
                    </p>
                  </div>
                </Link>
                <Link
                  to="/schools"
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center gap-3 group"
                >
                  <div className="p-3 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors">
                    <Building className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Schools</h3>
                    <p className="text-sm text-gray-500">
                      View school accounts
                    </p>
                  </div>
                </Link>
                <Link
                  to="/weekly-report"
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center gap-3 group"
                >
                  <div className="p-3 bg-purple-50 rounded-full group-hover:bg-purple-100 transition-colors">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Reports</h3>
                    <p className="text-sm text-gray-500">
                      View financial reports
                    </p>
                  </div>
                </Link>
                <Link
                  to="/payroll"
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center gap-3 group"
                >
                  <div className="p-3 bg-amber-50 rounded-full group-hover:bg-amber-100 transition-colors">
                    <FileText className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Payroll</h3>
                    <p className="text-sm text-gray-500">Manage payments</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
