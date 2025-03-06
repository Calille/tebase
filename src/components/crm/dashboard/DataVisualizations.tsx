import React from "react";
import {
  BarChart,
  LineChart,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface DataVisualizationsProps {
  salesData?: {
    labels: string[];
    datasets: {
      name: string;
      data: number[];
    }[];
  };
  pipelineData?: {
    stages: {
      name: string;
      value: number;
      color: string;
    }[];
  };
  conversionRates?: {
    current: number;
    previous: number;
  };
  averageDealSize?: {
    current: number;
    previous: number;
  };
}

const DataVisualizations = ({
  salesData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        name: "This Year",
        data: [30, 40, 35, 50, 49, 60],
      },
      {
        name: "Last Year",
        data: [25, 30, 31, 40, 35, 45],
      },
    ],
  },
  pipelineData = {
    stages: [
      { name: "Lead", value: 125, color: "#94a3b8" },
      { name: "Qualified", value: 84, color: "#64748b" },
      { name: "Proposal", value: 56, color: "#475569" },
      { name: "Negotiation", value: 32, color: "#334155" },
      { name: "Closed Won", value: 18, color: "#1e293b" },
    ],
  },
  conversionRates = {
    current: 24.8,
    previous: 21.6,
  },
  averageDealSize = {
    current: 28500,
    previous: 26200,
  },
}: DataVisualizationsProps) => {
  // Calculate percentage change
  const conversionChange =
    ((conversionRates.current - conversionRates.previous) /
      conversionRates.previous) *
    100;

  const dealSizeChange =
    ((averageDealSize.current - averageDealSize.previous) /
      averageDealSize.previous) *
    100;

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">
          Sales Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Conversion Rate
                  </p>
                  <h4 className="text-2xl font-bold">
                    {conversionRates.current}%
                  </h4>
                  <div className="flex items-center mt-1">
                    {conversionChange > 0 ? (
                      <>
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-xs font-medium text-green-500">
                          {conversionChange.toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-xs font-medium text-red-500">
                          {Math.abs(conversionChange).toFixed(1)}%
                        </span>
                      </>
                    )}
                    <span className="text-xs text-gray-500 ml-1">
                      vs last period
                    </span>
                  </div>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <PieChart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Average Deal Size
                  </p>
                  <h4 className="text-2xl font-bold">
                    <DollarSign className="h-5 w-5 inline-block" />
                    {averageDealSize.current.toLocaleString()}
                  </h4>
                  <div className="flex items-center mt-1">
                    {dealSizeChange > 0 ? (
                      <>
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-xs font-medium text-green-500">
                          {dealSizeChange.toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-xs font-medium text-red-500">
                          {Math.abs(dealSizeChange).toFixed(1)}%
                        </span>
                      </>
                    )}
                    <span className="text-xs text-gray-500 ml-1">
                      vs last period
                    </span>
                  </div>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <BarChart className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="sales">Sales Trends</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline Funnel</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            <div className="h-[300px] w-full bg-gray-50 rounded-lg flex items-center justify-center border">
              <div className="text-center p-4">
                <LineChart className="h-10 w-10 mx-auto text-blue-500 mb-2" />
                <p className="text-sm text-gray-500">
                  Sales trend visualization would render here with actual chart
                  library
                </p>
                <div className="mt-4 flex justify-center gap-4">
                  {salesData.datasets.map((dataset, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className={cn(
                          "h-3 w-3 rounded-full mr-2",
                          index === 0 ? "bg-blue-500" : "bg-blue-300",
                        )}
                      />
                      <span className="text-xs">{dataset.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-2 text-center text-xs text-gray-500">
              {salesData.labels.map((label, index) => (
                <div key={index} className="p-2">
                  <div className="h-20 relative bg-gray-100 rounded">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-b"
                      style={{
                        height: `${(salesData.datasets[0].data[index] / 60) * 100}%`,
                      }}
                    />
                  </div>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-4">
            <div className="h-[300px] w-full bg-gray-50 rounded-lg flex items-center justify-center border">
              <div className="text-center p-4">
                <BarChart className="h-10 w-10 mx-auto text-blue-500 mb-2" />
                <p className="text-sm text-gray-500">
                  Pipeline funnel visualization would render here with actual
                  chart library
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {pipelineData.stages.map((stage, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{stage.name}</span>
                    <span className="font-medium">{stage.value}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(stage.value / pipelineData.stages[0].value) * 100}%`,
                        backgroundColor: stage.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DataVisualizations;
