import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Users,
  Building,
  DollarSign,
  Calendar,
  Download,
  FileText,
  Printer,
  Share2,
} from "lucide-react";

const Management = () => {
  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">£1.2M</p>
                    <p className="text-xs text-gray-500">Year to date</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">8.2%</span>
                  <span className="text-gray-500 ml-1">vs last year</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Active Teachers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">248</p>
                    <p className="text-xs text-gray-500">Currently employed</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">12%</span>
                  <span className="text-gray-500 ml-1">vs last quarter</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Partner Schools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">52</p>
                    <p className="text-xs text-gray-500">Active partnerships</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-full">
                    <Building className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">5%</span>
                  <span className="text-gray-500 ml-1">vs last quarter</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Bookings This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">124</p>
                    <p className="text-xs text-gray-500">Total bookings</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-full">
                    <Calendar className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">15%</span>
                  <span className="text-gray-500 ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Revenue Breakdown</CardTitle>
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
                      Revenue chart visualization would appear here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Teacher Utilization</CardTitle>
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
                      Teacher utilization chart would appear here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Financial Overview</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      £1,245,890
                    </p>
                    <p className="text-xs text-green-500 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" /> 8.2% vs last year
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      Operating Expenses
                    </p>
                    <p className="text-2xl font-bold text-gray-900">£876,540</p>
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" /> 5.4% vs last year
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      Net Profit
                    </p>
                    <p className="text-2xl font-bold text-gray-900">£369,350</p>
                    <p className="text-xs text-green-500 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" /> 12.7% vs last year
                    </p>
                  </div>
                </div>

                <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">
                      Financial performance chart would appear here
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Operational Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      Teacher Utilization
                    </p>
                    <p className="text-2xl font-bold text-gray-900">87%</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      School Satisfaction
                    </p>
                    <p className="text-2xl font-bold text-gray-900">92%</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      Booking Fulfillment
                    </p>
                    <p className="text-2xl font-bold text-gray-900">95%</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      Response Time
                    </p>
                    <p className="text-2xl font-bold text-gray-900">4.2 hrs</p>
                  </div>
                </div>

                <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">
                      Operational performance chart would appear here
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex justify-end mb-4">
            <Button className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Generate New Report
            </Button>
          </div>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="font-medium">Monthly Financial Summary</h3>
                    <p className="text-sm text-gray-500">
                      Last generated: June 1, 2023
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="font-medium">Teacher Performance Report</h3>
                    <p className="text-sm text-gray-500">
                      Last generated: May 15, 2023
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="font-medium">School Partnership Analysis</h3>
                    <p className="text-sm text-gray-500">
                      Last generated: May 10, 2023
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="font-medium">Quarterly Business Review</h3>
                    <p className="text-sm text-gray-500">
                      Last generated: April 1, 2023
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Management;
