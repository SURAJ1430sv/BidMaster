import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function HowItWorks() {
  const [, navigate] = useLocation();
  
  return (
    <section className="py-12 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-neutral-800 mb-3">How BidMaster Works</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">Our auction platform makes buying and selling easy with a simple step-by-step process.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="text-center">
            <div className="bg-primary bg-opacity-10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="font-semibold text-xl mb-2">Sign Up & Verify</h3>
            <p className="text-neutral-600">Create your account and verify your identity to start bidding on items.</p>
          </div>
          
          {/* Step 2 */}
          <div className="text-center">
            <div className="bg-primary bg-opacity-10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-xl mb-2">Find & Bid</h3>
            <p className="text-neutral-600">Browse auctions and place bids on items you're interested in purchasing.</p>
          </div>
          
          {/* Step 3 */}
          <div className="text-center">
            <div className="bg-primary bg-opacity-10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="font-semibold text-xl mb-2">Win & Pay</h3>
            <p className="text-neutral-600">If you win, complete payment securely and arrange for delivery or pickup.</p>
          </div>
        </div>
        
        <div className="text-center mt-10">
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
