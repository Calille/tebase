import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  CardFooter,
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
import { toast } from "@/components/ui/use-toast";
import { toastDemoAction, toastWriteResult } from "@/lib/persistence";
import { Toaster } from "@/components/ui/toaster";
import { CalendarIcon, Loader2, Upload, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { teacherService } from "@/services/teacherService";

// Define the form schema with Zod
const personalInfoSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  middleName: z.string().optional(),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  gender: z.string({
    required_error: "Please select a gender",
  }),
  // Address fields
  addressStreet: z.string().min(5, { message: "Street address is required" }),
  addressCity: z.string().min(2, { message: "City is required" }),
  addressState: z.string().min(2, { message: "State/County is required" }),
  addressZip: z.string().min(2, { message: "Postal/Zip code is required" }),
  addressCountry: z.string().min(2, { message: "Country is required" }),
  // Contact information
  primaryPhone: z.string().min(10, { message: "Primary phone number is required" }),
  secondaryPhone: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address" }),
  // Emergency contact
  emergencyContactName: z.string().min(2, { message: "Emergency contact name is required" }),
  emergencyContactRelationship: z.string().min(2, { message: "Relationship is required" }),
  emergencyContactPhone: z.string().min(10, { message: "Emergency contact phone is required" }),
  emergencyContactEmail: z.string().email({ message: "Please enter a valid email address" }).optional(),
});

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;

interface TeacherPersonalInfoProps {
  teacherId?: string;
  initialData?: any;
  onSave?: (data: any) => void;
  readOnly?: boolean;
}

const TeacherPersonalInfo = ({
  teacherId,
  initialData,
  onSave,
  readOnly = false,
}: TeacherPersonalInfoProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(initialData?.profileImageUrl || null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Initialize the form with default values or initial data
  const form = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      middleName: initialData?.middleName || "",
      lastName: initialData?.lastName || "",
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth) : undefined,
      gender: initialData?.gender || "",
      addressStreet: initialData?.address?.street || "",
      addressCity: initialData?.address?.city || "",
      addressState: initialData?.address?.state || "",
      addressZip: initialData?.address?.zip || "",
      addressCountry: initialData?.address?.country || "United Kingdom",
      primaryPhone: initialData?.phone || "",
      secondaryPhone: initialData?.secondaryPhone || "",
      email: initialData?.email || "",
      emergencyContactName: initialData?.emergencyContact?.name || "",
      emergencyContactRelationship: initialData?.emergencyContact?.relationship || "",
      emergencyContactPhone: initialData?.emergencyContact?.phone || "",
      emergencyContactEmail: initialData?.emergencyContact?.email || "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: PersonalInfoValues) => {
    if (readOnly) return;
    
    setIsSubmitting(true);
    
    try {
      // Format the data for the API
      const formattedData = {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        dateOfBirth: format(data.dateOfBirth, "yyyy-MM-dd"),
        gender: data.gender,
        // Convert address object to string format as expected by the API
        address: `${data.addressStreet}, ${data.addressCity}, ${data.addressState}, ${data.addressZip}, ${data.addressCountry}`,
        // Store the structured address in t_address field for better data structure
        t_address: {
          street: data.addressStreet,
          city: data.addressCity,
          state: data.addressState,
          zip: data.addressZip,
          country: data.addressCountry,
        },
        phone: data.primaryPhone,
        secondaryPhone: data.secondaryPhone,
        email: data.email,
        // Store emergency contact in t_emergency_contact field
        t_emergency_contact: {
          name: data.emergencyContactName,
          relationship: data.emergencyContactRelationship,
          phone: data.emergencyContactPhone,
          email: data.emergencyContactEmail,
        },
      };
      
      // Handle profile image upload if there's a new image
      if (imageFile) {
        toastDemoAction(
          "Profile image selected",
          "File upload is not connected yet. The filename is kept in this session only."
        );
      }
      
      if (teacherId) {
        const result = await teacherService.updateTeacher(teacherId, formattedData);
        toastWriteResult("Personal information updated", result);
        if (result.ok && onSave) {
          onSave(formattedData);
        }
      } else if (onSave) {
        onSave(formattedData);
        toastDemoAction("Personal information saved");
      }
    } catch (error) {
      console.error("Error saving personal information:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle profile image change
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Store the file for later upload
    setImageFile(file);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Manage the teacher's personal details and contact information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border flex items-center justify-center">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                {!readOnly && (
                  <label
                    htmlFor="profile-image"
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer shadow-md"
                  >
                    <Upload className="w-4 h-4" />
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a profile photo (max 5MB)
              </p>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} readOnly={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="middleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Robert" {...field} readOnly={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Smith" {...field} readOnly={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date of Birth and Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth*</FormLabel>
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
                          disabled={(date) =>
                            date > new Date() || date < new Date("1940-01-01")
                          }
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
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={readOnly}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Address</h3>
              
              <FormField
                control={form.control}
                name="addressStreet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address*</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Teacher Lane" {...field} readOnly={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="addressCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City*</FormLabel>
                      <FormControl>
                        <Input placeholder="London" {...field} readOnly={readOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="addressState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>County/State*</FormLabel>
                      <FormControl>
                        <Input placeholder="Greater London" {...field} readOnly={readOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="addressZip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal/Zip Code*</FormLabel>
                      <FormControl>
                        <Input placeholder="SW1A 1AA" {...field} readOnly={readOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="addressCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={readOnly}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="Ireland">Ireland</SelectItem>
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                          <SelectItem value="New Zealand">New Zealand</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primaryPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Phone*</FormLabel>
                      <FormControl>
                        <Input placeholder="+44 20 1234 5678" {...field} readOnly={readOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="secondaryPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+44 20 8765 4321" {...field} readOnly={readOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address*</FormLabel>
                    <FormControl>
                      <Input placeholder="john.smith@example.com" type="email" {...field} readOnly={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Emergency Contact</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emergencyContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Smith" {...field} readOnly={readOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="emergencyContactRelationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship*</FormLabel>
                      <FormControl>
                        <Input placeholder="Spouse" {...field} readOnly={readOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emergencyContactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone*</FormLabel>
                      <FormControl>
                        <Input placeholder="+44 20 1234 5678" {...field} readOnly={readOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="emergencyContactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input placeholder="jane.smith@example.com" type="email" {...field} readOnly={readOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                    "Save Personal Information"
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

export default TeacherPersonalInfo; 