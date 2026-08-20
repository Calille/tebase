import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { School } from "@/services/schoolService";

// Define the form schema
const headteacherContactSchema = z.object({
  headteacherContact: z.object({
    name: z.string().min(1, "Contact name is required"),
    position: z.string().min(1, "Position is required"),
    phone: z.string().min(1, "Phone number is required"),
    email: z.string().email("Invalid email address"),
    assistantInfo: z.string().optional(),
    bestTimeToContact: z.string().optional(),
    verified: z.boolean().default(false),
    lastContactDate: z.string().optional(),
  }),
});

type HeadteacherContactValues = z.infer<typeof headteacherContactSchema>;

interface SchoolHeadteacherContactProps {
  schoolId?: string;
  initialData?: Partial<School>;
  onSave?: (data: HeadteacherContactValues) => void;
  readOnly?: boolean;
}

const SchoolHeadteacherContact = ({
  schoolId,
  initialData,
  onSave,
  readOnly = false,
}: SchoolHeadteacherContactProps) => {
  const [date, setDate] = React.useState<Date | undefined>(
    initialData?.headteacherContact?.lastContactDate 
      ? new Date(initialData.headteacherContact.lastContactDate) 
      : undefined
  );

  // Initialize the form with default values or initial data
  const form = useForm<HeadteacherContactValues>({
    resolver: zodResolver(headteacherContactSchema),
    defaultValues: {
      headteacherContact: {
        name: initialData?.headteacherContact?.name || "",
        position: initialData?.headteacherContact?.position || "",
        phone: initialData?.headteacherContact?.phone || "",
        email: initialData?.headteacherContact?.email || "",
        assistantInfo: initialData?.headteacherContact?.assistantInfo || "",
        bestTimeToContact: initialData?.headteacherContact?.bestTimeToContact || "",
        verified: initialData?.headteacherContact?.verified || false,
        lastContactDate: initialData?.headteacherContact?.lastContactDate || "",
      },
    },
  });

  const { formState } = form;
  const { isSubmitting } = formState;

  const onSubmit = async (data: HeadteacherContactValues) => {
    // Update the lastContactDate with the selected date
    if (date) {
      data.headteacherContact.lastContactDate = format(date, "yyyy-MM-dd");
    }
    
    if (onSave) {
      onSave(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Headteacher/Principal Contact</CardTitle>
        <CardDescription>
          Enter information about the headteacher or principal of the school
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Name */}
              <FormField
                control={form.control}
                name="headteacherContact.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact name" {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Position/Title */}
              <FormField
                control={form.control}
                name="headteacherContact.position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position/Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter position or title" {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone */}
              <FormField
                control={form.control}
                name="headteacherContact.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direct Phone Number*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="headteacherContact.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assistant's Information */}
              <FormField
                control={form.control}
                name="headteacherContact.assistantInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assistant's Contact Information</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Jane Smith, jsmith@school.edu, 020 1234 5678" 
                        {...field} 
                        disabled={readOnly}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter assistant's name, email, and phone if applicable
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Best Time to Contact */}
              <FormField
                control={form.control}
                name="headteacherContact.bestTimeToContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Best Times to Contact</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Wednesday mornings, after 3 PM" 
                        {...field} 
                        disabled={readOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Last Contact Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormItem className="flex flex-col">
                <FormLabel>Last Contact Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                        disabled={readOnly}
                      >
                        {date ? format(date, "PPP") : "Select a date"}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={readOnly}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  When was the last time you contacted this person?
                </FormDescription>
                <FormMessage />
              </FormItem>

              {/* Verified */}
              <FormField
                control={form.control}
                name="headteacherContact.verified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={readOnly}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Contact Verified</FormLabel>
                      <FormDescription>
                        Check this box if you have verified this contact's information
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {!readOnly && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Headteacher Contact"
                )}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SchoolHeadteacherContact; 