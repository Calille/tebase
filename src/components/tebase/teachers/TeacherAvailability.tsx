import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import { teacherService } from "@/services/teacherService";

// Define the form schema with Zod
const availabilitySchema = z.object({
  // Working hours/days
  availability: z.enum(["full-time", "part-time", "weekends"], {
    required_error: "Availability is required",
  }),
  
  // Weekday availability
  monday: z.array(z.string()).optional(),
  tuesday: z.array(z.string()).optional(),
  wednesday: z.array(z.string()).optional(),
  thursday: z.array(z.string()).optional(),
  friday: z.array(z.string()).optional(),
  saturday: z.array(z.string()).optional(),
  sunday: z.array(z.string()).optional(),
  
  // Preferred locations
  preferredLocations: z.string().min(2, { message: "At least one preferred location is required" }),
  
  // Maximum travel distance
  maxTravelDistance: z.number().min(0, { message: "Travel distance must be a positive number" }),
  travelDistanceUnit: z.enum(["miles", "kilometers"], {
    required_error: "Distance unit is required",
  }),
  
  // Notice period
  noticePeriod: z.number().min(0, { message: "Notice period must be a positive number" }),
  noticePeriodUnit: z.enum(["hours", "days", "weeks"], {
    required_error: "Notice period unit is required",
  }),
  
  // Additional notes
  availabilityNotes: z.string().optional(),
});

type AvailabilityValues = z.infer<typeof availabilitySchema>;

interface TeacherAvailabilityProps {
  teacherId?: string;
  initialData?: any;
  onSave?: (data: any) => void;
  readOnly?: boolean;
}

const TeacherAvailability = ({
  teacherId,
  initialData,
  onSave,
  readOnly = false,
}: TeacherAvailabilityProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Time slots for each day
  const timeSlots = [
    "morning",
    "afternoon",
    "evening",
  ];

  // Helper function to convert availability schedule to form values
  const getInitialAvailability = () => {
    const schedule = initialData?.availabilitySchedule || {};
    return {
      monday: schedule.monday || [],
      tuesday: schedule.tuesday || [],
      wednesday: schedule.wednesday || [],
      thursday: schedule.thursday || [],
      friday: schedule.friday || [],
      saturday: schedule.saturday || [],
      sunday: schedule.sunday || [],
    };
  };

  // Initialize the form with default values or initial data
  const form = useForm<AvailabilityValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      availability: initialData?.availability || "full-time",
      ...getInitialAvailability(),
      preferredLocations: initialData?.preferredLocations?.join(", ") || "",
      maxTravelDistance: initialData?.maxTravelDistance || 10,
      travelDistanceUnit: initialData?.travelDistanceUnit || "miles",
      noticePeriod: initialData?.noticePeriod || 24,
      noticePeriodUnit: initialData?.noticePeriodUnit || "hours",
      availabilityNotes: initialData?.availabilityNotes || "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: AvailabilityValues) => {
    if (readOnly) return;
    
    setIsSubmitting(true);
    
    try {
      // Format the data for the API
      const formattedData = {
        // General availability
        availability: data.availability,
        
        // Detailed availability schedule
        t_availability_schedule: {
          monday: data.monday || [],
          tuesday: data.tuesday || [],
          wednesday: data.wednesday || [],
          thursday: data.thursday || [],
          friday: data.friday || [],
          saturday: data.saturday || [],
          sunday: data.sunday || [],
        },
        
        // Preferred locations
        preferredLocations: data.preferredLocations.split(",").map(loc => loc.trim()),
        
        // Travel details
        t_max_travel_distance: data.maxTravelDistance,
        t_travel_distance_unit: data.travelDistanceUnit,
        
        // Notice period
        t_notice_period: data.noticePeriod,
        t_notice_period_unit: data.noticePeriodUnit,
        
        // Notes
        t_availability_notes: data.availabilityNotes,
      };
      
      // If there's a teacherId, update the existing teacher
      if (teacherId) {
        const success = await teacherService.updateTeacher(teacherId, formattedData);
        
        if (success) {
          toast({
            title: "Success",
            description: "Availability information updated successfully",
          });
          
          if (onSave) {
            onSave(formattedData);
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to update availability information",
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
          description: "Availability information saved",
        });
      }
    } catch (error) {
      console.error("Error saving availability information:", error);
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
        <CardTitle>Availability</CardTitle>
        <CardDescription>
          Manage the teacher's availability and location preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* General Availability */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">General Availability</h3>
              
              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability Type*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={readOnly}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="weekends">Weekends Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select your general availability pattern
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Weekly Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Weekly Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Select the time slots when you are available to teach
              </p>
              
              <div className="space-y-6">
                {/* Monday */}
                <FormField
                  control={form.control}
                  name="monday"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-4">
                        <FormLabel className="w-24 text-right">Monday</FormLabel>
                        <div className="flex flex-wrap gap-4">
                          {timeSlots.map((slot) => (
                            <FormItem
                              key={`monday-${slot}`}
                              className="flex items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(slot)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValues, slot]);
                                    } else {
                                      field.onChange(
                                        currentValues.filter((value) => value !== slot)
                                      );
                                    }
                                  }}
                                  disabled={readOnly}
                                />
                              </FormControl>
                              <FormLabel className="font-normal capitalize">
                                {slot}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                
                {/* Tuesday */}
                <FormField
                  control={form.control}
                  name="tuesday"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-4">
                        <FormLabel className="w-24 text-right">Tuesday</FormLabel>
                        <div className="flex flex-wrap gap-4">
                          {timeSlots.map((slot) => (
                            <FormItem
                              key={`tuesday-${slot}`}
                              className="flex items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(slot)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValues, slot]);
                                    } else {
                                      field.onChange(
                                        currentValues.filter((value) => value !== slot)
                                      );
                                    }
                                  }}
                                  disabled={readOnly}
                                />
                              </FormControl>
                              <FormLabel className="font-normal capitalize">
                                {slot}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                
                {/* Wednesday */}
                <FormField
                  control={form.control}
                  name="wednesday"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-4">
                        <FormLabel className="w-24 text-right">Wednesday</FormLabel>
                        <div className="flex flex-wrap gap-4">
                          {timeSlots.map((slot) => (
                            <FormItem
                              key={`wednesday-${slot}`}
                              className="flex items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(slot)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValues, slot]);
                                    } else {
                                      field.onChange(
                                        currentValues.filter((value) => value !== slot)
                                      );
                                    }
                                  }}
                                  disabled={readOnly}
                                />
                              </FormControl>
                              <FormLabel className="font-normal capitalize">
                                {slot}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                
                {/* Thursday */}
                <FormField
                  control={form.control}
                  name="thursday"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-4">
                        <FormLabel className="w-24 text-right">Thursday</FormLabel>
                        <div className="flex flex-wrap gap-4">
                          {timeSlots.map((slot) => (
                            <FormItem
                              key={`thursday-${slot}`}
                              className="flex items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(slot)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValues, slot]);
                                    } else {
                                      field.onChange(
                                        currentValues.filter((value) => value !== slot)
                                      );
                                    }
                                  }}
                                  disabled={readOnly}
                                />
                              </FormControl>
                              <FormLabel className="font-normal capitalize">
                                {slot}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                
                {/* Friday */}
                <FormField
                  control={form.control}
                  name="friday"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-4">
                        <FormLabel className="w-24 text-right">Friday</FormLabel>
                        <div className="flex flex-wrap gap-4">
                          {timeSlots.map((slot) => (
                            <FormItem
                              key={`friday-${slot}`}
                              className="flex items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(slot)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValues, slot]);
                                    } else {
                                      field.onChange(
                                        currentValues.filter((value) => value !== slot)
                                      );
                                    }
                                  }}
                                  disabled={readOnly}
                                />
                              </FormControl>
                              <FormLabel className="font-normal capitalize">
                                {slot}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                
                {/* Saturday */}
                <FormField
                  control={form.control}
                  name="saturday"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-4">
                        <FormLabel className="w-24 text-right">Saturday</FormLabel>
                        <div className="flex flex-wrap gap-4">
                          {timeSlots.map((slot) => (
                            <FormItem
                              key={`saturday-${slot}`}
                              className="flex items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(slot)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValues, slot]);
                                    } else {
                                      field.onChange(
                                        currentValues.filter((value) => value !== slot)
                                      );
                                    }
                                  }}
                                  disabled={readOnly}
                                />
                              </FormControl>
                              <FormLabel className="font-normal capitalize">
                                {slot}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                
                {/* Sunday */}
                <FormField
                  control={form.control}
                  name="sunday"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-4">
                        <FormLabel className="w-24 text-right">Sunday</FormLabel>
                        <div className="flex flex-wrap gap-4">
                          {timeSlots.map((slot) => (
                            <FormItem
                              key={`sunday-${slot}`}
                              className="flex items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(slot)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValues, slot]);
                                    } else {
                                      field.onChange(
                                        currentValues.filter((value) => value !== slot)
                                      );
                                    }
                                  }}
                                  disabled={readOnly}
                                />
                              </FormControl>
                              <FormLabel className="font-normal capitalize">
                                {slot}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Location Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Location Preferences</h3>
              
              <FormField
                control={form.control}
                name="preferredLocations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Locations*</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="London, Manchester, Birmingham"
                        {...field}
                        readOnly={readOnly}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter preferred locations separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxTravelDistance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Travel Distance*</FormLabel>
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
                
                <FormField
                  control={form.control}
                  name="travelDistanceUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distance Unit*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={readOnly}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="miles">Miles</SelectItem>
                          <SelectItem value="kilometers">Kilometers</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Notice Period */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notice Period</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="noticePeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notice Period Required*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          readOnly={readOnly}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum notice required for bookings
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="noticePeriodUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notice Period Unit*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={readOnly}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Notes</h3>
              
              <FormField
                control={form.control}
                name="availabilityNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional information about your availability..."
                        className="min-h-[100px]"
                        {...field}
                        readOnly={readOnly}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Add any specific details about your availability
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
                    "Save Availability Information"
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

export default TeacherAvailability; 