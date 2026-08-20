import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { schoolService, School } from "@/services/schoolService";
import DemoBanner from "@/components/tebase/shared/DemoBanner";
import { toastDemoAction, toastWriteResult } from "@/lib/persistence";

// Import all school information components
import SchoolBasicInfo from "./SchoolBasicInfo";
import SchoolPrimaryContact from "./SchoolPrimaryContact";
import SchoolSecondaryContact from "./SchoolSecondaryContact";
import SchoolFinanceContact from "./SchoolFinanceContact";
import SchoolSendcoContact from "./SchoolSendcoContact";
import SchoolHeadteacherContact from "./SchoolHeadteacherContact";
import SchoolAdditionalInfo from "./SchoolAdditionalInfo";
import SchoolDocuments from "./SchoolDocuments";

export interface SchoolProfileProps {
  schoolId?: string;
  onBack: () => void;
  onSave: (data: School) => void;
}

interface DocumentType {
  name: string;
  type: string;
  uploadDate: string;
  url: string;
}

const SchoolProfile: React.FC<SchoolProfileProps> = ({ schoolId, onBack, onSave }) => {
  const [activeTab, setActiveTab] = useState("basic-info");
  const [loading, setLoading] = useState(!!schoolId);
  const [saving, setSaving] = useState(false);
  const [schoolData, setSchoolData] = useState<School | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchoolData = async () => {
      if (!schoolId) {
        setLoading(false);
        return;
      }

      try {
        const data = await schoolService.getSchoolById(schoolId);
        if (data) {
          setSchoolData(data);
        } else {
          setError("School not found");
        }
      } catch (err) {
        console.error("Error fetching school data:", err);
        setError("Failed to load school data");
        toast({
          title: "Error",
          description: "Failed to load school data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolData();
  }, [schoolId]);

  const handleSectionSave = (section: string, data: Partial<School>) => {
    setSchoolData((prev) => (prev ? { ...prev, [section]: data } : prev));
    toastDemoAction(`${section} section saved`);
  };

  const handleSaveAll = async () => {
    if (!schoolData) return;
    setSaving(true);
    try {
      if (schoolId) {
        const result = await schoolService.updateSchool(schoolId, schoolData);
        toastWriteResult("School information saved", result);
        if (result.ok) {
          onSave(schoolData);
        }
      } else {
        onSave(schoolData);
        toastDemoAction("School information saved");
      }
    } catch (err) {
      console.error("Error saving school data:", err);
      toast({
        title: "Error",
        description: "Failed to save school information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle document added
  const handleDocumentAdded = () => {
    // Refresh school data if we have a school ID
    if (schoolId) {
      schoolService.getSchoolById(schoolId).then(data => {
        if (data) {
          setSchoolData(data);
        }
      }).catch(err => {
        console.error("Error refreshing school data:", err);
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-lg">Loading school profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <DemoBanner />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {schoolId ? `Edit School: ${schoolData?.name || ""}` : "Add New School"}
          </h1>
        </div>
        <Button onClick={handleSaveAll} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save All
        </Button>
      </div>

      {error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-4">
              <p className="text-destructive">{error}</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-4">
            <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
            <TabsTrigger value="primary-contact">Primary Contact</TabsTrigger>
            <TabsTrigger value="secondary-contact">Secondary Contact</TabsTrigger>
            <TabsTrigger value="finance-contact">Finance Contact</TabsTrigger>
            <TabsTrigger value="sendco-contact">SENDCO Contact</TabsTrigger>
            <TabsTrigger value="headteacher-contact">Headteacher</TabsTrigger>
            <TabsTrigger value="additional-info">Additional Info</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <Card>
            <CardContent className="pt-6">
              <TabsContent value="basic-info">
                <SchoolBasicInfo 
                  initialData={schoolData} 
                  onSave={(data) => handleSectionSave("basicInfo", data)} 
                />
              </TabsContent>
              
              <TabsContent value="primary-contact">
                <SchoolPrimaryContact 
                  initialData={schoolData?.primaryContact} 
                  onSave={(data) => handleSectionSave("primaryContact", data)} 
                />
              </TabsContent>
              
              <TabsContent value="secondary-contact">
                <SchoolSecondaryContact 
                  initialData={schoolData?.secondaryContact} 
                  onSave={(data) => handleSectionSave("secondaryContact", data)} 
                />
              </TabsContent>
              
              <TabsContent value="finance-contact">
                <SchoolFinanceContact 
                  initialData={schoolData?.financeContact} 
                  onSave={(data) => handleSectionSave("financeContact", data)} 
                />
              </TabsContent>
              
              <TabsContent value="sendco-contact">
                <SchoolSendcoContact 
                  initialData={schoolData?.sendcoContact} 
                  onSave={(data) => handleSectionSave("sendcoContact", data)} 
                />
              </TabsContent>
              
              <TabsContent value="headteacher-contact">
                <SchoolHeadteacherContact 
                  initialData={schoolData?.headteacherContact} 
                  onSave={(data) => handleSectionSave("headteacherContact", data)} 
                />
              </TabsContent>
              
              <TabsContent value="additional-info">
                <SchoolAdditionalInfo 
                  initialData={schoolData} 
                  onSave={(data) => handleSectionSave("additionalInfo", data)} 
                />
              </TabsContent>
              
              <TabsContent value="documents">
                <SchoolDocuments 
                  schoolId={schoolId || "new"} 
                  documents={schoolData?.documents} 
                  onDocumentAdded={handleDocumentAdded}
                />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      )}
    </div>
  );
};

export default SchoolProfile; 