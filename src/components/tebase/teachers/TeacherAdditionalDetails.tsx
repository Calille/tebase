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
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { toastDemoAction, toastWriteResult } from "@/lib/persistence";
import { Toaster } from "@/components/ui/toaster";
import { CalendarIcon, Loader2, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { teacherService } from "@/services/teacherService";

// Define the form schema with Zod
const additionalDetailsSchema = z.object({
  // Background check
  backgroundCheckStatus: z.enum(["pending", "approved", "rejected", "expired"], {
    required_error: "Background check status is required",
  }),
  backgroundCheckDate: z.date().optional().nullable(),
  backgroundCheckReference: z.string().optional(),
  
  // References
  references: z.array(
    z.object({
      name: z.string().min(2, { message: "Name is required" }),
      position: z.string().min(2, { message: "Position is required" }),
      company: z.string().min(2, { message: "Company is required" }),
      email: z.string().email({ message: "Please enter a valid email address" }),
      phone: z.string().optional(),
      relationship: z.string().min(2, { message: "Relationship is required" }),
    })
  ),
  
  // Languages
  languages: z.string().min(2, { message: "At least one language is required" }),
  
  // Special skills
  specialSkills: z.string().optional(),
  
  // Accommodation requirements
  accommodationRequired: z.boolean().default(false),
  accommodationDetails: z.string().optional(),
  
  // Admin notes
  adminNotes: z.string().optional(),
});

type AdditionalDetailsValues = z.infer<typeof additionalDetailsSchema>;

interface TeacherAdditionalDetailsProps {
  teacherId?: string;
  initialData?: any;
  onSave?: (data: any) => void;
  readOnly?: boolean;
}

const TeacherAdditionalDetails = ({
  teacherId,
  initialData,
  onSave,
  readOnly = false,
}: TeacherAdditionalDetailsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form with default values or initial data
  const form = useForm<AdditionalDetailsValues>({
    resolver: zodResolver(additionalDetailsSchema),
    defaultValues: {
      backgroundCheckStatus: initialData?.backgroundCheckStatus || "pending",
      backgroundCheckDate: initialData?.backgroundCheckDate ? new Date(initialData.backgroundCheckDate) : null,
      backgroundCheckReference: initialData?.backgroundCheckReference || "",
      
      references: initialData?.references || [
        { name: "", position: "", company: "", email: "", phone: "", relationship: "" },
      ],
      
      languages: initialData?.languages?.join(", ") || "",
      specialSkills: initialData?.specialSkills || "",
      
      accommodationRequired: initialData?.accommodationRequired || false,
      accommodationDetails: initialData?.accommodationDetails || "",
      
      adminNotes: initialData?.adminNotes || "",
    },
  });

  // Set up field array for references
  const {
    fields: referenceFields,
    append: appendReference,
    remove: removeReference,
  } = useFieldArray({
    control: form.control,
    name: "references",
  });

  // Watch accommodation required to conditionally show details field
  const accommodationRequired = form.watch("accommodationRequired");

  // Handle form submission
  const onSubmit = async (data: AdditionalDetailsValues) => {
    if (readOnly) return;
    
    setIsSubmitting(true);
    
    try {
      // Format the data for the API
      const formattedData = {
        // Background check
        t_background_check_status: data.backgroundCheckStatus,
        t_background_check_date: data.backgroundCheckDate ? format(data.backgroundCheckDate, "yyyy-MM-dd") : null,
        t_background_check_reference: data.backgroundCheckReference,
        
        // References
        t_references: data.references,
        
        // Languages
        languages: data.languages.split(",").map(lang => lang.trim()),
        
        // Special skills
        t_special_skills: data.specialSkills,
        
        // Accommodation
        t_accommodation_required: data.accommodationRequired,
        t_accommodation_details: data.accommodationDetails,
        
        // Admin notes
        notes: data.adminNotes,
      };
      
      if (teacherId) {
        const result = await teacherService.updateTeacher(teacherId, formattedData);
        toastWriteResult("Additional details updated", result);
        if (result.ok && onSave) {
          onSave(formattedData);
        }
      } else if (onSave) {
        onSave(formattedData);
        toastDemoAction("Additional details saved");
      }
    } catch (error) {
      console.error("Error saving additional details:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Additional Details</CardTitle>
        <CardDescription>
          Manage background checks, references, and other important details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Background Check */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Background Check</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="backgroundCheckStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={readOnly}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="backgroundCheckDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
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
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Date of the background check
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="backgroundCheckReference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="DBS123456789"
                          {...field}
                          readOnly={readOnly}
                        />
                      </FormControl>
                      <FormDescription>
                        DBS or other reference number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* References */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">References</h3>
                {!readOnly && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendReference({
                        name: "",
                        position: "",
                        company: "",
                        email: "",
                        phone: "",
                        relationship: "",
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Reference
                  </Button>
                )}
              </div>
              
              {referenceFields.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No references added yet.
                </p>
              )}
              
              {referenceFields.map((field, index) => (
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
                      onClick={() => removeReference(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`references.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Jane Smith"
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
                      name={`references.${index}.relationship`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Former Manager"
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
                      name={`references.${index}.position`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Head Teacher"
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
                      name={`references.${index}.company`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company/School*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Oakridge Secondary School"
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
                      name={`references.${index}.email`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="jane.smith@example.com"
                              type="email"
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
                      name={`references.${index}.phone`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+44 20 1234 5678"
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

            {/* Languages */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Languages</h3>
              
              <FormField
                control={form.control}
                name="languages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Languages Spoken*</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="English, French, Spanish"
                        {...field}
                        readOnly={readOnly}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter languages separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Special Skills */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Special Skills</h3>
              
              <FormField
                control={form.control}
                name="specialSkills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Skills or Qualifications</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special skills or qualifications..."
                        className="min-h-[100px]"
                        {...field}
                        readOnly={readOnly}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: List any special skills or qualifications
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Accommodation Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Accommodation Requirements</h3>
              
              <FormField
                control={form.control}
                name="accommodationRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={readOnly}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Accommodation Required
                      </FormLabel>
                      <FormDescription>
                        Check if the teacher requires accommodation
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              {accommodationRequired && (
                <FormField
                  control={form.control}
                  name="accommodationDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accommodation Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Details about accommodation requirements..."
                          className="min-h-[100px]"
                          {...field}
                          readOnly={readOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Admin Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Administrative Notes</h3>
              
              <FormField
                control={form.control}
                name="adminNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Administrative notes about this teacher..."
                        className="min-h-[150px]"
                        {...field}
                        readOnly={readOnly}
                      />
                    </FormControl>
                    <FormDescription>
                      Internal notes for administrative use only
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    "Save Additional Details"
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

export default TeacherAdditionalDetails; 