import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { toastWriteResult } from "@/lib/persistence";
import { Loader2, Upload, FileText, Download, Trash2, Eye, Calendar } from "lucide-react";
import { format } from "date-fns";
import { schoolService } from "@/services/schoolService";

interface SchoolDocumentsProps {
  schoolId: string;
  documents?: Array<{
    name: string;
    type: string;
    uploadDate: string;
    url: string;
  }>;
  onDocumentAdded?: () => void;
  readOnly?: boolean;
}

const SchoolDocuments = ({
  schoolId,
  documents = [],
  onDocumentAdded,
  readOnly = false,
}: SchoolDocumentsProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newDocument, setNewDocument] = useState({
    name: "",
    type: "policy",
    url: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Auto-fill the name field with the file name (without extension)
      const fileName = selectedFile.name.split('.').slice(0, -1).join('.');
      setNewDocument({
        ...newDocument,
        name: fileName || selectedFile.name,
      });
    }
  };

  const handleAddDocument = async () => {
    if (!newDocument.name) {
      toast({
        title: "Error",
        description: "Please enter a document name",
        variant: "destructive",
      });
      return;
    }

    if (!file && !newDocument.url) {
      toast({
        title: "Error",
        description: "Please upload a file or provide a URL",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // In a real implementation, you would upload the file to a storage service
      // and get back a URL. For this mock, we'll just use a fake URL.
      const documentUrl = file 
        ? `https://example.com/uploads/${file.name}` 
        : newDocument.url;

      const documentToAdd = {
        name: newDocument.name,
        type: newDocument.type,
        url: documentUrl,
      };

      const result = await schoolService.addSchoolDocument(
        schoolId,
        documentToAdd
      );

      toastWriteResult("Document added", result);

      if (result.ok) {
        setNewDocument({
          name: "",
          type: "policy",
          url: "",
        });
        setFile(null);
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

  const getDocumentTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case "policy":
        return "Policy";
      case "handbook":
        return "Handbook";
      case "contract":
        return "Contract";
      case "report":
        return "Report";
      case "form":
        return "Form";
      case "certificate":
        return "Certificate";
      case "letter":
        return "Letter";
      default:
        return type;
    }
  };

  const handleViewDocument = (url: string) => {
    window.open(url, "_blank");
  };

  const handleDownloadDocument = (url: string, name: string) => {
    // In a real implementation, this would trigger a download
    // For now, just open the URL
    window.open(url, "_blank");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>School Documents</CardTitle>
          <CardDescription>
            Manage school policies, handbooks, and other documents
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
                  Upload a new document for this school
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="document-name">Document Name*</Label>
                  <Input
                    id="document-name"
                    placeholder="School Handbook"
                    value={newDocument.name}
                    onChange={(e) =>
                      setNewDocument({ ...newDocument, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="document-type">Document Type*</Label>
                  <Select
                    value={newDocument.type}
                    onValueChange={(value) =>
                      setNewDocument({ ...newDocument, type: value })
                    }
                  >
                    <SelectTrigger id="document-type">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="policy">Policy</SelectItem>
                      <SelectItem value="handbook">Handbook</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="form">Form</SelectItem>
                      <SelectItem value="certificate">Certificate</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="document-file">Upload File</Label>
                  <Input
                    id="document-file"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <p className="text-sm text-gray-500">
                    Or provide a URL to an existing document:
                  </p>
                  <Input
                    placeholder="https://example.com/document.pdf"
                    value={newDocument.url}
                    onChange={(e) =>
                      setNewDocument({ ...newDocument, url: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddDocument} disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Add Document"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {documents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      {doc.name}
                    </div>
                  </TableCell>
                  <TableCell>{getDocumentTypeLabel(doc.type)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDocument(doc.url)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc.url, doc.name)}
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            // In a real implementation, this would delete the document
                            toast({
                              title: "Not Implemented",
                              description: "Document deletion is not implemented in this demo",
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No documents have been added yet.</p>
            {!readOnly && (
              <p className="mt-2">
                Click "Add Document" to upload school policies, handbooks, or other documents.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SchoolDocuments; 