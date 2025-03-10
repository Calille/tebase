import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Define the form schema
const additionalInfoSchema = z.object({
  specialPrograms: z.string().transform(val => val.split(",").map(item => item.trim())),
  keyDates: z.array(
    z.object({
      name: z.string().min(1, "Date name is required"),
      date: z.string().min(1, "Date is required"),
      description: z.string().optional(),
    })
  ).optional().default([]),
  substituteRequirements: z.string().optional(),
  historicalPlacementNotes: z.string().optional(),
  administrativeNotes: z.string().optional(),
});

type AdditionalInfoValues = z.infer<typeof additionalInfoSchema>;

interface SchoolAdditionalInfoProps {
  schoolId?: string;
  initialData?: any;
  onSave?: (data: any) => void;
  readOnly?: boolean;
}

const SchoolAdditionalInfo = ({
  schoolId,
  initialData,
  onSave,
  readOnly = false,
}: SchoolAdditionalInfoProps) => {
  const [keyDateName, setKeyDateName] = useState("");
  const [keyDateDescription, setKeyDateDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [keyDates, setKeyDates] = useState<Array<{name: string; date: string; description: string}>>
    (initialData?.keyDates || []);

  // Initialize the form with default values or initial data
  const form = useForm<AdditionalInfoValues>({
    resolver: zodResolver(additionalInfoSchema),
    defaultValues: {
      specialPrograms: initialData?.specialPrograms ? initialData.specialPrograms.join(", ") : "",
      keyDates: initialData?.keyDates || [],
      substituteRequirements: initialData?.substituteRequirements || "",
      historicalPlacementNotes: initialData?.historicalPlacementNotes || "",
      administrativeNotes: initialData?.administrativeNotes || "",
    },
  });

  const { formState, setValue } = form;
  const { isSubmitting } = formState;

  const handleAddKeyDate = () => {
    if (!keyDateName || !selectedDate) return;

    const newDate = {
      name: keyDateName,
      date: format(selectedDate, "yyyy-MM-dd"),
      description: keyDateDescription,
    };

    const updatedDates = [...keyDates, newDate];
    setKeyDates(updatedDates);
    setValue("keyDates", updatedDates);

    // Reset inputs
    setKeyDateName("");
    setKeyDateDescription("");
    setSelectedDate(undefined);
  };

  const handleRemoveKeyDate = (index: number) => {
    const updatedDates = keyDates.filter((_, i) => i !== index);
    setKeyDates(updatedDates);
    setValue("keyDates", updatedDates);
  };

  const onSubmit = async (data: AdditionalInfoValues) => {
    // Ensure key dates are included
    data.keyDates = keyDates;
    
    if (onSave) {
      onSave(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Information</CardTitle>
        <CardDescription>
          Enter additional details about the school
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Special Programs */}
            <FormField
              control={form.control}
              name="specialPrograms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Programs Offered</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Music Excellence, STEM Focus, Language Immersion" 
                      {...field} 
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter special programs separated by commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Key Dates */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Calendar/Key Dates</h3>
              
              {!readOnly && (
                <div className="space-y-4 p-4 border rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FormLabel htmlFor="key-date-name">Date Name</FormLabel>
                      <Input
                        id="key-date-name"
                        placeholder="e.g. Summer Term Start"
                        value={keyDateName}
                        onChange={(e) => setKeyDateName(e.target.value)}
                      />
                    </div>
                    <div>
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                              <CalendarComponent className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div>
                    <FormLabel htmlFor="key-date-description">Description (Optional)</FormLabel>
                    <Input
                      id="key-date-description"
                      placeholder="e.g. Beginning of summer term"
                      value={keyDateDescription}
                      onChange={(e) => setKeyDateDescription(e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddKeyDate}
                    disabled={!keyDateName || !selectedDate}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Key Date
                  </Button>
                </div>
              )}
              
              {keyDates.length > 0 ? (
                <div className="space-y-2">
                  {keyDates.map((date, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{date.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(date.date).toLocaleDateString()} - {date.description}
                        </p>
                      </div>
                      {!readOnly && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveKeyDate(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No key dates added yet.</p>
              )}
            </div>

            {/* Substitute Requirements */}
            <FormField
              control={form.control}
              name="substituteRequirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specific Requirements for Substitute Teachers</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any specific requirements for substitute teachers"
                      className="min-h-[100px]"
                      {...field}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Historical Placement Notes */}
            <FormField
              control={form.control}
              name="historicalPlacementNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Historical Placement Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter notes about past teacher placements at this school"
                      className="min-h-[100px]"
                      {...field}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Administrative Notes */}
            <FormField
              control={form.control}
              name="administrativeNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Administrative Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any administrative notes about this school"
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
                  "Save Additional Information"
                )}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SchoolAdditionalInfo; 