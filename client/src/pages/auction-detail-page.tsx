import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Auction, Bid } from "@shared/schema";
import { useParams, useLocation } from "wouter";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Clock, User, ShoppingBag, DollarSign, Info, Heart, Trash2, XCircle } from "lucide-react";
import BidModal from "@/components/bid-modal";
import { useAuth } from "@/hooks/use-auth";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AuctionDetailPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const auctionId = parseInt(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [showBidModal, setShowBidModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const queryClient = useQueryClient();

  // Fetch auction details
  const { data: auction, isLoading: auctionLoading } = useQuery<Auction>({
    queryKey: [`/api/auctions/${auctionId}`],
  });

  // Fetch auction bids
  const { data: bids, isLoading: bidsLoading } = useQuery<Bid[]>({
    queryKey: [`/api/auctions/${auctionId}/bids`],
    enabled: !!auction,
  });

  // Close auction mutation
  const closeAuctionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/auctions/${auctionId}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to close auction');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/auctions/${auctionId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/auctions'] });
      toast({
        title: "Auction closed",
        description: "The auction has been closed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to close the auction. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete auction mutation
  const deleteAuctionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/auctions/${auctionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete auction');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auctions'] });
      toast({
        title: "Auction deleted",
        description: "The auction has been deleted successfully.",
      });
      navigate('/auctions');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete the auction. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Close bid mutation
  const closeBidMutation = useMutation({
    mutationFn: async (bidId: number) => {
      const response = await fetch(`/api/bids/${bidId}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to close bid');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/auctions/${auctionId}/bids`] });
      toast({
        title: "Bid closed",
        description: "Your bid has been closed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to close the bid. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCloseAuction = () => {
    closeAuctionMutation.mutate();
  };

  const handleDeleteAuction = () => {
    deleteAuctionMutation.mutate();
  };

  const handleCloseBid = (bidId: number) => {
    closeBidMutation.mutate(bidId);
  };

  if (auctionLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-12 flex-grow">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-neutral-800 mb-4">Auction Not Found</h1>
            <p className="text-neutral-600 mb-6">The auction you are looking for doesn't exist or has been removed.</p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate auction status and remaining time
  const now = new Date();
  const endTime = new Date(auction.endTime);
  const isEnded = now > endTime;
  const status = isEnded ? "ended" : auction.status;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Auction Image */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                {auction.imageUrl ? (
                  <img 
                    src={auction.imageUrl} 
                    alt={auction.title} 
                    className="w-full h-96 object-cover"
                  />
                ) : (
                  <div className="w-full h-96 bg-neutral-100 flex items-center justify-center">
                    <p className="text-neutral-400">No image available</p>
                  </div>
                )}
              </div>
              
              {/* Auction Description */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-700 whitespace-pre-line">{auction.description}</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Auction Details */}
            <div>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <Badge 
                      className={`${
                        status === "active" 
                          ? "bg-green-500" 
                          : status === "ended" 
                            ? "bg-neutral-500" 
                            : "bg-red-500"
                      }`}
                    >
                      {status === "active" ? "Active" : status === "ended" ? "Ended" : "Cancelled"}
                    </Badge>
                    <Badge variant="outline">{auction.category}</Badge>
                  </div>
                  <CardTitle className="text-2xl mt-2">{auction.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <div className="text-sm text-neutral-600 mb-1">Current bid:</div>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-neutral-800">
                        {formatCurrency(auction.currentPrice)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-neutral-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {isEnded
                          ? "Auction ended"
                          : `Ends in ${formatDistanceToNow(endTime)}`}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-neutral-600">Bids: </span>
                      <span className="font-semibold">{bids?.length || 0}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-b border-neutral-100 py-4 my-4">
                    <div className="flex items-center text-sm text-neutral-600 mb-2">
                      <User className="w-4 h-4 mr-2" />
                      <span>Seller: User #{auction.sellerId}</span>
                    </div>
                    <div className="flex items-center text-sm text-neutral-600">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      <span>Added: {format(new Date(auction.createdAt), 'PPP')}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      className="flex-grow"
                      disabled={isEnded || !user || user.id === auction.sellerId}
                      onClick={() => setShowBidModal(true)}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Place Bid
                    </Button>
                    <Button variant="outline">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {!user && (
                    <p className="text-sm text-neutral-600 text-center mt-2">
                      You need to <a href="/auth" className="text-primary">login</a> to place a bid
                    </p>
                  )}
                  
                  {user && user.id === auction.sellerId && (
                    <div className="flex space-x-2">
                      <Button 
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isEnded || auction.status === "cancelled"}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Auction
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleCloseAuction}
                        disabled={isEnded || auction.status === "cancelled"}
                        className="flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Close Auction
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Bids History */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Bid History</CardTitle>
                </CardHeader>
                <CardContent>
                  {bidsLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : bids && bids.length > 0 ? (
                    <div className="space-y-3">
                      {[...bids].sort((a, b) => 
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                      ).map((bid) => (
                        <div key={bid.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                          <div className="flex items-center">
                            <Avatar className="h-7 w-7 mr-2">
                              <AvatarFallback>{bid.bidderId.toString()[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">User #{bid.bidderId}</p>
                              <p className="text-xs text-neutral-500">
                                {format(new Date(bid.createdAt), 'PP')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{formatCurrency(bid.amount)}</p>
                            {user && user.id === bid.bidderId && bid.status === "active" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCloseBid(bid.id)}
                                disabled={closeBidMutation.isPending}
                                className="h-8 w-8 p-0"
                              >
                                {closeBidMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-600 text-center py-4">No bids yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Auction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this auction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAuction}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Bid Modal */}
      {showBidModal && (
        <BidModal 
          auction={auction} 
          onClose={() => setShowBidModal(false)} 
        />
      )}
    </div>
  );
}
