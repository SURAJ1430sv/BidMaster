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
import { Loader2 } from "lucide-react";
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

  // Helper to get unique auctions user has bid on
  const getBidAuctions = () => {
    if (!userBids || !userBids.length) return [];
    
    // Get unique auction IDs
    const uniqueAuctionIds = [...new Set(userBids.map(bid => bid.auctionId))];
    
    // For each unique auction ID, get the highest bid made by the user
    return uniqueAuctionIds.map(auctionId => {
      const auctionBids = userBids.filter(bid => bid.auctionId === auctionId);
      const highestBid = auctionBids.reduce((prev, current) => 
        prev.amount > current.amount ? prev : current
      );
      
      return {
        auctionId,
        highestBid
      };
    });
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
                    <div className="text-center py-12">
                      <p className="text-neutral-600">You haven't won any auctions yet.</p>
                    </div>
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
