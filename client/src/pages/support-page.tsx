import Header from "@/components/header";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { insertSupportTicketSchema } from "@shared/schema";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function SupportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Define form
  const form = useForm({
    resolver: zodResolver(insertSupportTicketSchema.omit({ userId: true })),
    defaultValues: {
      subject: "",
      message: "",
    },
  });

  // Support ticket creation mutation
  const createTicketMutation = useMutation({
    mutationFn: async (data: { subject: string; message: string }) => {
      if (!user) {
        throw new Error("You must be logged in to submit a support ticket");
      }
      
      const res = await apiRequest("POST", "/api/support", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Support Ticket Submitted",
        description: "We've received your support request and will respond shortly.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit support ticket. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: { subject: string; message: string }) => {
    createTicketMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-neutral-800 mb-2 text-center">Customer Support</h1>
            <p className="text-neutral-600 text-center mb-8">We're here to help with any questions or issues you may have</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Support Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Us</CardTitle>
                  <CardDescription>
                    Fill out this form and we'll get back to you as soon as possible
                  </CardDescription>
                </CardHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="What is your inquiry about?" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Please describe your issue in detail" 
                                className="min-h-[150px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {!user && (
                        <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                          <p className="text-amber-700 text-sm">
                            You need to <a href="/auth" className="font-semibold underline">log in</a> to submit a support request.
                          </p>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={createTicketMutation.isPending || !user}
                      >
                        {createTicketMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Submit Request
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
              
              {/* FAQs */}
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Quick answers to common questions
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-neutral-800 mb-1">How do I place a bid?</h3>
                    <p className="text-neutral-600 text-sm">
                      Navigate to any active auction and click the "Bid Now" button. Enter your bid amount and confirm.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-neutral-800 mb-1">What happens when I win an auction?</h3>
                    <p className="text-neutral-600 text-sm">
                      You'll receive a notification and will need to complete payment within 48 hours. You can view your won auctions in your profile.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-neutral-800 mb-1">How do I create an auction?</h3>
                    <p className="text-neutral-600 text-sm">
                      Click on "Create Auction" and fill out the required information including title, description, starting price, and end time.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-neutral-800 mb-1">What payment methods are accepted?</h3>
                    <p className="text-neutral-600 text-sm">
                      We currently accept credit/debit cards and PayPal for all transactions.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-neutral-800 mb-1">How do I leave feedback?</h3>
                    <p className="text-neutral-600 text-sm">
                      After a transaction is complete, you can leave feedback for the seller or buyer through the completed auction page.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Contact Information */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">Other Ways to Reach Us</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-neutral-800 mb-1">Email Us</h3>
                  <p className="text-neutral-600 text-sm">support@bidmaster.com</p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-neutral-800 mb-1">Call Us</h3>
                  <p className="text-neutral-600 text-sm">+1 (555) 123-4567</p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-neutral-800 mb-1">Live Chat</h3>
                  <p className="text-neutral-600 text-sm">Available 9 AM - 5 PM EST</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
