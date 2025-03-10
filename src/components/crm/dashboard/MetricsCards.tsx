import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  ArrowUp,
  ArrowDown,
  Users,
  DollarSign,
  Briefcase,
  Clock,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: {
    value: string;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
}

const MetricCard = ({
  title = "Metric",
  value = "0",
  icon,
  change,
  description = "No data available",
  className = "",
}: MetricCardProps) => {
  return (
    <Card className={`bg-white h-full ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
        <div className="p-2 bg-gray-100 rounded-full">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="flex items-center mt-1">
            <span
              className={`flex items-center text-xs ${change.isPositive ? "text-green-600" : "text-red-600"}`}
            >
              {change.isPositive ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-1" />
              )}
              {change.value}
            </span>
            <span className="text-xs text-gray-500 ml-2">vs last month</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

interface MetricsCardsProps {
  metrics?: {
    totalCustomers: {
      value: string;
      change: { value: string; isPositive: boolean };
    };
    activeLeads: {
      value: string;
      change: { value: string; isPositive: boolean };
    };
    salesPipeline: {
      value: string;
      change: { value: string; isPositive: boolean };
    };
    avgDealCycle: {
      value: string;
      change: { value: string; isPositive: boolean };
    };
  };
}

const MetricsCards = ({
  metrics = {
    totalCustomers: {
      value: "1,284",
      change: { value: "12%", isPositive: true },
    },
    activeLeads: {
      value: "342",
      change: { value: "8%", isPositive: true },
    },
    salesPipeline: {
      value: "$2.4M",
      change: { value: "5%", isPositive: true },
    },
    avgDealCycle: {
      value: "28 days",
      change: { value: "3%", isPositive: false },
    },
  },
}: MetricsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <MetricCard
        title="Total Customers"
        value={metrics.totalCustomers.value}
        icon={<Users className="h-4 w-4 text-blue-600" />}
        change={metrics.totalCustomers.change}
        description="Total number of customers"
      />
      <MetricCard
        title="Active Leads"
        value={metrics.activeLeads.value}
        icon={<Briefcase className="h-4 w-4 text-indigo-600" />}
        change={metrics.activeLeads.change}
        description="Leads in active negotiation"
      />
      <MetricCard
        title="Sales Pipeline"
        value={metrics.salesPipeline.value}
        icon={<DollarSign className="h-4 w-4 text-green-600" />}
        change={metrics.salesPipeline.change}
        description="Total value of deals in pipeline"
      />
      <MetricCard
        title="Avg. Deal Cycle"
        value={metrics.avgDealCycle.value}
        icon={<Clock className="h-4 w-4 text-orange-600" />}
        change={metrics.avgDealCycle.change}
        description="Average time to close deals"
      />
    </div>
  );
};

export default MetricsCards;
