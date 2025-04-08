import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Auction, Bid, Feedback } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CreditCard } from "lucide-react";
import AuctionCard from "@/components/auction-card";
import PaymentModal from "@/components/payment-modal";
import { format } from "date-fns";

export default function ProfilePage() {
  const { user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  
  // Fetch user's auctions
  const { data: userAuctions, isLoading: auctionsLoading } = useQuery<Auction[]>({
    queryKey: ["/api/user/auctions"],
    enabled: !!user,
  });
  
  // Fetch user's bids
  const { data: userBids, isLoading: bidsLoading } = useQuery<Bid[]>({
    queryKey: ["/api/user/bids"],
    enabled: !!user,
  });
  
  // Fetch all auctions to cross-reference with bids
  const { data: allAuctions, isLoading: allAuctionsLoading } = useQuery<Auction[]>({
    queryKey: ["/api/auctions"],
    enabled: !!user,
  });

  // Helper to get unique auctions user has bid on
  const getBidAuctions = () => {
    if (!userBids || !userBids.length) return [];
    
    // Get unique auction IDs
    const uniqueAuctionIds = Array.from(new Set(userBids.map(bid => bid.auctionId)));
    
    // For each unique auction ID, get the highest bid made by the user
    return uniqueAuctionIds.map(auctionId => {
      const auctionBids = userBids.filter(bid => bid.auctionId === auctionId);
      const highestBid = auctionBids.reduce((prev, current) => 
        prev.amount > current.amount ? prev : current
      );
      
      // Find the full auction details
      const auction = allAuctions?.find(a => a.id === auctionId);
      
      return {
        auctionId,
        highestBid,
        auction
      };
    });
  };
  
  // Helper to get auctions the user has won
  const getWonAuctions = () => {
    if (!userBids || !userBids.length || !allAuctions || !allAuctions.length) return [];
    
    // Get all bid auctions
    const bidAuctions = getBidAuctions();
    
    // Filter for completed auctions where user's highest bid matches the final price
    return bidAuctions.filter(({ auction, highestBid }) => {
      // Auction has ended
      const hasEnded = auction?.endTime ? new Date(auction.endTime) < new Date() : false;
      
      // User's bid is the highest
      const isWinner = auction?.currentPrice === highestBid.amount;
      
      return hasEnded && isWinner;
    }).map(({ auction }) => auction).filter(Boolean) as Auction[];
  };

  const handlePayment = (auction: Auction) => {
    setSelectedAuction(auction);
    setShowPaymentModal(true);
  };

  // Format initials for avatar
  const getInitials = () => {
    if (!user || !user.fullName) return user?.username?.[0]?.toUpperCase() || '?';
    
    return user.fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-12 flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-24 w-24">
                  {user.profileImage ? (
                    <AvatarImage src={user.profileImage} alt={user.username} />
                  ) : null}
                  <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
                </Avatar>
                
                <div className="flex-grow text-center md:text-left">
                  <h1 className="text-2xl font-bold text-neutral-800">
                    {user.fullName || user.username}
                  </h1>
                  <p className="text-neutral-600">@{user.username}</p>
                  <p className="text-neutral-600 mt-1">
                    Member since {format(new Date(user.createdAt), 'MMMM yyyy')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Profile Content */}
            <Tabs defaultValue="myauctions">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="myauctions">My Auctions</TabsTrigger>
                <TabsTrigger value="bids">My Bids</TabsTrigger>
                <TabsTrigger value="won">Won Auctions</TabsTrigger>
              </TabsList>
              
              {/* My Auctions Tab */}
              <TabsContent value="myauctions">
                <Card>
                  <CardHeader>
                    <CardTitle>My Auctions</CardTitle>
                    <CardDescription>
                      Auctions you have created and are selling
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {auctionsLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : userAuctions && userAuctions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userAuctions.map(auction => (
                          <AuctionCard 
                            key={auction.id} 
                            auction={auction} 
                            isOwner={true}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-neutral-600 mb-2">You haven't created any auctions yet.</p>
                        <a 
                          href="/create-auction" 
                          className="text-primary hover:underline"
                        >
                          Create your first auction
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* My Bids Tab */}
              <TabsContent value="bids">
                <Card>
                  <CardHeader>
                    <CardTitle>My Bids</CardTitle>
                    <CardDescription>
                      Auctions you have bid on
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bidsLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : userBids && userBids.length > 0 ? (
                      <div className="space-y-4">
                        {getBidAuctions().map(({ auctionId, highestBid }) => (
                          <div 
                            key={auctionId}
                            className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">Auction #{auctionId}</p>
                              <p className="text-sm text-neutral-600">
                                Your highest bid: ${highestBid.amount.toFixed(2)}
                              </p>
                            </div>
                            <a 
                              href={`/auctions/${auctionId}`}
                              className="text-primary hover:underline text-sm"
                            >
                              View Auction
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-neutral-600 mb-2">You haven't placed any bids yet.</p>
                        <a href="/auctions" className="text-primary hover:underline">
                          Browse auctions
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Won Auctions Tab */}
              <TabsContent value="won">
                <Card>
                  <CardHeader>
                    <CardTitle>Won Auctions</CardTitle>
                    <CardDescription>
                      Auctions you have won and need to complete payment for
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {allAuctionsLoading || bidsLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        {getWonAuctions().length > 0 ? (
                          <div className="space-y-6">
                            {getWonAuctions().map(auction => (
                              <div 
                                key={auction.id}
                                className="flex flex-col md:flex-row gap-6 p-6 bg-white border rounded-lg shadow-sm"
                              >
                                <div className="w-full md:w-1/4 max-w-[300px] mx-auto md:mx-0">
                                  <div className="aspect-square rounded-md overflow-hidden bg-neutral-100">
                                    {auction.imageUrl ? (
                                      <img 
                                        src={auction.imageUrl} 
                                        alt={auction.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = 'https://placehold.co/300x300/e6e6e6/a6a6a6?text=No+Image';
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400">
                                        No Image
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex-grow">
                                  <h3 className="text-xl font-semibold mb-2">{auction.title}</h3>
                                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4">
                                    <div>
                                      <p className="text-sm text-neutral-500">Final Price</p>
                                      <p className="font-medium text-primary">
                                        {new Intl.NumberFormat('en-IN', {
                                          style: 'currency',
                                          currency: 'INR',
                                          maximumFractionDigits: 0,
                                        }).format(auction.currentPrice)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-neutral-500">End Date</p>
                                      <p className="font-medium">
                                        {format(new Date(auction.endTime), 'dd MMM yyyy')}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-neutral-500">Category</p>
                                      <p className="font-medium capitalize">{auction.category}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-neutral-500">Status</p>
                                      <p className="font-medium">
                                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                          Won
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-3 mt-4">
                                    <button
                                      className="px-4 py-2 bg-primary text-white rounded-md font-medium flex items-center gap-2"
                                      onClick={() => handlePayment(auction)}
                                    >
                                      <CreditCard className="h-4 w-4" />
                                      Complete Payment
                                    </button>
                                    <a
                                      href={`/auctions/${auction.id}`}
                                      className="px-4 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-md font-medium hover:bg-neutral-50"
                                    >
                                      View Details
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <p className="text-neutral-600">You haven't won any auctions yet.</p>
                            <a href="/auctions" className="text-primary hover:underline mt-2 inline-block">
                              Browse active auctions
                            </a>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
      
      {showPaymentModal && selectedAuction && (
        <PaymentModal 
          auction={selectedAuction} 
          onClose={() => setShowPaymentModal(false)} 
        />
      )}
    </div>
  );
}
