import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface AuctionFiltersProps {
  onFilterChange: (filters: { category?: string; search?: string }) => void;
}

export default function AuctionFilters({ onFilterChange }: AuctionFiltersProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Categories
  const categories = [
    "All Categories",
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

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [search]);

  // Call parent filter function when filters change
  useEffect(() => {
    const filters: { category?: string; search?: string } = {};
    
    if (debouncedSearch) {
      filters.search = debouncedSearch;
    }
    
    if (category && category !== "All Categories") {
      filters.category = category;
    }
    
    onFilterChange(filters);
  }, [debouncedSearch, category, onFilterChange]);

  const handleCategoryChange = (value: string) => {
    setCategory(value);
  };

  const handleReset = () => {
    setSearch("");
    setCategory("");
    onFilterChange({});
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-grow">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-neutral-400" />
          </span>
          <Input
            type="text"
            placeholder="Search for auctions..."
            className="pl-10 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2">
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleReset}
          >
            <Filter className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
