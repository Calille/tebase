import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  FileSpreadsheet,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Building,
  Users,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";

interface WeeklyEarning {
  id: string;
  week: string;
  totalBookings: number;
  totalHours: number;
  totalEarnings: number;
  schools: {
    id: string;
    name: string;
    bookings: number;
    hours: number;
    earnings: number;
  }[];
  comparisonToLastWeek: number;
}

const WeeklyReport = () => {
  const [selectedWeek, setSelectedWeek] = useState("current");
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);

  // Sample data for weekly earnings
  const weeklyEarnings: WeeklyEarning[] = [
    {
      id: "week-current",
      week: "June 12 - June 18, 2023",
      totalBookings: 42,
      totalHours: 315,
      totalEarnings: 15750,
      comparisonToLastWeek: 8.5,
      schools: [
        {
          id: "sch-001",
          name: "Westfield High School",
          bookings: 12,
          hours: 96,
          earnings: 4800,
        },
        {
          id: "sch-002",
          name: "Oakridge Elementary",
          bookings: 8,
          hours: 64,
          earnings: 3200,
        },
        {
          id: "sch-003",
          name: "Riverside College",
          bookings: 10,
          hours: 75,
          earnings: 3750,
        },
        {
          id: "sch-004",
          name: "Sunshine Special School",
          bookings: 6,
          hours: 45,
          earnings: 2250,
        },
        {
          id: "sch-005",
          name: "Northside Academy",
          bookings: 6,
          hours: 35,
          earnings: 1750,
        },
      ],
    },
    {
      id: "week-previous",
      week: "June 5 - June 11, 2023",
      totalBookings: 38,
      totalHours: 290,
      totalEarnings: 14500,
      comparisonToLastWeek: -2.3,
      schools: [
        {
          id: "sch-001",
          name: "Westfield High School",
          bookings: 10,
          hours: 80,
          earnings: 4000,
        },
        {
          id: "sch-002",
          name: "Oakridge Elementary",
          bookings: 9,
          hours: 72,
          earnings: 3600,
        },
        {
          id: "sch-003",
          name: "Riverside College",
          bookings: 8,
          hours: 60,
          earnings: 3000,
        },
        {
          id: "sch-004",
          name: "Sunshine Special School",
          bookings: 5,
          hours: 38,
          earnings: 1900,
        },
        {
          id: "sch-005",
          name: "Northside Academy",
          bookings: 6,
          hours: 40,
          earnings: 2000,
        },
      ],
    },
    {
      id: "week-two-weeks-ago",
      week: "May 29 - June 4, 2023",
      totalBookings: 40,
      totalHours: 305,
      totalEarnings: 14850,
      comparisonToLastWeek: 5.2,
      schools: [
        {
          id: "sch-001",
          name: "Westfield High School",
          bookings: 11,
          hours: 88,
          earnings: 4400,
        },
        {
          id: "sch-002",
          name: "Oakridge Elementary",
          bookings: 7,
          hours: 56,
          earnings: 2800,
        },
        {
          id: "sch-003",
          name: "Riverside College",
          bookings: 9,
          hours: 68,
          earnings: 3400,
        },
        {
          id: "sch-004",
          name: "Sunshine Special School",
          bookings: 7,
          hours: 53,
          earnings: 2650,
        },
        {
          id: "sch-005",
          name: "Northside Academy",
          bookings: 6,
          hours: 40,
          earnings: 1600,
        },
      ],
    },
  ];

  // Get the selected week's data
  const selectedWeekData =
    weeklyEarnings.find((week) => week.id === `week-${selectedWeek}`) ||
    weeklyEarnings[0];

  // Toggle expanded school
  const toggleExpandSchool = (schoolId: string) => {
    if (expandedSchool === schoolId) {
      setExpandedSchool(null);
    } else {
      setExpandedSchool(schoolId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Select value={selectedWeek} onValueChange={setSelectedWeek}>
          <SelectTrigger className="w-[240px]">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <SelectValue placeholder="Select week" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Current Week (June 12 - 18)</SelectItem>
            <SelectItem value="previous">
              Previous Week (June 5 - 11)
            </SelectItem>
            <SelectItem value="two-weeks-ago">
              Two Weeks Ago (May 29 - June 4)
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-1">
            <FileSpreadsheet className="h-4 w-4" />
            Export to Excel
          </Button>
          <Button variant="outline" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">
                  £{(selectedWeekData.totalEarnings * 0.18).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">18% after expenses</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs">
              {selectedWeekData.comparisonToLastWeek > 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">
                    {selectedWeekData.comparisonToLastWeek.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-500 font-medium">
                    {Math.abs(selectedWeekData.comparisonToLastWeek).toFixed(1)}
                    %
                  </span>
                </>
              )}
              <span className="text-gray-500 ml-1">vs previous week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Weekly Pay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">
                  £{selectedWeekData.totalEarnings.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  For {selectedWeekData.week}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs">
              {selectedWeekData.comparisonToLastWeek > 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">
                    {selectedWeekData.comparisonToLastWeek.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-500 font-medium">
                    {Math.abs(selectedWeekData.comparisonToLastWeek).toFixed(1)}
                    %
                  </span>
                </>
              )}
              <span className="text-gray-500 ml-1">vs previous week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Gross Charge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">
                  £{(selectedWeekData.totalEarnings / 0.7).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  Amount charged to schools
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs">
              {selectedWeekData.comparisonToLastWeek > 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">
                    {selectedWeekData.comparisonToLastWeek.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-500 font-medium">
                    {Math.abs(selectedWeekData.comparisonToLastWeek).toFixed(1)}
                    %
                  </span>
                </>
              )}
              <span className="text-gray-500 ml-1">vs previous week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">30%</p>
                <p className="text-xs text-gray-500">Target margin</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-purple-600 h-2.5 rounded-full"
                  style={{ width: "30%" }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Current: 30% of gross charge
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Weekly Earnings by School</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => window.open("/payroll", "_self")}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Generate Payroll
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedWeekData.schools.map((school) => (
                  <React.Fragment key={school.id}>
                    <TableRow
                      className={`cursor-pointer ${expandedSchool === school.id ? "bg-gray-50" : "hover:bg-gray-50"}`}
                      onClick={() => toggleExpandSchool(school.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{school.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{school.bookings}</TableCell>
                      <TableCell>{school.hours}</TableCell>
                      <TableCell className="text-right font-medium">
                        £{school.earnings.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-8 w-8"
                        >
                          {expandedSchool === school.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedSchool === school.id && (
                      <TableRow className="bg-gray-50">
                        <TableCell colSpan={5} className="p-4">
                          <div className="space-y-4">
                            <h4 className="font-medium">Teacher Breakdown</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Teacher</TableHead>
                                  <TableHead>Position</TableHead>
                                  <TableHead>Hours</TableHead>
                                  <TableHead className="text-right">
                                    Earnings
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-green-500" />
                                      <span>John Smith</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>Mathematics</TableCell>
                                  <TableCell>24</TableCell>
                                  <TableCell className="text-right">
                                    £1,200
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-green-500" />
                                      <span>Sarah Johnson</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>English</TableCell>
                                  <TableCell>20</TableCell>
                                  <TableCell className="text-right">
                                    £1,000
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-green-500" />
                                      <span>Michael Chen</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>Science</TableCell>
                                  <TableCell>16</TableCell>
                                  <TableCell className="text-right">
                                    £800
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
                <TableRow className="font-medium bg-gray-50">
                  <TableCell>Total</TableCell>
                  <TableCell>{selectedWeekData.totalBookings}</TableCell>
                  <TableCell>{selectedWeekData.totalHours}</TableCell>
                  <TableCell className="text-right">
                    £{selectedWeekData.totalEarnings.toLocaleString()}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Bookings Below Target Margin</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Consultant</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Current Rate</TableHead>
                  <TableHead>Target Rate</TableHead>
                  <TableHead>Current Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-red-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-red-500" />
                      <span>David Wilson</span>
                    </div>
                  </TableCell>
                  <TableCell>Northside Academy</TableCell>
                  <TableCell>£125</TableCell>
                  <TableCell className="font-medium text-green-600">
                    £179
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-red-100 text-red-800">21%</Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="bg-amber-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-amber-500" />
                      <span>Sarah Johnson</span>
                    </div>
                  </TableCell>
                  <TableCell>Oakridge Elementary</TableCell>
                  <TableCell>£130</TableCell>
                  <TableCell className="font-medium text-green-600">
                    £186
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-amber-100 text-amber-800">25%</Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="bg-amber-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-amber-500" />
                      <span>Jennifer Lee</span>
                    </div>
                  </TableCell>
                  <TableCell>Oakridge Elementary</TableCell>
                  <TableCell>£140</TableCell>
                  <TableCell className="font-medium text-green-600">
                    £200
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-amber-100 text-amber-800">27%</Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="bg-gray-50 font-medium">
                  <TableCell colSpan={5} className="text-center py-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 mx-auto"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      View All Margin Reports
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Weekly Earnings Trend</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg border">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">
                  Weekly earnings trend chart would appear here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Consultant Performance</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Consultant</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Avg. Rate</TableHead>
                  <TableHead>Avg. Margin</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>John Smith</span>
                    </div>
                  </TableCell>
                  <TableCell>12</TableCell>
                  <TableCell>£150</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">32%</Badge>
                  </TableCell>
                  <TableCell className="text-right">£4,800</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>Sarah Johnson</span>
                    </div>
                  </TableCell>
                  <TableCell>8</TableCell>
                  <TableCell>£130</TableCell>
                  <TableCell>
                    <Badge className="bg-amber-100 text-amber-800">25%</Badge>
                  </TableCell>
                  <TableCell className="text-right">£3,200</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>Michael Chen</span>
                    </div>
                  </TableCell>
                  <TableCell>10</TableCell>
                  <TableCell>£175</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">35%</Badge>
                  </TableCell>
                  <TableCell className="text-right">£3,750</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>Emily Rodriguez</span>
                    </div>
                  </TableCell>
                  <TableCell>6</TableCell>
                  <TableCell>£145</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">30%</Badge>
                  </TableCell>
                  <TableCell className="text-right">£2,250</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeeklyReport;
