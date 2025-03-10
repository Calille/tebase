import React, { useState } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { CalendarIcon, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { teacherService } from "@/services/teacherService";

// Define the form schema with Zod
const professionalInfoSchema = z.object({
  // Education background
  education: z.array(
    z.object({
      degree: z.string().min(2, { message: "Degree is required" }),
      institution: z.string().min(2, { message: "Institution is required" }),
      field: z.string().min(2, { message: "Field of study is required" }),
      startYear: z.string().min(4, { message: "Start year is required" }),
      endYear: z.string().min(4, { message: "End year is required" }),
      grade: z.string().optional(),
    })
  ).min(1, { message: "At least one education entry is required" }),
  
  // Teaching certifications
  certifications: z.array(
    z.object({
      name: z.string().min(2, { message: "Certification name is required" }),
      issuingAuthority: z.string().min(2, { message: "Issuing authority is required" }),
      issueDate: z.date({ required_error: "Issue date is required" }),
      expiryDate: z.date().optional().nullable(),
      certificateNumber: z.string().optional(),
    })
  ),
  
  // Subject specializations
  subjects: z.string().min(2, { message: "At least one subject is required" }),
  
  // Grade levels
  gradeLevels: z.array(z.string()).min(1, { message: "At least one grade level is required" }),
  
  // Years of experience
  yearsOfExperience: z.number().min(0, { message: "Years of experience must be a positive number" }),
  
  // Resume/CV
  hasResume: z.boolean().default(false),
});

type ProfessionalInfoValues = z.infer<typeof professionalInfoSchema>;

interface TeacherProfessionalInfoProps {
  teacherId?: string;
  initialData?: any;
  onSave?: (data: any) => void;
  readOnly?: boolean;
}

const TeacherProfessionalInfo = ({
  teacherId,
  initialData,
  onSave,
  readOnly = false,
}: TeacherProfessionalInfoProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(
    initialData?.resumeFileName || null
  );

  // Initialize the form with default values or initial data
  const form = useForm<ProfessionalInfoValues>({
    resolver: zodResolver(professionalInfoSchema),
    defaultValues: {
      education: initialData?.educationHistory || [
        { degree: "", institution: "", field: "", startYear: "", endYear: "", grade: "" },
      ],
      certifications: initialData?.certifications?.map((cert: any) => ({
        name: cert.name || "",
        issuingAuthority: cert.issuingAuthority || "",
        issueDate: cert.issueDate ? new Date(cert.issueDate) : undefined,
        expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
        certificateNumber: cert.certificateNumber || "",
      })) || [],
      subjects: initialData?.subjects?.join(", ") || "",
      gradeLevels: initialData?.gradeLevels || [],
      yearsOfExperience: initialData?.yearsOfExperience || 0,
      hasResume: initialData?.hasResume || false,
    },
  });

  // Set up field arrays for education and certifications
  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({
    control: form.control,
    name: "certifications",
  });

  // Handle form submission
  const onSubmit = async (data: ProfessionalInfoValues) => {
    if (readOnly) return;
    
    setIsSubmitting(true);
    
    try {
      // Format the data for the API
      const formattedData = {
        // Convert education array to the format expected by the API
        t_education_history: data.education.map(edu => ({
          institution: edu.institution,
          degree: edu.degree,
          field: edu.field,
          startYear: edu.startYear,
          endYear: edu.endYear,
          grade: edu.grade || "",
        })),
        
        // Convert certifications array to the format expected by the API
        t_certifications: data.certifications.map(cert => ({
          name: cert.name,
          issuingAuthority: cert.issuingAuthority,
          issueDate: cert.issueDate ? format(cert.issueDate, "yyyy-MM-dd") : "",
          expiryDate: cert.expiryDate ? format(cert.expiryDate, "yyyy-MM-dd") : "",
          certificateNumber: cert.certificateNumber || "",
        })),
        
        // Convert subjects string to array
        subjects: data.subjects.split(",").map(s => s.trim()),
        
        // Pass grade levels as is
        t_grade_levels: data.gradeLevels,
        
        // Pass years of experience as is
        t_years_of_experience: data.yearsOfExperience,
        
        // Handle resume file
        t_has_resume: data.hasResume || (resumeFile !== null),
        t_resume_file_name: resumeFileName,
      };
      
      // Handle resume file upload if there's a new file
      if (resumeFile) {
        // In a real implementation, you would upload the file to a storage service
        // and get back a URL to store in the database
        console.log("Uploading resume file:", resumeFile.name);
        // formattedData.t_resume_url = "https://example.com/uploaded-resume.pdf";
      }
      
      // If there's a teacherId, update the existing teacher
      if (teacherId) {
        const success = await teacherService.updateTeacher(teacherId, formattedData);
        
        if (success) {
          toast({
            title: "Success",
            description: "Professional information updated successfully",
          });
          
          if (onSave) {
            onSave(formattedData);
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to update professional information",
            variant: "destructive",
          });
        }
      } else {
        // If there's no teacherId, this is a new teacher
        if (onSave) {
          onSave(formattedData);
        }
        
        toast({
          title: "Success",
          description: "Professional information saved",
        });
      }
    } catch (error) {
      console.error("Error saving professional information:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle resume file change
  const handleResumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size should be less than 10MB",
        variant: "destructive",
      });
      return;
    }
    
    // Check file type
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please upload a PDF or Word document",
        variant: "destructive",
      });
      return;
    }
    
    // Store the file for later upload
    setResumeFile(file);
    setResumeFileName(file.name);
    form.setValue("hasResume", true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Professional Information</CardTitle>
        <CardDescription>
          Manage the teacher's professional qualifications and experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Education Background */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Education Background</h3>
                {!readOnly && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendEducation({
                        degree: "",
                        institution: "",
                        field: "",
                        startYear: "",
                        endYear: "",
                        grade: "",
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Education
                  </Button>
                )}
              </div>
              
              {educationFields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border rounded-md space-y-4 relative"
                >
                  {!readOnly && educationFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                      onClick={() => removeEducation(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`education.${index}.degree`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Degree/Qualification*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="BSc, PGCE, etc."
                              {...field}
                              readOnly={readOnly}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`education.${index}.institution`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institution*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="University of Cambridge"
                              {...field}
                              readOnly={readOnly}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`education.${index}.field`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field of Study*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Mathematics, Education, etc."
                            {...field}
                            readOnly={readOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`education.${index}.startYear`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Year*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="2010"
                              {...field}
                              readOnly={readOnly}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`education.${index}.endYear`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Year*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="2014"
                              {...field}
                              readOnly={readOnly}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`education.${index}.grade`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade/Result</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="First Class, 2:1, etc."
                              {...field}
                              readOnly={readOnly}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Teaching Certifications */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Teaching Certifications</h3>
                {!readOnly && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendCertification({
                        name: "",
                        issuingAuthority: "",
                        issueDate: undefined,
                        expiryDate: null,
                        certificateNumber: "",
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Certification
                  </Button>
                )}
              </div>
              
              {certificationFields.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No certifications added yet.
                </p>
              )}
              
              {certificationFields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border rounded-md space-y-4 relative"
                >
                  {!readOnly && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                      onClick={() => removeCertification(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`certifications.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certification Name*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="QTS, TEFL, etc."
                              {...field}
                              readOnly={readOnly}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`certifications.${index}.issuingAuthority`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issuing Authority*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Department for Education"
                              {...field}
                              readOnly={readOnly}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`certifications.${index}.issueDate`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Issue Date*</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  disabled={readOnly}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`certifications.${index}.expiryDate`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Expiry Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  disabled={readOnly}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>No expiry date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Leave blank if the certification does not expire
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`certifications.${index}.certificateNumber`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Certificate Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="12345678"
                            {...field}
                            readOnly={readOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            {/* Subject Specializations */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Subject Specializations</h3>
              <FormField
                control={form.control}
                name="subjects"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subjects*</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Mathematics, Physics, Chemistry"
                        {...field}
                        readOnly={readOnly}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter subjects separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Grade Levels */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Grade Levels</h3>
              <FormField
                control={form.control}
                name="gradeLevels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade Levels Qualified to Teach*</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          const currentValues = field.value || [];
                          if (currentValues.includes(value)) {
                            field.onChange(
                              currentValues.filter((v) => v !== value)
                            );
                          } else {
                            field.onChange([...currentValues, value]);
                          }
                        }}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">Primary (KS1-KS2)</SelectItem>
                          <SelectItem value="secondary">Secondary (KS3-KS4)</SelectItem>
                          <SelectItem value="gcse">GCSE</SelectItem>
                          <SelectItem value="a-level">A-Level</SelectItem>
                          <SelectItem value="higher-education">Higher Education</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Selected: {field.value?.join(", ") || "None"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Years of Experience */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Experience</h3>
              <FormField
                control={form.control}
                name="yearsOfExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Teaching Experience</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        readOnly={readOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Resume/CV Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Resume/CV</h3>
              {!readOnly && (
                <div className="space-y-2">
                  <Label htmlFor="resume-upload">Upload Resume/CV</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeChange}
                      className="max-w-md"
                    />
                    {resumeFileName && (
                      <p className="text-sm text-muted-foreground">
                        Current file: {resumeFileName}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Accepted formats: PDF, DOC, DOCX (max 10MB)
                  </p>
                </div>
              )}
              
              {readOnly && resumeFileName && (
                <div className="p-4 border rounded-md">
                  <p className="font-medium">Resume/CV: {resumeFileName}</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Download Resume
                  </Button>
                </div>
              )}
            </div>

            {!readOnly && (
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Professional Information"
                  )}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      <Toaster />
    </Card>
  );
};

export default TeacherProfessionalInfo; 