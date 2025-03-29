import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useQuery } from "@tanstack/react-query";
import { Auction } from "@shared/schema";
import AuctionCard from "@/components/auction-card";
import AuctionFilters from "@/components/auction-filters";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function AuctionsPage() {
  const [, navigate] = useLocation();
  const [filters, setFilters] = useState({
    category: "",
    search: "",
  });

  // Build query key based on filters
  const queryKey = ["/api/auctions"];
  const queryParams = new URLSearchParams();
  
  if (filters.category) {
    queryParams.append("category", filters.category);
  }
  
  if (filters.search) {
    queryParams.append("search", filters.search);
  }
  
  const queryString = queryParams.toString();
  const fullQueryKey = queryString ? `${queryKey}?${queryString}` : queryKey;

  // Fetch auctions with filters
  const { data: auctions, isLoading } = useQuery<Auction[]>({
    queryKey: [fullQueryKey],
  });

  const handleFilterChange = (newFilters: { category?: string; search?: string }) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-2">Browse Auctions</h1>
              <p className="text-neutral-600">Discover items from various categories</p>
            </div>
            
            <Button 
              className="mt-4 md:mt-0" 
              onClick={() => navigate("/create-auction")}
            >
              Create Auction
            </Button>
          </div>
          
          <AuctionFilters onFilterChange={handleFilterChange} />
          
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {auctions && auctions.length > 0 ? (
                auctions.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))
              ) : (
                <div className="col-span-full py-16 text-center">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">No auctions found</h3>
                  <p className="text-neutral-600 mb-6">Try adjusting your filters or search term</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({ category: "", search: "" })}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
