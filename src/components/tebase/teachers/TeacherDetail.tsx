import React from "react";
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
  GraduationCap,
  Briefcase,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { getContrastClass } from "@/lib/colorUtils";
import Notes from "../shared/Notes";

interface TeacherDetailProps {
  teacherId?: string;
  onBack?: () => void;
}

const TeacherDetail = ({
  teacherId = "t1",
  onBack = () => {},
}: TeacherDetailProps) => {
  // Mock teacher data
  const teacher = {
    id: teacherId,
    name: "John Smith",
    email: "john.smith@tebase.edu",
    phone: "+44 161 123 4567",
    address: "123 Teacher Lane, Manchester, M1 1AA",
    website: "https://www.johnsmith-education.com",
    subject: "Mathematics",
    specializations: ["Algebra", "Calculus", "Statistics"],
    qualifications: [
      {
        degree: "BSc Mathematics",
        institution: "University of Manchester",
        year: "2010",
      },
      {
        degree: "PGCE Secondary Education",
        institution: "University of Leeds",
        year: "2011",
      },
      {
        degree: "MSc Applied Mathematics",
        institution: "Imperial College London",
        year: "2015",
      },
    ],
    experience: [
      {
        role: "Mathematics Teacher",
        school: "Westfield High School",
        period: "2015-2020",
      },
      {
        role: "Head of Mathematics",
        school: "Oakridge Secondary School",
        period: "2020-2022",
      },
      {
        role: "Supply Teacher",
        school: "Various Schools",
        period: "2022-Present",
      },
    ],
    availability: [
      { day: "Monday", slots: ["Morning", "Afternoon"] },
      { day: "Tuesday", slots: ["Morning", "Afternoon"] },
      { day: "Wednesday", slots: ["Morning"] },
      { day: "Thursday", slots: ["Afternoon"] },
      { day: "Friday", slots: ["Morning", "Afternoon"] },
    ],
    preferredLocations: ["Manchester", "Liverpool", "Leeds"],
    rating: 4.8,
    reviews: 24,
    status: "available",
    notes:
      "Experienced mathematics teacher with a strong background in advanced topics. Prefers secondary schools and is available for last-minute bookings.",
    documents: [
      { name: "DBS Certificate", status: "Valid", expiryDate: "2024-05-15" },
      { name: "Teaching Qualification", status: "Valid", expiryDate: "N/A" },
      { name: "ID Verification", status: "Valid", expiryDate: "N/A" },
      { name: "Right to Work", status: "Valid", expiryDate: "N/A" },
    ],
  };

  return (
    <div className="w-full bg-gray-50 p-6 rounded-lg">
      {/* Header with back button */}
      <div className="mb-6 flex items-center">
        <Button variant="ghost" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teachers
        </Button>
      </div>

      {/* Teacher profile header */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{teacher.name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {teacher.specializations.map((specialization) => (
                <Badge
                  key={specialization}
                  variant="secondary"
                  className="text-xs"
                >
                  {specialization}
                </Badge>
              ))}
            </div>
            <p className="text-gray-600 mt-2">
              {teacher.subject} Teacher •{" "}
              {teacher.status === "available"
                ? "Available"
                : teacher.status === "partially"
                  ? "Partially Available"
                  : "Unavailable"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => window.open(`mailto:${teacher.email}`, "_blank")}
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => window.open(`tel:${teacher.phone}`, "_blank")}
            >
              <Phone className="h-4 w-4" />
              Call
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => window.open(teacher.website, "_blank")}
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
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Teacher Information Card */}
            <Card className="md:col-span-2 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  Teacher Information
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
                        <p className="text-gray-900">{teacher.address}</p>
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
                            href={`mailto:${teacher.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {teacher.email}
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
                            href={`tel:${teacher.phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {teacher.phone}
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
                            href={teacher.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {teacher.website}
                          </a>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Subject
                        </p>
                        <p className="text-gray-900">{teacher.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Preferred Locations
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {teacher.preferredLocations.map((location) => (
                            <Badge
                              key={location}
                              variant="outline"
                              className="text-xs"
                            >
                              {location}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teacher Metrics Card */}
            <Card className="md:col-span-1 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  Teacher Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Rating</p>
                    <div className="flex items-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {teacher.rating}
                      </p>
                      <div className="flex ml-2">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(teacher.rating) ? "text-yellow-400" : "text-gray-300"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-500">
                        ({teacher.reviews} reviews)
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      Experience
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {teacher.experience.length > 0
                        ? `${teacher.experience.length} years`
                        : "N/A"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div className="mt-1">
                      {teacher.status === "available" ? (
                        <Badge className="bg-green-100 text-green-800">
                          Available
                        </Badge>
                      ) : teacher.status === "partially" ? (
                        <Badge className="bg-amber-100 text-amber-800">
                          Partially Available
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          Unavailable
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teacher Notes */}
            <Card className="md:col-span-3 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{teacher.notes}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="qualifications">
          <div className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Education & Qualifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {teacher.qualifications.map((qualification, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <GraduationCap className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">
                          {qualification.degree}
                        </h3>
                        <p className="text-gray-600">
                          {qualification.institution}
                        </p>
                        <p className="text-sm text-gray-500">
                          Completed: {qualification.year}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Work Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {teacher.experience.map((exp, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{exp.role}</h3>
                        <p className="text-gray-600">{exp.school}</p>
                        <p className="text-sm text-gray-500">{exp.period}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Specializations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {teacher.specializations.map((specialization) => (
                    <Badge
                      key={specialization}
                      className="text-sm px-3 py-1 text-white"
                      style={{ backgroundColor: "#3b82f6" }}
                    >
                      {specialization}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="availability">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Weekly Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {teacher.availability.map((day) => (
                  <div key={day.day} className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-3">{day.day}</h3>
                    {day.slots.length > 0 ? (
                      <div className="space-y-2">
                        {day.slots.map((slot) => (
                          <div
                            key={slot}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>{slot}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">Not available</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="font-medium text-lg mb-3">
                  Preferred Locations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {teacher.preferredLocations.map((location) => (
                    <Badge
                      key={location}
                      variant="secondary"
                      className="text-sm px-3 py-1"
                    >
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Book This Teacher
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Verification Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teacher.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{doc.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              doc.status === "Valid"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {doc.status}
                          </Badge>
                          {doc.expiryDate !== "N/A" && (
                            <span className="text-sm text-gray-500">
                              Expires: {doc.expiryDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Document
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-lg mb-4">
                      Required Documents
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">DBS Certificate</h3>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-800">
                                Valid
                              </Badge>
                              <span className="text-sm text-gray-500">
                                Expires: 2024-05-15
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>

                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Right to Work</h3>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-800">
                                Valid
                              </Badge>
                              <span className="text-sm text-gray-500">
                                No expiry
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>

                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">ID Verification</h3>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-800">
                                Valid
                              </Badge>
                              <span className="text-sm text-gray-500">
                                No expiry
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg mb-4">
                      Training & Certifications
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">
                              Safeguarding Training
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-800">
                                Completed
                              </Badge>
                              <span className="text-sm text-gray-500">
                                Expires: 2024-01-15
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Certificate
                        </Button>
                      </div>

                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">First Aid Training</h3>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-amber-100 text-amber-800">
                                Expiring Soon
                              </Badge>
                              <span className="text-sm text-gray-500">
                                Expires: 2023-08-30
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Certificate
                        </Button>
                      </div>

                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <XCircle className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">
                              Data Protection Training
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-red-100 text-red-800">
                                Not Completed
                              </Badge>
                              <span className="text-sm text-gray-500">
                                Required
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button>Complete Training</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-4">
                    Compliance Summary
                  </h3>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                        <span className="font-medium">
                          Overall Compliance Status
                        </span>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800">
                        Action Required
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">
                            Document Compliance
                          </span>
                          <span className="text-sm font-medium">100%</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">
                            Training Compliance
                          </span>
                          <span className="text-sm font-medium">67%</span>
                        </div>
                        <Progress value={67} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">
                            Overall Compliance
                          </span>
                          <span className="text-sm font-medium">83%</span>
                        </div>
                        <Progress value={83} className="h-2" />
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-amber-50 rounded-md">
                      <p className="text-sm text-amber-800">
                        Action required: Complete Data Protection Training to
                        achieve full compliance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <div className="space-y-6">
            <Notes entityId={teacher.id} entityType="teacher" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherDetail;
