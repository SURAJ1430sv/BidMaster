import Header from "@/components/header";
import Footer from "@/components/footer";
import HeroSection from "@/components/hero-section";
import { useQuery } from "@tanstack/react-query";
import { Auction } from "@shared/schema";
import AuctionCard from "@/components/auction-card";
import CategoryCard from "@/components/category-card";
import HowItWorks from "@/components/how-it-works";
import Testimonials from "@/components/testimonials";
import CallToAction from "@/components/call-to-action";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  // Fetch featured auctions
  const { data: auctions, isLoading: auctionsLoading } = useQuery<Auction[]>({
    queryKey: ["/api/auctions"],
  });

  // Calculate actual category counts from auctions data
  const getCategoryCount = (categoryName: string) => {
    if (!auctions) return 0;
    return auctions.filter(auction => auction.category === categoryName).length;
  };
  
  // Categories with icon names
  const categories = [
    { name: "Electronics", icon: "laptop", count: getCategoryCount("Electronics") },
    { name: "Fashion", icon: "shirt", count: getCategoryCount("Fashion") },
    { name: "Collectibles", icon: "gem", count: getCategoryCount("Collectibles") },
    { name: "Home & Garden", icon: "sofa", count: getCategoryCount("Home & Garden") },
    { name: "Art", icon: "palette", count: getCategoryCount("Art") },
    { name: "Vehicles", icon: "car", count: getCategoryCount("Vehicles") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <HeroSection />

        {/* Featured Auctions */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold text-neutral-800">Featured Auctions</h2>
              <a href="/auctions" className="text-primary hover:text-blue-600 font-medium">
                View All <span className="ml-1">→</span>
              </a>
            </div>
            
            {auctionsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {auctions && auctions.length > 0 ? (
                  auctions.slice(0, 4).map((auction) => (
                    <AuctionCard key={auction.id} auction={auction} />
                  ))
                ) : (
                  <p className="col-span-full text-center text-neutral-600">No auctions available at the moment.</p>
                )}
              </div>
            )}
          </div>
        </section>

        <HowItWorks />

        {/* Categories Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold text-neutral-800">Popular Categories</h2>
              <a href="/auctions" className="text-primary hover:text-blue-600 font-medium">
                All Categories <span className="ml-1">→</span>
              </a>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <CategoryCard 
                  key={category.name} 
                  name={category.name} 
                  icon={category.icon}
                  itemCount={category.count}
                />
              ))}
            </div>
          </div>
        </section>

        <Testimonials />
        <CallToAction />
      </main>

      <Footer />
    </div>
  );
}
