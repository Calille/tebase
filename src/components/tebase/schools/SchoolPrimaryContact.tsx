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
const primaryContactSchema = z.object({
  primaryContact: z.object({
    name: z.string().min(1, "Contact name is required"),
    position: z.string().min(1, "Position is required"),
    phone: z.string().min(1, "Phone number is required"),
    email: z.string().email("Invalid email address"),
    preferredContactMethod: z.string().min(1, "Preferred contact method is required"),
    notes: z.string().optional(),
    verified: z.boolean().default(false),
    lastContactDate: z.string().optional(),
  }),
});

type PrimaryContactValues = z.infer<typeof primaryContactSchema>;

interface SchoolPrimaryContactProps {
  schoolId?: string;
  initialData?: any;
  onSave?: (data: any) => void;
  readOnly?: boolean;
}

const SchoolPrimaryContact = ({
  schoolId,
  initialData,
  onSave,
  readOnly = false,
}: SchoolPrimaryContactProps) => {
  const [date, setDate] = React.useState<Date | undefined>(
    initialData?.primaryContact?.lastContactDate 
      ? new Date(initialData.primaryContact.lastContactDate) 
      : undefined
  );

  // Initialize the form with default values or initial data
  const form = useForm<PrimaryContactValues>({
    resolver: zodResolver(primaryContactSchema),
    defaultValues: {
      primaryContact: {
        name: initialData?.primaryContact?.name || "",
        position: initialData?.primaryContact?.position || "",
        phone: initialData?.primaryContact?.phone || "",
        email: initialData?.primaryContact?.email || "",
        preferredContactMethod: initialData?.primaryContact?.preferredContactMethod || "",
        notes: initialData?.primaryContact?.notes || "",
        verified: initialData?.primaryContact?.verified || false,
        lastContactDate: initialData?.primaryContact?.lastContactDate || "",
      },
    },
  });

  const { formState } = form;
  const { isSubmitting } = formState;

  const onSubmit = async (data: PrimaryContactValues) => {
    // Update the lastContactDate with the selected date
    if (date) {
      data.primaryContact.lastContactDate = format(date, "yyyy-MM-dd");
    }
    
    if (onSave) {
      onSave(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Primary Contact</CardTitle>
        <CardDescription>
          Enter information about the main contact person at the school
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Name */}
              <FormField
                control={form.control}
                name="primaryContact.name"
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
                name="primaryContact.position"
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
                name="primaryContact.phone"
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
                name="primaryContact.email"
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
              {/* Preferred Contact Method */}
              <FormField
                control={form.control}
                name="primaryContact.preferredContactMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Contact Method*</FormLabel>
                    <Select
                      disabled={readOnly}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preferred method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="text">Text Message</SelectItem>
                        <SelectItem value="in-person">In Person</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Contact Date */}
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
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="primaryContact.notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional notes about this contact"
                      className="min-h-[100px]"
                      {...field}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Verified */}
            <FormField
              control={form.control}
              name="primaryContact.verified"
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

            {!readOnly && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Primary Contact"
                )}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SchoolPrimaryContact; 