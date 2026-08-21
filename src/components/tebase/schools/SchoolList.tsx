import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  ChevronDown,
  Building,
  Mail,
  Phone,
  Calendar,
  Star,
  StarOff,
  MapPin,
  Users,
  Eye,
  Globe,
  Trash2,
  Edit,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SchoolDetail from "./SchoolDetail";
import { School, schoolService } from "@/services/schoolService";
import DemoBanner from "@/components/tebase/shared/DemoBanner";
import { toastWriteResult } from "@/lib/persistence";

interface SchoolListProps {
  schools?: School[];
  onViewSchool?: (schoolId: string) => void;
  onAddSchool?: (school: Omit<School, "id">) => void;
  onUpdateSchool?: (school: School) => void;
  onDeleteSchool?: (schoolId: string) => void;
}

const SchoolList = ({
  schools: initialSchools,
  onViewSchool,
  onAddSchool,
  onUpdateSchool,
  onDeleteSchool,
}: SchoolListProps) => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [newSchool, setNewSchool] = useState({
    name: "",
    address: "",
    city: "",
    contactPerson: "",
    email: "",
    phone: "",
    type: "primary",
    status: "new" as const,
    teachersNeeded: 0,
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<string | null>(null);

  const [itemsPerPage] = useState(10);

  // Fetch schools from the API
  useEffect(() => {
    const fetchSchools = async () => {
      if (initialSchools) {
        // If schools are provided as props, use them
        setSchools(initialSchools);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await schoolService.getSchools();
        if (data.length > 0) {
          setSchools(data);
        }
      } catch (err) {
        console.error("Failed to fetch schools:", err);
        setError("Failed to load schools. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, [initialSchools]);

  // Filter schools based on search term and filters
  const filteredSchools = schools.filter((school) => {
    const city = school.address?.city || "";
    const contactName = school.primaryContact?.name || "";
    const matchesSearch =
      searchTerm === "" ||
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contactName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || school.type === typeFilter;

    return matchesSearch && matchesType;
  });

  // Sort schools
  const sortedSchools = [...filteredSchools].sort((a, b) => {
    const aValue = String(
      sortField === "city" ? a.address?.city || "" : (a as unknown as Record<string, unknown>)[sortField] ?? ""
    ).toLowerCase();
    const bValue = String(
      sortField === "city" ? b.address?.city || "" : (b as unknown as Record<string, unknown>)[sortField] ?? ""
    ).toLowerCase();
    return sortDirection === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  // Paginate schools
  const totalPages = Math.ceil(sortedSchools.length / itemsPerPage);
  const paginatedSchools = sortedSchools.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Handle sort
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle view school
  const handleViewSchool = (schoolId: string) => {
    if (onViewSchool) {
      onViewSchool(schoolId);
    } else {
      // Navigate to the school detail page
      navigate(`/schools/${schoolId}`);
    }
  };

  // Handle back from detail view
  const handleBackFromDetail = () => {
    setSelectedSchool(null);
  };

  // Handle add school
  const handleAddSchool = async () => {
    try {
      // Validate form
      if (!newSchool.name || !newSchool.address || !newSchool.contactPerson || !newSchool.email) {
        alert("Please fill in all required fields");
        return;
      }

      const schoolData = {
        ...newSchool,
        lastBooking: "-",
        rating: 0,
        favorite: false,
      };

      const result = await schoolService.createSchool(
        schoolData as Record<string, unknown>
      );

      toastWriteResult("School created", result);

      if (result.data) {
        setSchools([...schools, result.data]);
        setIsAddDialogOpen(false);
        setNewSchool({
          name: "",
          address: "",
          city: "",
          contactPerson: "",
          email: "",
          phone: "",
          type: "primary",
          status: "new",
          teachersNeeded: 0,
        });
      }
    } catch (err) {
      console.error("Failed to add school:", err);
      alert("Failed to add school. Please try again.");
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (schoolId: string, isFavorite: boolean) => {
    try {
      const result = await schoolService.toggleFavorite(schoolId, !isFavorite);

      if (result.ok) {
        setSchools(
          schools.map((school) =>
            school.id === schoolId
              ? { ...school, favorite: !isFavorite }
              : school
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  // Handle delete school
  const handleDeleteSchool = (schoolId: string) => {
    setSchoolToDelete(schoolId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSchool = async () => {
    if (schoolToDelete) {
      if (onDeleteSchool) {
        onDeleteSchool(schoolToDelete);
      } else {
        try {
          await schoolService.deleteSchool(schoolToDelete);
          setSchools(schools.filter((school) => school.id !== schoolToDelete));
          toastWriteResult("School deleted", { ok: true, persisted: false });
        } catch (error) {
          console.error("Error deleting school:", error);
        }
      }
      setIsDeleteDialogOpen(false);
      setSchoolToDelete(null);
    }
  };

  // Get status badge
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return (
          <Badge variant="outline" className="text-gray-500">
            Inactive
          </Badge>
        );
      case "new":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            New
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get type badge
  const getTypeBadge = (type: School["type"]) => {
    switch (type) {
      case "primary":
        return <Badge className="bg-green-100 text-green-800">Primary</Badge>;
      case "secondary":
        return <Badge className="bg-blue-100 text-blue-800">Secondary</Badge>;
      case "college":
        return <Badge className="bg-purple-100 text-purple-800">College</Badge>;
      case "special":
        return <Badge className="bg-amber-100 text-amber-800">Special</Badge>;
      default:
        return null;
    }
  };

  // If a school is selected, show the detail view
  if (selectedSchool) {
    return (
      <SchoolDetail schoolId={selectedSchool} onBack={handleBackFromDetail} />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading schools...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
    <DemoBanner />
    <div className="w-full bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Schools</h2>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add School</span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search schools..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[150px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="new">New</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value)}
            >
              <SelectTrigger className="w-[150px]">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <SelectValue placeholder="Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="college">College</SelectItem>
                <SelectItem value="special">Special</SelectItem>
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
                  School Name
                  {sortField === "name" && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                    />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("city")}
              >
                <div className="flex items-center gap-1">
                  Location
                  {sortField === "city" && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                    />
                  )}
                </div>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("teachersNeeded")}
              >
                <div className="flex items-center gap-1">
                  Teachers Needed
                  {sortField === "teachersNeeded" && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                    />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort("rating")}
              >
                <div className="flex items-center justify-end gap-1">
                  Rating
                  {sortField === "rating" && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                    />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[120px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSchools.length > 0 ? (
              paginatedSchools.map((school) => (
                <TableRow key={school.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(school.id, school.favorite ?? false);
                        }}
                        className="text-gray-400 hover:text-yellow-400 transition-colors"
                      >
                        {school.favorite ? (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </button>
                      <span className="font-medium">{school.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span>{school.address?.city}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(school.type)}</TableCell>
                  <TableCell>{getStatusBadge()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">
                        {school.numberOfStudents}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-gray-400 text-sm">No ratings</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 flex items-center gap-1"
                        onClick={() => handleViewSchool(school.id)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewSchool(school.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              window.open(`mailto:${school.primaryContact?.email || ""}`, "_blank");
                            }}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Contact School
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              window.open(`tel:${school.phone}`, "_blank");
                            }}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              window.open(
                                `https://${school.name.toLowerCase().replace(/\s+/g, "-")}.edu`,
                                "_blank",
                              );
                            }}
                          >
                            <Globe className="h-4 w-4 mr-2" />
                            Visit Website
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              // Book teachers logic would go here
                              console.log(`Book teachers for ${school.name}`);
                            }}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Book Teachers
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              handleDeleteSchool(school.id);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {searchTerm ||
                  statusFilter !== "all" ||
                  typeFilter !== "all" ? (
                    <div className="text-gray-500">
                      No schools found matching your search criteria.
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <Building className="h-12 w-12 text-gray-300 mb-2" />
                      <div className="text-gray-500 mb-2">
                        No schools added yet
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(true)}
                      >
                        Add Your First School
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

      {/* Add School Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New School</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                School Name
              </label>
              <Input
                id="name"
                value={newSchool.name}
                onChange={(e) =>
                  setNewSchool({ ...newSchool, name: e.target.value })
                }
                placeholder="Westfield High School"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="address" className="text-sm font-medium">
                Address
              </label>
              <Input
                id="address"
                value={newSchool.address}
                onChange={(e) =>
                  setNewSchool({ ...newSchool, address: e.target.value })
                }
                placeholder="123 Education Ave"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="city" className="text-sm font-medium">
                City
              </label>
              <Input
                id="city"
                value={newSchool.city}
                onChange={(e) =>
                  setNewSchool({ ...newSchool, city: e.target.value })
                }
                placeholder="Manchester"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="contactPerson" className="text-sm font-medium">
                Contact Person
              </label>
              <Input
                id="contactPerson"
                value={newSchool.contactPerson}
                onChange={(e) =>
                  setNewSchool({ ...newSchool, contactPerson: e.target.value })
                }
                placeholder="Jane Wilson"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={newSchool.email}
                onChange={(e) =>
                  setNewSchool({ ...newSchool, email: e.target.value })
                }
                placeholder="contact@school.edu"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone
              </label>
              <Input
                id="phone"
                value={newSchool.phone}
                onChange={(e) =>
                  setNewSchool({ ...newSchool, phone: e.target.value })
                }
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="type" className="text-sm font-medium">
                School Type
              </label>
              <Select
                value={newSchool.type}
                onValueChange={(value) =>
                  setNewSchool({ ...newSchool, type: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="college">College</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="teachersNeeded" className="text-sm font-medium">
                Teachers Needed
              </label>
              <Input
                id="teachersNeeded"
                type="number"
                min="0"
                value={newSchool.teachersNeeded.toString()}
                onChange={(e) =>
                  setNewSchool({
                    ...newSchool,
                    teachersNeeded: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSchool}
              disabled={!newSchool.name || !newSchool.email}
            >
              Add School
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete School</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this school? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteSchool}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
};

export default SchoolList;
