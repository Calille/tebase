import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "./tebase/PageLayout";
import DemoBanner from "./tebase/shared/DemoBanner";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  TrendingUp,
  Calendar,
  Building,
  Users,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  FileText,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { teacherService } from "@/services/teacherService";
import { schoolService } from "@/services/schoolService";
import { bookingService } from "@/services/bookingService";
import { weeklyReportService } from "@/services/weeklyReport";
import { formatGbp } from "@/types/payroll";
import { payWeekContaining } from "@/lib/payWeek";

const Home = () => {
  const [staffCount, setStaffCount] = useState(0);
  const [schoolCount, setSchoolCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [revenueDelta, setRevenueDelta] = useState<number | null>(null);
  const [lowMarginBookings, setLowMarginBookings] = useState<
    { consultant: string; school: string; currentRate: number; targetRate: number; currentMargin: number }[]
  >([]);
  const [upcomingBookings, setUpcomingBookings] = useState<
    { id: string; school: string; teacher: string; date: string; subject: string; status: string }[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const week = payWeekContaining(new Date());
      const [teachers, schools, report, bookings] = await Promise.all([
        teacherService.getTeachers(),
        schoolService.getSchools(),
        weeklyReportService.getReport({ periodId: week.id, scope: "team" }),
        bookingService.getBookings(),
      ]);
      if (cancelled) return;
      setStaffCount(teachers.filter((teacher) => teacher.status === "active").length);
      setSchoolCount(schools.length);
      const weekBookings = bookings.filter(
        (booking) => booking.startDate <= week.weekEnding && booking.endDate >= week.startsOn,
      );
      setBookingCount(weekBookings.length);
      setRevenue(report.headlines.current.chargeTotal);
      setRevenueDelta(report.headlines.charge.lastWeek.percent);
      setLowMarginBookings(
        report.lowMargin.flatMap((group) =>
          group.bookings.slice(0, 2).map((booking) => ({
            consultant: booking.consultant.name,
            school: booking.school.name,
            currentRate: booking.chargeRate,
            targetRate: Math.round(booking.payRate + 50),
            currentMargin: booking.marginPercent,
          })),
        ).slice(0, 6),
      );
      const today = new Date().toISOString().slice(0, 10);
      setUpcomingBookings(
        bookings
          .filter((booking) => booking.status !== "cancelled" && booking.endDate >= today)
          .sort((a, b) => a.startDate.localeCompare(b.startDate))
          .slice(0, 5)
          .map((booking) => ({
            id: booking.id,
            school: booking.school.name,
            teacher: booking.teacher.name,
            date: booking.startDate === today ? "Today" : booking.startDate,
            subject: booking.subject,
            status: booking.status,
          })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageLayout
      variant="fill"
      title="Dashboard"
      className="bg-gray-50"
      headerClassName="bg-white border-b sticky top-0 z-10 shadow-sm"
      actions={
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
      }
    >
          <div className="p-6">
            <div className="max-w-[1400px] mx-auto space-y-6">
                  <DemoBanner message="Dashboard figures are rolled up from the shared seed: the same bookings feed payroll, timesheets and the weekly report." />
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
                        <p className="text-3xl font-bold text-gray-800">{staffCount}</p>
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
                        <p className="text-3xl font-bold text-gray-800">{schoolCount}</p>
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
                        <p className="text-3xl font-bold text-gray-800">{bookingCount}</p>
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
                          {formatGbp(revenue)}
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
    </PageLayout>
  );
};

export default Home;
