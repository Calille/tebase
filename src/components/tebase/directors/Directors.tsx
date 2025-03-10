import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  MapPin,
} from "lucide-react";

const Directors = () => {
  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Executive Dashboard</TabsTrigger>
          <TabsTrigger value="financial">Financial Overview</TabsTrigger>
          <TabsTrigger value="strategic">Strategic Planning</TabsTrigger>
          <TabsTrigger value="reports">Board Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Annual Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">£4.8M</p>
                    <p className="text-xs text-gray-500">Year to date</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">12.4%</span>
                  <span className="text-gray-500 ml-1">vs last year</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Teachers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">1,248</p>
                    <p className="text-xs text-gray-500">Active teachers</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">8.7%</span>
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
                    <p className="text-3xl font-bold">342</p>
                    <p className="text-xs text-gray-500">Active partnerships</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-full">
                    <Building className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">15.2%</span>
                  <span className="text-gray-500 ml-1">vs last quarter</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Profit Margin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">24.8%</p>
                    <p className="text-xs text-gray-500">Year to date</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-full">
                    <PieChart className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">3.2%</span>
                  <span className="text-gray-500 ml-1">vs last year</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Revenue by Region</CardTitle>
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
                      Regional revenue chart would appear here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Growth Projections</CardTitle>
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
                    <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">
                      Growth projection chart would appear here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Executive Alerts</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg flex items-start gap-4 bg-red-50">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Critical Staff Shortage</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Projected teacher shortage in the North region for the
                      upcoming quarter. HR department has been notified and is
                      implementing recruitment strategies.
                    </p>
                    <div className="mt-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg flex items-start gap-4 bg-amber-50">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Regulatory Change</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      New education regulations coming into effect next quarter.
                      Compliance team is preparing necessary adjustments to our
                      operations.
                    </p>
                    <div className="mt-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg flex items-start gap-4 bg-green-50">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">
                      Market Expansion Opportunity
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Analysis shows potential for expansion into the Southwest
                      region. Business development team has prepared a detailed
                      proposal.
                    </p>
                    <div className="mt-2">
                      <Button variant="outline" size="sm">
                        View Proposal
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Financial Performance</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Printer className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg border">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">
                    Financial performance chart would appear here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategic" className="space-y-6">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Strategic Planning</CardTitle>
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
                  <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">
                    Strategic planning map would appear here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Board Reports</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <FileText className="h-4 w-4" />
                Generate Report
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg flex items-start gap-4">
                  <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Q2 Financial Report</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Complete financial overview for Q2 2023
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button variant="outline" size="sm">
                        View Report
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg flex items-start gap-4">
                  <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Annual Growth Strategy</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Strategic growth plan for the upcoming fiscal year
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button variant="outline" size="sm">
                        View Report
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg flex items-start gap-4">
                  <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Compliance Summary</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Overview of regulatory compliance status
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button variant="outline" size="sm">
                        View Report
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Download PDF
                      </Button>
                    </div>
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

export default Directors;
