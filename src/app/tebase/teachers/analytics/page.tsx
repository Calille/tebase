"use client";

import React from "react";
import TeacherAnalytics from "@/components/tebase/teachers/TeacherAnalytics";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { ChevronRight, BarChart } from "lucide-react";

export default function TeacherAnalyticsPage() {
  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink to="/tebase">Tebase</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink to="/tebase/teachers">Teachers</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink to="/tebase/teachers/analytics" className="flex items-center gap-1">
            <BarChart className="h-4 w-4" />
            Analytics
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <TeacherAnalytics />
    </div>
  );
} 