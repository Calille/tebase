import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { toastWriteResult } from "@/lib/persistence";
import { Toaster } from "@/components/ui/toaster";
import { CalendarIcon, FileText, Upload, AlertTriangle, CheckCircle, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { teacherService } from "@/services/teacherService";

interface TeacherDocumentsProps {
  teacherId: string;
  documents?: Array<{
    name: string;
    status: string;
    expiryDate: string;
  }>;
  onDocumentAdded?: () => void;
  readOnly?: boolean;
}

const TeacherDocuments = ({
  teacherId,
  documents = [],
  onDocumentAdded,
  readOnly = false,
}: TeacherDocumentsProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newDocument, setNewDocument] = useState({
    name: "",
    status: "pending",
    expiryDate: "",
  });
  const [date, setDate] = useState<Date>();

  const handleAddDocument = async () => {
    if (!newDocument.name) {
      toast({
        title: "Error",
        description: "Please enter a document name",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Format the date if selected
      const formattedDocument = {
        ...newDocument,
        expiryDate: date ? format(date, "yyyy-MM-dd") : "",
      };

      const result = await teacherService.addTeacherDocument(
        teacherId,
        formattedDocument
      );

      toastWriteResult("Document added", result);

      if (result.ok) {
        setNewDocument({
          name: "",
          status: "pending",
          expiryDate: "",
        });
        setDate(undefined);
        setIsAddDialogOpen(false);
        if (onDocumentAdded) {
          onDocumentAdded();
        }
      }
    } catch (error) {
      console.error("Error adding document:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Approved</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-1 text-red-600">
            <X className="h-4 w-4" />
            <span>Rejected</span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center gap-1 text-amber-600">
            <Clock className="h-4 w-4" />
            <span>Pending</span>
          </div>
        );
      case "expired":
        return (
          <div className="flex items-center gap-1 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span>Expired</span>
          </div>
        );
      default:
        return status;
    }
  };

  const isExpired = (expiryDate: string) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  const isExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return expiry > today && expiry <= thirtyDaysFromNow;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              Manage teacher documents and certifications
            </CardDescription>
          </div>
          {!readOnly && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Add Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Document</DialogTitle>
                  <DialogDescription>
                    Upload a new document for this teacher
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="document-name">Document Name</Label>
                    <Input
                      id="document-name"
                      placeholder="DBS Certificate"
                      value={newDocument.name}
                      onChange={(e) =>
                        setNewDocument({ ...newDocument, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="document-status">Status</Label>
                    <Select
                      value={newDocument.status}
                      onValueChange={(value) =>
                        setNewDocument({ ...newDocument, status: value })
                      }
                    >
                      <SelectTrigger id="document-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Expiry Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="document-file">Upload File</Label>
                    <Input id="document-file" type="file" />
                    <p className="text-sm text-muted-foreground">
                      Max file size: 5MB. Supported formats: PDF, JPG, PNG
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddDocument} disabled={isUploading}>
                    {isUploading ? "Uploading..." : "Upload Document"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Documents</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2">
              This teacher has no documents uploaded yet. Click the "Add Document" button to upload a new document.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>{getStatusBadge(doc.status)}</TableCell>
                  <TableCell>
                    <div
                      className={cn(
                        isExpired(doc.expiryDate) && "text-red-600",
                        isExpiringSoon(doc.expiryDate) && "text-amber-600"
                      )}
                    >
                      {doc.expiryDate ? format(new Date(doc.expiryDate), "PPP") : "No expiry date"}
                      {isExpired(doc.expiryDate) && (
                        <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-3 w-3" /> Expired
                        </p>
                      )}
                      {isExpiringSoon(doc.expiryDate) && !isExpired(doc.expiryDate) && (
                        <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" /> Expiring soon
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <Toaster />
    </Card>
  );
};

export default TeacherDocuments; 