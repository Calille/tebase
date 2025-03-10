import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Define the form schema
const sendcoContactSchema = z.object({
  sendcoContact: z.object({
    name: z.string().min(1, "Contact name is required"),
    position: z.string().min(1, "Position is required"),
    phone: z.string().min(1, "Phone number is required"),
    email: z.string().email("Invalid email address"),
    specializations: z.string().transform(val => val.split(",").map(item => item.trim())),
    availability: z.string(),
    notes: z.string().optional(),
    verified: z.boolean().default(false),
    lastContactDate: z.string().optional(),
  }),
});

type SendcoContactValues = z.infer<typeof sendcoContactSchema>;

interface SchoolSendcoContactProps {
  schoolId?: string;
  initialData?: any;
  onSave?: (data: any) => void;
  readOnly?: boolean;
}

const SchoolSendcoContact = ({
  schoolId,
  initialData,
  onSave,
  readOnly = false,
}: SchoolSendcoContactProps) => {
  const [date, setDate] = React.useState<Date | undefined>(
    initialData?.sendcoContact?.lastContactDate 
      ? new Date(initialData.sendcoContact.lastContactDate) 
      : undefined
  );

  // Initialize the form with default values or initial data
  const form = useForm<SendcoContactValues>({
    resolver: zodResolver(sendcoContactSchema),
    defaultValues: {
      sendcoContact: {
        name: initialData?.sendcoContact?.name || "",
        position: initialData?.sendcoContact?.position || "",
        phone: initialData?.sendcoContact?.phone || "",
        email: initialData?.sendcoContact?.email || "",
        specializations: initialData?.sendcoContact?.specializations ? initialData.sendcoContact.specializations.join(", ") : "",
        availability: initialData?.sendcoContact?.availability || "",
        notes: initialData?.sendcoContact?.notes || "",
        verified: initialData?.sendcoContact?.verified || false,
        lastContactDate: initialData?.sendcoContact?.lastContactDate || "",
      },
    },
  });

  const { formState } = form;
  const { isSubmitting } = formState;

  const onSubmit = async (data: SendcoContactValues) => {
    // Update the lastContactDate with the selected date
    if (date) {
      data.sendcoContact.lastContactDate = format(date, "yyyy-MM-dd");
    }
    
    if (onSave) {
      onSave(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SENDCO Contact</CardTitle>
        <CardDescription>
          Enter information about the Special Educational Needs and Disabilities Coordinator
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Name */}
              <FormField
                control={form.control}
                name="sendcoContact.name"
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
                name="sendcoContact.position"
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
                name="sendcoContact.phone"
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
                name="sendcoContact.email"
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
              {/* Specializations */}
              <FormField
                control={form.control}
                name="sendcoContact.specializations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specializations/Expertise</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Dyslexia, ADHD, Autism" 
                        {...field} 
                        disabled={readOnly}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter specializations separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Availability */}
              <FormField
                control={form.control}
                name="sendcoContact.availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability for Meetings</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Tuesday and Thursday afternoons" 
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
                name="sendcoContact.verified"
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

            {/* Notes */}
            <FormField
              control={form.control}
              name="sendcoContact.notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes on Specific Requirements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional notes about specific requirements or preferences"
                      className="min-h-[100px]"
                      {...field}
                      disabled={readOnly}
                    />
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
                  "Save SENDCO Contact"
                )}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SchoolSendcoContact; 