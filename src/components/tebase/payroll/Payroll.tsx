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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Download,
  FileSpreadsheet,
  Calendar,
  DollarSign,
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Printer,
} from "lucide-react";

interface PayrollEntry {
  id: string;
  teacher: {
    id: string;
    name: string;
  };
  period: string;
  hours: number;
  rate: number;
  totalEarnings: number;
  status: "pending" | "processed" | "paid";
  paymentDate?: string;
  reference?: string;
}

const Payroll = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  // Sample data for payroll entries
  const payrollEntries: PayrollEntry[] = [
    {
      id: "pay-001",
      teacher: {
        id: "teach-001",
        name: "John Smith",
      },
      period: "June 12 - June 18, 2023",
      hours: 35,
      rate: 50,
      totalEarnings: 1750,
      status: "pending",
    },
    {
      id: "pay-002",
      teacher: {
        id: "teach-002",
        name: "Sarah Johnson",
      },
      period: "June 12 - June 18, 2023",
      hours: 28,
      rate: 45,
      totalEarnings: 1260,
      status: "pending",
    },
    {
      id: "pay-003",
      teacher: {
        id: "teach-003",
        name: "Michael Chen",
      },
      period: "June 12 - June 18, 2023",
      hours: 32,
      rate: 55,
      totalEarnings: 1760,
      status: "pending",
    },
    {
      id: "pay-004",
      teacher: {
        id: "teach-004",
        name: "Emily Rodriguez",
      },
      period: "June 12 - June 18, 2023",
      hours: 25,
      rate: 48,
      totalEarnings: 1200,
      status: "pending",
    },
    {
      id: "pay-005",
      teacher: {
        id: "teach-005",
        name: "David Wilson",
      },
      period: "June 12 - June 18, 2023",
      hours: 30,
      rate: 52,
      totalEarnings: 1560,
      status: "pending",
    },
    {
      id: "pay-006",
      teacher: {
        id: "teach-001",
        name: "John Smith",
      },
      period: "June 5 - June 11, 2023",
      hours: 32,
      rate: 50,
      totalEarnings: 1600,
      status: "paid",
      paymentDate: "2023-06-15",
      reference: "PAY-20230615-001",
    },
    {
      id: "pay-007",
      teacher: {
        id: "teach-002",
        name: "Sarah Johnson",
      },
      period: "June 5 - June 11, 2023",
      hours: 30,
      rate: 45,
      totalEarnings: 1350,
      status: "paid",
      paymentDate: "2023-06-15",
      reference: "PAY-20230615-002",
    },
    {
      id: "pay-008",
      teacher: {
        id: "teach-003",
        name: "Michael Chen",
      },
      period: "June 5 - June 11, 2023",
      hours: 35,
      rate: 55,
      totalEarnings: 1925,
      status: "paid",
      paymentDate: "2023-06-15",
      reference: "PAY-20230615-003",
    },
  ];

  // Filter entries based on selected period, search term, and status filter
  const filteredEntries = payrollEntries.filter((entry) => {
    const matchesPeriod =
      (selectedPeriod === "current" &&
        entry.period === "June 12 - June 18, 2023") ||
      (selectedPeriod === "previous" &&
        entry.period === "June 5 - June 11, 2023") ||
      selectedPeriod === "all";

    const matchesSearch = entry.teacher.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || entry.status === statusFilter;

    return matchesPeriod && matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalHours = filteredEntries.reduce(
    (sum, entry) => sum + entry.hours,
    0,
  );
  const totalEarnings = filteredEntries.reduce(
    (sum, entry) => sum + entry.totalEarnings,
    0,
  );

  // Handle select all entries
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEntries(filteredEntries.map((entry) => entry.id));
    } else {
      setSelectedEntries([]);
    }
  };

  // Handle select individual entry
  const handleSelectEntry = (entryId: string, checked: boolean) => {
    if (checked) {
      setSelectedEntries([...selectedEntries, entryId]);
    } else {
      setSelectedEntries(selectedEntries.filter((id) => id !== entryId));
    }
  };

  // Get status badge
  const getStatusBadge = (status: PayrollEntry["status"]) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "processed":
        return <Badge className="bg-blue-100 text-blue-800">Processed</Badge>;
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[240px]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <SelectValue placeholder="Select period" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">
                Current Week (June 12 - 18)
              </SelectItem>
              <SelectItem value="previous">
                Previous Week (June 5 - 11)
              </SelectItem>
              <SelectItem value="all">All Periods</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search teachers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-1"
            disabled={selectedEntries.length === 0}
          >
            <CheckCircle className="h-4 w-4" />
            Mark as Processed
          </Button>
          <Button
            className="flex items-center gap-1"
            disabled={selectedEntries.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Generate Payroll
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{filteredEntries.length}</p>
                <p className="text-xs text-gray-500">To be paid this period</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{totalHours}</p>
                <p className="text-xs text-gray-500">
                  Hours worked this period
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Payroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">
                  £{totalEarnings.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">To be paid this period</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payroll Entries</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" className="flex items-center gap-1">
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      selectedEntries.length === filteredEntries.length &&
                      filteredEntries.length > 0
                    }
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  />
                </TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Rate (£/hr)</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedEntries.includes(entry.id)}
                        onCheckedChange={(checked) =>
                          handleSelectEntry(entry.id, !!checked)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">
                          {entry.teacher.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{entry.period}</TableCell>
                    <TableCell>{entry.hours}</TableCell>
                    <TableCell>£{entry.rate}</TableCell>
                    <TableCell className="text-right font-medium">
                      £{entry.totalEarnings.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(entry.status)}</TableCell>
                    <TableCell>{entry.paymentDate || "-"}</TableCell>
                    <TableCell>{entry.reference || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500">
                        No payroll entries found matching your criteria.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {filteredEntries.length > 0 && (
                <TableRow className="font-medium bg-gray-50">
                  <TableCell></TableCell>
                  <TableCell colSpan={2}>Total</TableCell>
                  <TableCell>{totalHours}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell className="text-right">
                    £{totalEarnings.toLocaleString()}
                  </TableCell>
                  <TableCell colSpan={3}></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Payroll Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-50 rounded-full">
                  <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-medium">Generate Excel Spreadsheet</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Export payroll data to Excel format for your accounting system.
              </p>
              <Button variant="outline" className="w-full">
                Generate Excel
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-50 rounded-full">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-medium">Process Payments</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Process payments for selected teachers through your payment
                system.
              </p>
              <Button className="w-full">Process Payments</Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-50 rounded-full">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-medium">Generate Pay Slips</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Create and download PDF pay slips for all teachers.
              </p>
              <Button variant="outline" className="w-full">
                Generate Pay Slips
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payroll;
