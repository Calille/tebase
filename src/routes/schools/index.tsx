import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal, Plus, Search } from "lucide-react";
import { schoolService, School } from "@/services/schoolService";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { toastWriteResult } from "@/lib/persistence";

const SchoolsPage = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const data = await schoolService.getSchools();
        setSchools(data);
        setFilteredSchools(data);
      } catch (err) {
        console.error("Error fetching schools:", err);
        setError("Failed to load schools");
        toast({
          title: "Error",
          description: "Failed to load schools. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSchools(schools);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = schools.filter(
        (school) =>
          school.name.toLowerCase().includes(lowercasedSearch) ||
          school.address.city.toLowerCase().includes(lowercasedSearch) ||
          school.type.toLowerCase().includes(lowercasedSearch) ||
          (school.primaryContact?.name && school.primaryContact.name.toLowerCase().includes(lowercasedSearch)) ||
          (school.primaryContact?.email && school.primaryContact.email.toLowerCase().includes(lowercasedSearch))
      );
      setFilteredSchools(filtered);
    }
  }, [searchTerm, schools]);

  const handleCreateSchool = () => {
    navigate("/schools/new");
  };

  const handleViewSchool = (id: string) => {
    navigate(`/schools/${id}`);
  };

  const handleDeleteSchool = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this school?")) {
      try {
        const result = await schoolService.deleteSchool(id);
        toastWriteResult("School deleted", result);
        if (result.ok) {
          setSchools(schools.filter((school) => school.id !== id));
        }
      } catch (err) {
        console.error("Error deleting school:", err);
        toast({
          title: "Error",
          description: "Failed to delete the school. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-lg">Loading schools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Toaster />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Schools</CardTitle>
            <CardDescription>
              Manage your schools and educational institutions
            </CardDescription>
          </div>
          <Button onClick={handleCreateSchool}>
            <Plus className="mr-2 h-4 w-4" />
            Add School
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search schools by name, city, type, or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive">{error}</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : filteredSchools.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? "No schools match your search criteria" : "No schools found"}
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm("")} 
                  className="mt-4"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Primary Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>{school.address.city}</TableCell>
                    <TableCell>{school.type}</TableCell>
                    <TableCell>
                      {school.primaryContact?.name && (
                        <div>
                          <div>{school.primaryContact.name}</div>
                          {school.primaryContact.email && (
                            <div className="text-sm text-muted-foreground">
                              {school.primaryContact.email}
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewSchool(school.id)}>
                            View/Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteSchool(school.id)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolsPage; 