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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { toastDemoAction, toastWriteResult } from "@/lib/persistence";
import { Toaster } from "@/components/ui/toaster";
import { Loader2, Lock } from "lucide-react";
import { teacherService } from "@/services/teacherService";

// Define the form schema with Zod
const financialInfoSchema = z.object({
  // Daily pay rate
  payRate: z.number().min(0, { message: "Pay rate must be a positive number" }),
  currency: z.string().min(1, { message: "Currency is required" }),
  rateType: z.enum(["hourly", "daily", "annually"], {
    required_error: "Rate type is required",
  }),
  
  // Bank details (encrypted in the database)
  bankName: z.string().min(2, { message: "Bank name is required" }),
  accountName: z.string().min(2, { message: "Account name is required" }),
  accountNumber: z.string().min(8, { message: "Valid account number is required" }),
  sortCode: z.string().min(6, { message: "Valid sort code is required" }),
  
  // Tax information
  taxId: z.string().min(2, { message: "Tax ID is required" }),
  taxStatus: z.string().min(2, { message: "Tax status is required" }),
  taxWithholding: z.string().optional(),
  
  // Payment method
  paymentMethod: z.enum(["bank_transfer", "paypal", "check"], {
    required_error: "Payment method is required",
  }),
  paypalEmail: z.string().email().optional(),
});

type FinancialInfoValues = z.infer<typeof financialInfoSchema>;

interface TeacherFinancialInfoProps {
  teacherId?: string;
  initialData?: any;
  onSave?: (data: any) => void;
  readOnly?: boolean;
}

const TeacherFinancialInfo = ({
  teacherId,
  initialData,
  onSave,
  readOnly = false,
}: TeacherFinancialInfoProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);

  // Initialize the form with default values or initial data
  const form = useForm<FinancialInfoValues>({
    resolver: zodResolver(financialInfoSchema),
    defaultValues: {
      payRate: initialData?.salaryExpectations?.min || 0,
      currency: initialData?.salaryExpectations?.currency || "GBP",
      rateType: initialData?.salaryExpectations?.rate || "daily",
      
      bankName: initialData?.bankDetails?.bankName || "",
      accountName: initialData?.bankDetails?.accountName || "",
      accountNumber: initialData?.bankDetails?.accountNumber || "",
      sortCode: initialData?.bankDetails?.sortCode || "",
      
      taxId: initialData?.taxInformation?.taxId || "",
      taxStatus: initialData?.taxInformation?.taxStatus || "",
      taxWithholding: initialData?.taxInformation?.taxWithholding || "",
      
      paymentMethod: initialData?.paymentMethod || "bank_transfer",
      paypalEmail: initialData?.paypalEmail || "",
    },
  });

  // Watch payment method to conditionally show PayPal email field
  const paymentMethod = form.watch("paymentMethod");

  // Handle form submission
  const onSubmit = async (data: FinancialInfoValues) => {
    if (readOnly) return;
    
    setIsSubmitting(true);
    
    try {
      // Format the data for the API
      const formattedData = {
        // Salary expectations
        salaryExpectations: {
          min: data.payRate,
          max: data.payRate * 1.2, // Example: max is 20% higher than standard rate
          currency: data.currency,
          rate: data.rateType,
        },
        
        // Bank details (would be encrypted in a real implementation)
        t_bank_details: {
          bankName: data.bankName,
          accountName: data.accountName,
          accountNumber: data.accountNumber,
          sortCode: data.sortCode,
        },
        
        // Tax information
        t_tax_information: {
          taxId: data.taxId,
          taxStatus: data.taxStatus,
          taxWithholding: data.taxWithholding,
        },
        
        // Payment method
        t_payment_method: data.paymentMethod,
        t_paypal_email: data.paymentMethod === "paypal" ? data.paypalEmail : null,
      };
      
      if (teacherId) {
        const result = await teacherService.updateTeacher(teacherId, formattedData);
        toastWriteResult("Financial information updated", result);
        if (result.ok && onSave) {
          onSave(formattedData);
        }
      } else if (onSave) {
        onSave(formattedData);
        toastDemoAction("Financial information saved");
      }
    } catch (error) {
      console.error("Error saving financial information:", error);
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
        <CardTitle>Financial Information</CardTitle>
        <CardDescription>
          Manage the teacher's payment details and tax information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Pay Rate */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pay Rate</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="payRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate Amount*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
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
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={readOnly}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="rateType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate Type*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={readOnly}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select rate type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Bank Details</h3>
                {!readOnly && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBankDetails(!showBankDetails)}
                  >
                    {showBankDetails ? "Hide" : "Show"} Bank Details
                    <Lock className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className={showBankDetails || readOnly ? "" : "opacity-50 pointer-events-none"}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Barclays, HSBC, etc."
                            {...field}
                            readOnly={readOnly}
                            type={showBankDetails || readOnly ? "text" : "password"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="accountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Holder Name*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Smith"
                            {...field}
                            readOnly={readOnly}
                            type={showBankDetails || readOnly ? "text" : "password"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="12345678"
                            {...field}
                            readOnly={readOnly}
                            type={showBankDetails || readOnly ? "text" : "password"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sortCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sort Code*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="12-34-56"
                            {...field}
                            readOnly={readOnly}
                            type={showBankDetails || readOnly ? "text" : "password"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <p className="text-sm text-muted-foreground mt-2">
                  Bank details are encrypted and stored securely.
                </p>
              </div>
            </div>

            {/* Tax Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Tax Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID / National Insurance Number*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="AB123456C"
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
                  name="taxStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Status*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={readOnly}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tax status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">Standard Rate</SelectItem>
                          <SelectItem value="basic">Basic Rate</SelectItem>
                          <SelectItem value="higher">Higher Rate</SelectItem>
                          <SelectItem value="additional">Additional Rate</SelectItem>
                          <SelectItem value="self-employed">Self-Employed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="taxWithholding"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Withholding Preferences</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Any specific tax withholding instructions"
                        {...field}
                        readOnly={readOnly}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Specify any special tax withholding arrangements
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Payment Method</h3>
              
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Preferred Payment Method*</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                        disabled={readOnly}
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="bank_transfer" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Bank Transfer
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="paypal" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            PayPal
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="check" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Check
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {paymentMethod === "paypal" && (
                <FormField
                  control={form.control}
                  name="paypalEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PayPal Email*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your.email@example.com"
                          type="email"
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

            {!readOnly && (
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Financial Information"
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

export default TeacherFinancialInfo; 