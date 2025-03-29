import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { insertAuctionSchema, InsertAuction } from "@shared/schema";
import { z } from "zod";
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

// Extend schema to include end date/time fields for form
const createAuctionFormSchema = insertAuctionSchema.omit({ 
  endTime: true,
  sellerId: true 
}).extend({
  endDate: z.string().min(1, { message: "End date is required" }),
  endTime: z.string().min(1, { message: "End time is required" }),
});

type CreateAuctionFormData = Omit<InsertAuction, "endTime" | "sellerId"> & {
  endDate: string;
  endTime: string;
};

export default function CreateAuctionPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Categories
  const categories = [
    "Electronics",
    "Fashion",
    "Collectibles",
    "Home & Garden",
    "Art",
    "Vehicles",
    "Sports",
    "Toys",
    "Books & Media",
    "Jewelry",
    "Other"
  ];

  const form = useForm<CreateAuctionFormData>({
    resolver: zodResolver(createAuctionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startingPrice: 0,
      imageUrl: "",
      category: "",
      endDate: "",
      endTime: "",
    },
  });

  const createAuctionMutation = useMutation({
    mutationFn: async (data: CreateAuctionFormData) => {
      try {
        // Combine date and time to create a complete endTime
        const { endDate, endTime, ...auctionData } = data;
        
        // Ensure both date and time are provided
        if (!endDate || !endTime) {
          throw new Error("Both end date and end time are required");
        }
        
        // Create a valid date string and parse it
        const combinedEndTime = new Date(`${endDate}T${endTime}:00`);
        
        // Verify that the date is valid
        if (isNaN(combinedEndTime.getTime())) {
          throw new Error("Invalid date or time format");
        }
        
        // Set current price to the starting price initially
        const currentPrice = data.startingPrice;
        
        // Create the auction
        const res = await apiRequest("POST", "/api/auctions", {
          ...auctionData,
          currentPrice,
          endTime: combinedEndTime.toISOString(),
        });
        
        return await res.json();
      } catch (error) {
        console.error("Auction creation error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auctions"] });
      toast({
        title: "Auction Created",
        description: "Your auction has been created successfully!",
      });
      navigate("/auctions");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create auction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateAuctionFormData) => {
    createAuctionMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Create New Auction</CardTitle>
                <CardDescription>
                  Fill in the details below to list your item for auction
                </CardDescription>
              </CardHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter a descriptive title" 
                              {...fieldProps} 
                              value={value || ""}
                              onChange={(e) => onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide details about your item" 
                              className="min-h-[120px]" 
                              {...fieldProps} 
                              value={value || ""}
                              onChange={(e) => onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startingPrice"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                          <FormItem>
                            <FormLabel>Starting Price ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0.01" 
                                step="0.01" 
                                placeholder="0.00" 
                                {...fieldProps}
                                value={typeof value === 'number' ? value : ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  onChange(val ? parseFloat(val) : 0);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select 
                              onValueChange={onChange} 
                              defaultValue={value || undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com/image.jpg" 
                              {...fieldProps} 
                              value={value || ""}
                              onChange={(e) => onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter a URL for the item image
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...fieldProps} 
                                value={value || ""}
                                onChange={(e) => onChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input 
                                type="time" 
                                {...fieldProps} 
                                value={value || ""}
                                onChange={(e) => onChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate("/auctions")}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createAuctionMutation.isPending}
                    >
                      {createAuctionMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Create Auction
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
