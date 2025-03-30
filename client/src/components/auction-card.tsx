import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Auction } from "@shared/schema";
import { Heart, Info, Clock } from "lucide-react";
import BidModal from "./bid-modal";
import { formatDistanceToNow } from "date-fns";

interface AuctionCardProps {
  auction: Auction;
  isOwner?: boolean;
}

export default function AuctionCard({ auction, isOwner = false }: AuctionCardProps) {
  const [, navigate] = useLocation();
  const [showBidModal, setShowBidModal] = useState(false);
  
  // Calculate if auction is ending soon (less than 24 hours)
  const endTime = new Date(auction.endTime);
  const now = new Date();
  const isEndingSoon = endTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000;
  const isEnded = now > endTime;
  
  // Get badge color and text based on status
  let statusBadge = {
    text: "New",
    bgColor: "bg-blue-500",
  };
  
  if (isEnded || auction.status === "ended") {
    statusBadge = {
      text: "Ended",
      bgColor: "bg-neutral-600",
    };
  } else if (isEndingSoon) {
    statusBadge = {
      text: "Ending Soon",
      bgColor: "bg-yellow-500",
    };
  }

  // Format currency (Indian Rupees)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0, // No decimal points for INR
    }).format(amount);
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative">
          <img 
            src={
              // Check if URL is a Google search URL and replace with a direct image URL
              auction.imageUrl?.includes("google.com/url") 
                ? "https://content.rolex.com/dam/model-page/showcase/m126200-0001-datejust/model-showcase-homepage-landscape-m126200-0001-datejust-x.jpg"
                : (auction.imageUrl || "https://placehold.co/400x300?text=No+Image")
            } 
            alt={auction.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              // If image fails to load, replace with a fallback image
              const target = e.target as HTMLImageElement;
              target.src = "https://placehold.co/400x300?text=Image+Error";
            }}
          />
          <div className="absolute top-2 left-2">
            <Badge className={`${statusBadge.bgColor} text-white text-xs font-semibold`}>
              {statusBadge.text}
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute top-2 right-2 text-neutral-600 hover:text-primary bg-white rounded-full p-2 shadow-sm"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 text-neutral-800 line-clamp-1">{auction.title}</h3>
          <div className="flex justify-between items-center mb-3">
            <div className="text-neutral-600 text-sm flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {isEnded 
                ? "Auction ended" 
                : `Ends in ${formatDistanceToNow(endTime)}`
              }
            </div>
            <div className="text-sm">
              <span className="text-neutral-600">Category: </span>
              <span className="font-semibold">{auction.category}</span>
            </div>
          </div>
          <div className="mb-4">
            <div className="text-sm text-neutral-600 mb-1">Current bid:</div>
            <div className="flex items-baseline">
              <span className="text-xl font-bold text-neutral-800">
                {formatCurrency(auction.currentPrice)}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            {isOwner || isEnded ? (
              <Button 
                variant={isOwner ? "secondary" : "outline"}
                className="flex-grow"
                onClick={() => navigate(`/auctions/${auction.id}`)}
              >
                {isOwner ? "Manage Auction" : "View Details"}
              </Button>
            ) : (
              <Button 
                className="flex-grow" 
                onClick={() => setShowBidModal(true)}
              >
                Bid Now
              </Button>
            )}
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate(`/auctions/${auction.id}`)}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {showBidModal && (
        <BidModal 
          auction={auction} 
          onClose={() => setShowBidModal(false)} 
        />
      )}
    </>
  );
}
