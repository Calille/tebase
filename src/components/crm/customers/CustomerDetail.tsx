import React, { useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building,
  Edit,
  User,
  Calendar,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Badge } from "../../ui/badge";

import InteractionHistory from "./InteractionHistory";
import CustomerNotes from "./CustomerNotes";
import CustomerTasks from "./CustomerTasks";

interface CustomerDetailProps {
  customerId?: string;
  onBack?: () => void;
}

const CustomerDetail = ({
  customerId = "123",
  onBack = () => {},
}: CustomerDetailProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock customer data
  const customer = {
    id: customerId,
    name: "Acme Corporation",
    contactPerson: "John Smith",
    email: "john.smith@acmecorp.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business Ave, Suite 100, San Francisco, CA 94107",
    industry: "Technology",
    status: "Active",
    customerSince: "January 2022",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=acme",
    tags: ["Enterprise", "SaaS", "High Value"],
    website: "www.acmecorp.com",
    lastContact: "2023-06-15",
    nextFollowUp: "2023-06-30",
    accountManager: "Alex Johnson",
    lifetimeValue: "$45,000",
    openDeals: 2,
    revenueYTD: "$28,500",
  };

  return (
    <div className="w-full bg-gray-50 p-6 rounded-lg">
      {/* Header with back button */}
      <div className="mb-6 flex items-center">
        <Button variant="ghost" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
      </div>

      {/* Customer profile header */}
      <div className="mb-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
        <Avatar className="h-24 w-24 border-2 border-white shadow-sm">
          <AvatarImage src={customer.avatar} alt={customer.name} />
          <AvatarFallback className="text-2xl">
            {customer.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {customer.name}
              </h1>
              <p className="text-gray-600">
                {customer.contactPerson} • {customer.industry}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {customer.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Phone className="h-4 w-4" />
                Call
              </Button>
              <Button size="sm" className="flex items-center gap-1">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for different sections */}
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer Information Card */}
            <Card className="md:col-span-1 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Contact Person
                    </p>
                    <p className="text-gray-900">{customer.contactPerson}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{customer.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-gray-900">{customer.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-gray-900">{customer.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Website</p>
                    <p className="text-gray-900">{customer.website}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Customer Since
                    </p>
                    <p className="text-gray-900">{customer.customerSince}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Metrics Card */}
            <Card className="md:col-span-2 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  Business Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      Lifetime Value
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {customer.lifetimeValue}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      Open Deals
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {customer.openDeals}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      Revenue YTD
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {customer.revenueYTD}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      Account Manager
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {customer.accountManager}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      Last Contact
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {customer.lastContact}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      Next Follow-up
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {customer.nextFollowUp}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Interactions */}
            <Card className="md:col-span-3 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  Recent Interactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InteractionHistory customerId={customerId} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interactions">
          <InteractionHistory customerId={customerId} />
        </TabsContent>

        <TabsContent value="tasks">
          <CustomerTasks customerId={customerId} customerName={customer.name} />
        </TabsContent>

        <TabsContent value="notes">
          <CustomerNotes customerId={customerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDetail;
