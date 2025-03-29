import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const [, navigate] = useLocation();
  
  return (
    <section className="bg-primary bg-opacity-5">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="md:flex items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-800 mb-4">
              Discover Exclusive Auctions and Get the Best Deals
            </h1>
            <p className="text-lg text-neutral-600 mb-6">
              Find rare collectibles, electronics, fashion items and more. Start bidding today!
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button 
                className="bg-primary text-white hover:bg-blue-600 px-6 py-3"
                onClick={() => navigate("/auctions")}
              >
                Browse Auctions
              </Button>
              <Button 
                variant="outline" 
                className="text-primary border border-primary hover:bg-neutral-50 px-6 py-3"
                onClick={() => navigate("/create-auction")}
              >
                Sell Your Item
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 md:pl-8">
            <img 
              src="https://images.unsplash.com/photo-1605165566807-508fb529cf3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
              alt="Auction items collection" 
              className="rounded-lg shadow-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
