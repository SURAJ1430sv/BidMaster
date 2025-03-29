import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function CallToAction() {
  const [, navigate] = useLocation();
  
  return (
    <section className="py-12 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">Ready to Start Bidding?</h2>
        <p className="text-white text-opacity-90 max-w-2xl mx-auto mb-8">Join thousands of users who buy and sell on BidMaster every day. Registration is free and only takes a minute.</p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button 
            variant="secondary"
            className="bg-white text-primary hover:bg-neutral-100 px-8 py-3"
            onClick={() => navigate("/auth")}
          >
            Create Account
          </Button>
          <Button 
            variant="outline"
            className="bg-transparent text-white border border-white hover:bg-white hover:bg-opacity-10 px-8 py-3"
            onClick={() => navigate("/auctions")}
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}
