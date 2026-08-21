import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Globe,
  Users,
  BookOpen,
  Calendar,
  FileText,
  Edit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Notes from "../shared/Notes";
import { schoolService } from "@/services/schoolService";
import { extrasService } from "@/services/extrasService";

interface SchoolDetailProps {
  schoolId?: string;
  onBack?: () => void;
}

const SchoolDetail = ({
  schoolId = "sch-westfield",
  onBack = () => {},
}: SchoolDetailProps) => {
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState<{
    id: string;
    name: string;
    address: string;
    city: string;
    contactPerson: string;
    email: string;
    phone: string;
    website: string;
    type: string;
    status: string;
    enrollmentCount: number;
    staffCount: number;
    establishedYear: string;
    lastBooking: string;
    nextBooking: string;
    teachersNeeded: number;
    rating: number;
    notes: string;
    tags: string[];
    departments: { name: string; head: string; teachers: number }[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const row = await schoolService.getSchoolById(schoolId);
      const vacancies = await extrasService.getVacancies();
      if (cancelled) return;
      if (!row) {
        setSchool(null);
        setLoading(false);
        return;
      }
      const needed = vacancies.filter((item) => item.schoolId === row.id && item.status === "open").length;
      setSchool({
        id: row.id,
        name: row.name,
        address: `${row.address.street}, ${row.address.city}, ${row.address.zip}`,
        city: row.address.city,
        contactPerson: row.primaryContact.name,
        email: row.primaryContact.email,
        phone: row.phone,
        website: row.website,
        type: row.type,
        status: "active",
        enrollmentCount: row.numberOfStudents,
        staffCount: Math.max(8, Math.round(row.numberOfStudents / 18)),
        establishedYear: String(row.yearEstablished),
        lastBooking: row.primaryContact.lastContactDate,
        nextBooking: row.historicalPlacementNotes || "See bookings tab",
        teachersNeeded: needed,
        rating: 4.6,
        notes: row.administrativeNotes || row.substituteRequirements,
        tags: [row.type, row.district, ...(row.specialPrograms ?? [])].filter(Boolean),
        departments: (row.gradeLevels ?? []).slice(0, 5).map((level, index) => ({
          name: level,
          head: row.headteacherContact.name,
          teachers: 3 + (index % 4),
        })),
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [schoolId]);

  if (loading) {
    return (
      <div className="w-full bg-gray-50 p-6 rounded-lg">
        <p className="text-gray-500">Loading school…</p>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="w-full bg-gray-50 p-6 rounded-lg">
        <Button variant="ghost" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Schools
        </Button>
        <p className="mt-6 text-gray-500">School not found in the seed dataset.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 p-6 rounded-lg">
      {/* Header with back button */}
      <div className="mb-6 flex items-center">
        <Button variant="ghost" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Schools
        </Button>
      </div>

      {/* School profile header */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{school.name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {school.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="text-gray-600 mt-2">
              {school.type.charAt(0).toUpperCase() + school.type.slice(1)}{" "}
              School • Established {school.establishedYear}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => window.open(`mailto:${school.email}`, "_blank")}
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => window.open(`tel:${school.phone}`, "_blank")}
            >
              <Phone className="h-4 w-4" />
              Call
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => window.open(school.website, "_blank")}
            >
              <Globe className="h-4 w-4" />
              Website
            </Button>
            <Button size="sm" className="flex items-center gap-1">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* School Information Card */}
            <Card className="md:col-span-2 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  School Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Address
                        </p>
                        <p className="text-gray-900">{school.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Email
                        </p>
                        <p className="text-gray-900">
                          <a
                            href={`mailto:${school.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {school.email}
                          </a>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Phone
                        </p>
                        <p className="text-gray-900">
                          <a
                            href={`tel:${school.phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {school.phone}
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Website
                        </p>
                        <p className="text-gray-900">
                          <a
                            href={school.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {school.website}
                          </a>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Contact Person
                        </p>
                        <p className="text-gray-900">{school.contactPerson}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Next Booking
                        </p>
                        <p className="text-gray-900">{school.nextBooking}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* School Metrics Card */}
            <Card className="md:col-span-1 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  School Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      Enrollment
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {school.enrollmentCount} students
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Staff</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {school.staffCount} members
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      Teachers Needed
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {school.teachersNeeded}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Rating</p>
                    <div className="flex items-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {school.rating}
                      </p>
                      <div className="flex ml-2">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(school.rating) ? "text-yellow-400" : "text-gray-300"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* School Notes */}
            <Card className="md:col-span-3 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{school.notes}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>School Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {school.departments.map((dept) => (
                  <div key={dept.name} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg">
                      {dept.name} Department
                    </h3>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>
                        <span className="text-gray-500">Department Head:</span>{" "}
                        {dept.head}
                      </p>
                      <p>
                        <span className="text-gray-500">Teachers:</span>{" "}
                        {dept.teachers}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Recent & Upcoming Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">
                  Booking history will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <div className="space-y-6">
            <Notes entityId={school.id} entityType="school" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchoolDetail;
