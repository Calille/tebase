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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { School } from "@/services/schoolService";

// Define the form schema
const financeContactSchema = z.object({
  financeContact: z.object({
    name: z.string().min(1, "Contact name is required"),
    position: z.string().min(1, "Position is required"),
    phone: z.string().min(1, "Phone number is required"),
    email: z.string().email("Invalid email address"),
    billingAddress: z.object({
      useSameAddress: z.boolean().default(true),
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
    }),
    invoicingPreferences: z.string().min(1, "Invoicing preferences are required"),
    paymentTerms: z.string().min(1, "Payment terms are required"),
    purchaseOrderRequired: z.boolean().default(false),
    verified: z.boolean().default(false),
    lastContactDate: z.string().optional(),
  }),
});

type FinanceContactValues = z.infer<typeof financeContactSchema>;

interface SchoolFinanceContactProps {
  schoolId?: string;
  initialData?: Partial<School>;
  onSave?: (data: FinanceContactValues) => void;
  readOnly?: boolean;
}

const SchoolFinanceContact = ({
  schoolId,
  initialData,
  onSave,
  readOnly = false,
}: SchoolFinanceContactProps) => {
  const [date, setDate] = React.useState<Date | undefined>(
    initialData?.financeContact?.lastContactDate 
      ? new Date(initialData.financeContact.lastContactDate) 
      : undefined
  );

  const billingAddress = initialData?.financeContact?.billingAddress as
    | (School["financeContact"]["billingAddress"] & { useSameAddress?: boolean })
    | undefined;

  const [useSameAddress, setUseSameAddress] = React.useState(
    billingAddress?.useSameAddress !== false
  );

  // Initialize the form with default values or initial data
  const form = useForm<FinanceContactValues>({
    resolver: zodResolver(financeContactSchema),
    defaultValues: {
      financeContact: {
        name: initialData?.financeContact?.name || "",
        position: initialData?.financeContact?.position || "",
        phone: initialData?.financeContact?.phone || "",
        email: initialData?.financeContact?.email || "",
        billingAddress: {
          useSameAddress: billingAddress?.useSameAddress !== false,
          street: initialData?.financeContact?.billingAddress?.street || "",
          city: initialData?.financeContact?.billingAddress?.city || "",
          state: initialData?.financeContact?.billingAddress?.state || "",
          zip: initialData?.financeContact?.billingAddress?.zip || "",
          country: initialData?.financeContact?.billingAddress?.country || "United Kingdom",
        },
        invoicingPreferences: initialData?.financeContact?.invoicingPreferences || "",
        paymentTerms: initialData?.financeContact?.paymentTerms || "",
        purchaseOrderRequired: initialData?.financeContact?.purchaseOrderRequired || false,
        verified: initialData?.financeContact?.verified || false,
        lastContactDate: initialData?.financeContact?.lastContactDate || "",
      },
    },
  });

  const { formState } = form;
  const { isSubmitting } = formState;

  const onSubmit = async (data: FinanceContactValues) => {
    // Update the lastContactDate with the selected date
    if (date) {
      data.financeContact.lastContactDate = format(date, "yyyy-MM-dd");
    }
    
    if (onSave) {
      onSave(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finance Contact</CardTitle>
        <CardDescription>
          Enter information about the finance contact at the school
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Name */}
              <FormField
                control={form.control}
                name="financeContact.name"
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
                name="financeContact.position"
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
                name="financeContact.phone"
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
                name="financeContact.email"
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

            {/* Billing Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Billing Address</h3>
              
              {/* Use Same Address */}
              <FormField
                control={form.control}
                name="financeContact.billingAddress.useSameAddress"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          setUseSameAddress(!!checked);
                        }}
                        disabled={readOnly}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Use School Address for Billing</FormLabel>
                      <FormDescription>
                        Check this box if the billing address is the same as the school address
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {!useSameAddress && (
                <>
                  {/* Street */}
                  <FormField
                    control={form.control}
                    name="financeContact.billingAddress.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
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
                      name="financeContact.billingAddress.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
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
                      name="financeContact.billingAddress.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/County</FormLabel>
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
                      name="financeContact.billingAddress.zip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
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
                      name="financeContact.billingAddress.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter country" {...field} disabled={readOnly} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Invoicing Preferences */}
              <FormField
                control={form.control}
                name="financeContact.invoicingPreferences"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Invoicing Preferences*</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                        disabled={readOnly}
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="electronic" />
                          </FormControl>
                          <FormLabel className="font-normal">Electronic (Email)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="paper" />
                          </FormControl>
                          <FormLabel className="font-normal">Paper (Mail)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="both" />
                          </FormControl>
                          <FormLabel className="font-normal">Both Electronic and Paper</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Terms */}
              <FormField
                control={form.control}
                name="financeContact.paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Terms*</FormLabel>
                    <Select
                      disabled={readOnly}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment terms" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="net15">Net 15</SelectItem>
                        <SelectItem value="net30">Net 30</SelectItem>
                        <SelectItem value="net45">Net 45</SelectItem>
                        <SelectItem value="net60">Net 60</SelectItem>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Purchase Order Required */}
              <FormField
                control={form.control}
                name="financeContact.purchaseOrderRequired"
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
                      <FormLabel>Purchase Order Required</FormLabel>
                      <FormDescription>
                        Check this box if a purchase order is required for invoicing
                      </FormDescription>
                    </div>
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

            {/* Verified */}
            <FormField
              control={form.control}
              name="financeContact.verified"
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
                  "Save Finance Contact"
                )}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SchoolFinanceContact; 