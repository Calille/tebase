import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Plus, Search, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { teacherService, Teacher } from "@/services/teacherService";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { toastWriteResult } from "@/lib/persistence";

const TeachersListPage = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getTeachers();
      setTeachers(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setError("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = () => {
    navigate("/teachers/new");
  };

  const handleViewTeacher = (id: string) => {
    navigate(`/teachers/${id}`);
  };

  const handleEditTeacher = (id: string) => {
    navigate(`/teachers/${id}`);
  };

  const handleDeleteTeacher = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        const result = await teacherService.deleteTeacher(id);
        toastWriteResult(`${name} deleted`, result);
        if (result.ok) {
          fetchTeachers();
        }
      } catch (error) {
        console.error("Error deleting teacher:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  };

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (teacher.region?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>;
      case "inactive":
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Inactive</span>;
      case "pending":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>;
      default:
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{status}</span>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Teachers</CardTitle>
              <CardDescription>
                Manage your teaching staff
              </CardDescription>
            </div>
            <Button onClick={handleAddTeacher}>
              <Plus className="mr-2 h-4 w-4" />
              Add Teacher
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No teachers match your search" : "No teachers found"}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.name}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{teacher.phone}</TableCell>
                      <TableCell>{teacher.region || 'Not specified'}</TableCell>
                      <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewTeacher(teacher.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditTeacher(teacher.id)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
};

export default TeachersListPage; 