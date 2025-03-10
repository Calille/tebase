import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

// Define the form schema
const basicInfoSchema = z.object({
  name: z.string().min(2, "School name must be at least 2 characters"),
  type: z.string().min(1, "School type is required"),
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State/County is required"),
    zip: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  phone: z.string().min(1, "Phone number is required"),
  website: z.string().url("Please enter a valid URL").or(z.string().length(0)),
  district: z.string(),
  yearEstablished: z.coerce.number().int().positive("Year must be a positive number").or(z.coerce.number().optional()),
  numberOfStudents: z.coerce.number().int().positive("Number of students must be a positive number").or(z.coerce.number().optional()),
  gradeLevels: z.string().transform(val => val.split(",").map(item => item.trim())),
  schoolHours: z.string(),
});

type BasicInfoValues = z.infer<typeof basicInfoSchema>;

interface SchoolBasicInfoProps {
  schoolId?: string;
  initialData?: any;
  onSave?: (data: any) => void;
  readOnly?: boolean;
}

const SchoolBasicInfo = ({
  schoolId,
  initialData,
  onSave,
  readOnly = false,
}: SchoolBasicInfoProps) => {
  // Initialize the form with default values or initial data
  const form = useForm<BasicInfoValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "",
      address: {
        street: initialData?.address?.street || "",
        city: initialData?.address?.city || "",
        state: initialData?.address?.state || "",
        zip: initialData?.address?.zip || "",
        country: initialData?.address?.country || "United Kingdom",
      },
      phone: initialData?.phone || "",
      website: initialData?.website || "",
      district: initialData?.district || "",
      yearEstablished: initialData?.yearEstablished || undefined,
      numberOfStudents: initialData?.numberOfStudents || undefined,
      gradeLevels: initialData?.gradeLevels ? initialData.gradeLevels.join(", ") : "",
      schoolHours: initialData?.schoolHours || "",
    },
  });

  const { formState } = form;
  const { isSubmitting } = formState;

  const onSubmit = async (data: BasicInfoValues) => {
    if (onSave) {
      onSave(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic School Information</CardTitle>
        <CardDescription>
          Enter the basic information about the school
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* School Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter school name" {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* School Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Type*</FormLabel>
                    <Select
                      disabled={readOnly}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select school type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="charter">Charter</SelectItem>
                        <SelectItem value="academy">Academy</SelectItem>
                        <SelectItem value="faith">Faith School</SelectItem>
                        <SelectItem value="special">Special School</SelectItem>
                        <SelectItem value="independent">Independent</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Address</h3>
              
              {/* Street */}
              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter street address" {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* City */}
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} disabled={readOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* State/County */}
                <FormField
                  control={form.control}
                  name="address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/County*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter state or county" {...field} disabled={readOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Postal Code */}
                <FormField
                  control={form.control}
                  name="address.zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter postal code" {...field} disabled={readOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Country */}
                <FormField
                  control={form.control}
                  name="address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter country" {...field} disabled={readOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Phone Number*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Website */}
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.example.edu.uk" {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* School District/LEA */}
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School District/LEA</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter school district" {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Year Established */}
              <FormField
                control={form.control}
                name="yearEstablished"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Established</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter year" 
                        {...field} 
                        disabled={readOnly}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? undefined : parseInt(e.target.value, 10);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Number of Students */}
              <FormField
                control={form.control}
                name="numberOfStudents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Students</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter number of students" 
                        {...field} 
                        disabled={readOnly}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? undefined : parseInt(e.target.value, 10);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Grade Levels */}
              <FormField
                control={form.control}
                name="gradeLevels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade Levels Served</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Reception, Year 1, Year 2" 
                        {...field} 
                        disabled={readOnly}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter grade levels separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* School Hours */}
            <FormField
              control={form.control}
              name="schoolHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Hours</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 8:45 AM - 3:15 PM" {...field} disabled={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!readOnly && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Basic Information"
                )}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SchoolBasicInfo; 