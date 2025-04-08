import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { UserPlus2, Search, CreditCard, Phone, Mail, MessageSquare } from "lucide-react";

export default function HowItWorks() {
  const [, navigate] = useLocation();
  
  return (
    <section className="py-12 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-neutral-800 mb-3">How BidMaster Works</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">Our auction platform makes buying and selling easy with a simple step-by-step process.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Step 1 */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
            <div className="bg-primary bg-opacity-10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <UserPlus2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-xl mb-2">Sign Up & Verify</h3>
            <p className="text-neutral-600 mb-4">Create your account and verify your identity to start bidding on items.</p>
            <div className="rounded-lg overflow-hidden shadow-md mt-4">
              <img 
                src="https://images.unsplash.com/photo-1499750310107-5fef28a66643" 
                alt="User signing up on laptop" 
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
            <div className="bg-primary bg-opacity-10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-xl mb-2">Find & Bid</h3>
            <p className="text-neutral-600 mb-4">Browse auctions and place bids on items you're interested in purchasing.</p>
            <div className="rounded-lg overflow-hidden shadow-md mt-4">
              <img 
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24" 
                alt="Person bidding on auction" 
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
            <div className="bg-primary bg-opacity-10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-xl mb-2">Win & Pay</h3>
            <p className="text-neutral-600 mb-4">If you win, complete payment securely and arrange for delivery or pickup.</p>
            <div className="rounded-lg overflow-hidden shadow-md mt-4">
              <img 
                src="https://images.unsplash.com/photo-1556741533-6e6a62bd8b49" 
                alt="Secure payment on device" 
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        </div>
        
        {/* Contact Methods Section */}
        <div className="bg-white rounded-lg shadow p-8 mt-12">
          <h2 className="text-2xl font-semibold text-center mb-8">Other Ways to Reach Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-4 rounded-lg hover:bg-neutral-50">
              <Phone className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-medium text-lg mb-1">Phone Support</h3>
              <p className="text-neutral-600 text-center">Call our customer service team at +91 99999 88888</p>
              <p className="text-neutral-500 text-sm mt-2">Mon-Fri, 9AM-6PM IST</p>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-lg hover:bg-neutral-50">
              <Mail className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-medium text-lg mb-1">Email Us</h3>
              <p className="text-neutral-600 text-center">Send your queries to support@bidmaster.com</p>
              <p className="text-neutral-500 text-sm mt-2">We reply within 24 hours</p>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-lg hover:bg-neutral-50">
              <MessageSquare className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-medium text-lg mb-1">Live Chat</h3>
              <p className="text-neutral-600 text-center">Chat with our support team directly through our app</p>
              <p className="text-neutral-500 text-sm mt-2">Available 24/7</p>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Button 
            variant="outline"
            className="text-primary border border-primary hover:bg-neutral-50 px-6 py-3 font-medium"
            onClick={() => navigate("/support")}
          >
            Learn More About the Process
          </Button>
        </div>
      </div>
    </section>
  );
}
