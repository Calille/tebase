import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../ui/pagination";
import {
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  ChevronDown,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Star,
  StarOff,
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "active" | "inactive" | "lead";
  lastContact: string;
  value: number;
  favorite: boolean;
}

interface CustomerListProps {
  customers?: Customer[];
  onViewCustomer?: (customerId: string) => void;
  onAddCustomer?: (customer: Omit<Customer, "id">) => void;
  onUpdateCustomer?: (customer: Customer) => void;
  onDeleteCustomer?: (customerId: string) => void;
}

const CustomerList = ({
  customers: initialCustomers,
  onViewCustomer,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}: CustomerListProps) => {
  // Default customers data if none provided
  const defaultCustomers: Customer[] = [
    {
      id: "cust-001",
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "(555) 123-4567",
      company: "Acme Corporation",
      status: "active",
      lastContact: "2023-06-15",
      value: 15000,
      favorite: true,
    },
    {
      id: "cust-002",
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "(555) 987-6543",
      company: "Global Industries",
      status: "lead",
      lastContact: "2023-06-10",
      value: 7500,
      favorite: false,
    },
    {
      id: "cust-003",
      name: "Michael Chen",
      email: "m.chen@example.com",
      phone: "(555) 456-7890",
      company: "Tech Innovations",
      status: "active",
      lastContact: "2023-06-05",
      value: 25000,
      favorite: true,
    },
    {
      id: "cust-004",
      name: "Emily Rodriguez",
      email: "emily.r@example.com",
      phone: "(555) 234-5678",
      company: "Creative Solutions",
      status: "inactive",
      lastContact: "2023-05-28",
      value: 5000,
      favorite: false,
    },
    {
      id: "cust-005",
      name: "David Wilson",
      email: "d.wilson@example.com",
      phone: "(555) 876-5432",
      company: "Wilson Enterprises",
      status: "active",
      lastContact: "2023-06-12",
      value: 18000,
      favorite: false,
    },
    {
      id: "cust-006",
      name: "Jennifer Lee",
      email: "j.lee@example.com",
      phone: "(555) 345-6789",
      company: "Summit Group",
      status: "lead",
      lastContact: "2023-06-08",
      value: 12000,
      favorite: true,
    },
    {
      id: "cust-007",
      name: "Robert Taylor",
      email: "r.taylor@example.com",
      phone: "(555) 654-3210",
      company: "Taylor & Associates",
      status: "active",
      lastContact: "2023-06-01",
      value: 30000,
      favorite: false,
    },
  ];

  const [customers, setCustomers] = useState<Customer[]>(
    initialCustomers || defaultCustomers,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Customer>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "lead" as const,
  });

  const itemsPerPage = 5;

  // Filter customers based on search term and status filter
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortField === "value") {
      return sortDirection === "asc"
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField];
    } else {
      const aValue = String(a[sortField]).toLowerCase();
      const bValue = String(b[sortField]).toLowerCase();
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
  });

  // Paginate customers
  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);
  const paginatedCustomers = sortedCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Handle sort
  const handleSort = (field: keyof Customer) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle view customer
  const handleViewCustomer = (customerId: string) => {
    if (onViewCustomer) {
      onViewCustomer(customerId);
    } else {
      console.log(`View customer with ID: ${customerId}`);
    }
  };

  // Handle add customer
  const handleAddCustomer = () => {
    const customer = {
      ...newCustomer,
      lastContact: new Date().toISOString().split("T")[0],
      value: 0,
      favorite: false,
    };

    if (onAddCustomer) {
      onAddCustomer(customer);
    } else {
      const newCustomerWithId: Customer = {
        ...customer,
        id: `cust-${Date.now().toString().slice(-6)}`,
      };
      setCustomers([...customers, newCustomerWithId]);
    }

    setNewCustomer({
      name: "",
      email: "",
      phone: "",
      company: "",
      status: "lead",
    });
    setIsAddDialogOpen(false);
  };

  // Handle toggle favorite
  const handleToggleFavorite = (customerId: string) => {
    const updatedCustomers = customers.map((customer) =>
      customer.id === customerId
        ? { ...customer, favorite: !customer.favorite }
        : customer,
    );

    if (onUpdateCustomer) {
      const customerToUpdate = updatedCustomers.find(
        (c) => c.id === customerId,
      );
      if (customerToUpdate) {
        onUpdateCustomer(customerToUpdate);
      }
    }

    setCustomers(updatedCustomers);
  };

  // Handle delete customer
  const handleDeleteCustomer = (customerId: string) => {
    if (onDeleteCustomer) {
      onDeleteCustomer(customerId);
    } else {
      setCustomers(customers.filter((customer) => customer.id !== customerId));
    }
  };

  // Get status badge
  const getStatusBadge = (status: Customer["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return (
          <Badge variant="outline" className="text-gray-500">
            Inactive
          </Badge>
        );
      case "lead":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Lead
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Customers</h2>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add Customer</span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  Name
                  {sortField === "name" && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                    />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("company")}
              >
                <div className="flex items-center gap-1">
                  Company
                  {sortField === "company" && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                    />
                  )}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("lastContact")}
              >
                <div className="flex items-center gap-1">
                  Last Contact
                  {sortField === "lastContact" && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                    />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort("value")}
              >
                <div className="flex items-center justify-end gap-1">
                  Value
                  {sortField === "value" && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                    />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleViewCustomer(customer.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(customer.id);
                        }}
                        className="text-gray-400 hover:text-yellow-400 transition-colors"
                      >
                        {customer.favorite ? (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </button>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{customer.company}</TableCell>
                  <TableCell>{getStatusBadge(customer.status)}</TableCell>
                  <TableCell>{customer.lastContact}</TableCell>
                  <TableCell className="text-right">
                    ${customer.value.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCustomer(customer.id);
                          }}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `mailto:${customer.email}`;
                          }}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `tel:${customer.phone}`;
                          }}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            // Schedule meeting logic would go here
                            console.log(
                              `Schedule meeting with ${customer.name}`,
                            );
                          }}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Meeting
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomer(customer.id);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {searchTerm || statusFilter !== "all" ? (
                    <div className="text-gray-500">
                      No customers found matching your search criteria.
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <UserPlus className="h-12 w-12 text-gray-300 mb-2" />
                      <div className="text-gray-500 mb-2">
                        No customers added yet
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(true)}
                      >
                        Add Your First Customer
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Add Customer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
                placeholder="John Smith"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={newCustomer.email}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
                placeholder="john.smith@example.com"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone
              </label>
              <Input
                id="phone"
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="company" className="text-sm font-medium">
                Company
              </label>
              <Input
                id="company"
                value={newCustomer.company}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, company: e.target.value })
                }
                placeholder="Acme Corporation"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select
                value={newCustomer.status}
                onValueChange={(value: "active" | "inactive" | "lead") =>
                  setNewCustomer({ ...newCustomer, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddCustomer}
              disabled={!newCustomer.name || !newCustomer.email}
            >
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerList;
