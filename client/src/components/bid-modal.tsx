import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Auction } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface BidModalProps {
  auction: Auction;
  onClose: () => void;
}

export default function BidModal({ auction, onClose }: BidModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bidAmount, setBidAmount] = useState(auction.currentPrice + 1);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate minimum bid increment (5% of current price or $1, whichever is higher)
  const minIncrement = Math.max(1, auction.currentPrice * 0.05);
  const minBid = auction.currentPrice + minIncrement;

  // Bid mutation
  const bidMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!user) {
        throw new Error("You must be logged in to place a bid");
      }
      
      const res = await apiRequest("POST", "/api/bids", {
        auctionId: auction.id,
        amount,
      });
      
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate auction and bids queries to refresh the data
      queryClient.invalidateQueries({ queryKey: [`/api/auctions/${auction.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/auctions/${auction.id}/bids`] });
      queryClient.invalidateQueries({ queryKey: ["/api/auctions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/bids"] });
      
      toast({
        title: "Bid Placed",
        description: `Your bid of ${formatCurrency(bidAmount)} has been placed!`,
      });
      
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Bid Failed",
        description: error.message || "Failed to place bid. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setBidAmount(isNaN(value) ? 0 : value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (bidAmount < minBid) {
      toast({
        title: "Bid Too Low",
        description: `Your bid must be at least ${formatCurrency(minBid)}`,
        variant: "destructive",
      });
      return;
    }
    
    if (!agreeTerms) {
      toast({
        title: "Terms Agreement Required",
        description: "You must agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }
    
    bidMutation.mutate(bidAmount);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Place a Bid</DialogTitle>
          <DialogDescription>
            Auction #{auction.id}: {auction.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-neutral-50 p-4 rounded-md my-4">
          <div className="flex justify-between mb-2">
            <span className="text-neutral-600">Current bid:</span>
            <span className="font-semibold">{formatCurrency(auction.currentPrice)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-neutral-600">Minimum bid increment:</span>
            <span>{formatCurrency(minIncrement)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Your minimum bid:</span>
            <span className="font-semibold text-primary">{formatCurrency(minBid)}</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="bidAmount">Your Bid (USD)</Label>
            <Input
              id="bidAmount"
              type="number"
              min={minBid}
              step="0.01"
              value={bidAmount}
              onChange={handleBidAmountChange}
              className="text-right"
            />
          </div>
          
          <div className="mb-6 flex items-start space-x-2">
            <Checkbox 
              id="agreeTerms" 
              checked={agreeTerms} 
              onCheckedChange={(checked) => setAgreeTerms(checked === true)}
            />
            <Label htmlFor="agreeTerms" className="text-sm text-neutral-600 leading-tight">
              I agree to the <a href="#" className="text-primary">Terms and Conditions</a> and understand that all bids are binding.
            </Label>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="sm:w-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="sm:w-full"
              disabled={bidMutation.isPending || bidAmount < minBid || !agreeTerms}
            >
              {bidMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Place Bid
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
