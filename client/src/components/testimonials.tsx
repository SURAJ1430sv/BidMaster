import { useQuery } from "@tanstack/react-query";
import { Feedback, User } from "@shared/schema";
import { Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Testimonials() {
  // Fetch actual user feedback from the API
  const { data: feedbacks, isLoading } = useQuery<Feedback[]>({
    queryKey: ["/api/feedbacks"],
  });

  // Fetch users data to display names
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Generate star rating based on score
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <svg key="half" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    // Add empty stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-300" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    return stars;
  };

  // Helper function to get user name by ID
  const getUserName = (userId: number) => {
    if (!users) return "User";
    const user = users.find(u => u.id === userId);
    return user ? user.username : "User";
  };

  // Use default avatar if user doesn't have a profile image
  const getAvatarUrl = (userId: number) => {
    if (!users) return "https://ui-avatars.com/api/?name=User";
    const user = users.find(u => u.id === userId);
    return user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "User")}`;
  };

  return (
    <section className="py-12 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-neutral-800 mb-3">What Our Users Say</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">Discover why thousands of buyers and sellers trust BidMaster.</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {feedbacks && feedbacks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {feedbacks.map((feedback) => (
                  <div key={feedback.id} className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <img 
                        src={getAvatarUrl(feedback.fromUserId)} 
                        alt={getUserName(feedback.fromUserId)} 
                        className="w-12 h-12 rounded-full mr-4 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserName(feedback.fromUserId))}`;
                        }}
                      />
                      <div>
                        <h4 className="font-semibold text-neutral-800">{getUserName(feedback.fromUserId)}</h4>
                        <div className="flex">
                          {renderStars(feedback.rating)}
                        </div>
                      </div>
                    </div>
                    <p className="text-neutral-600">{feedback.comment || "Great experience with this auction!"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <MessageSquare className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
                <h3 className="text-lg font-medium text-neutral-800 mb-2">No Feedback Yet</h3>
                <p className="text-neutral-600 mb-6">Be the first to share your experience with BidMaster!</p>
                <Link href="/auctions">
                  <Button>Browse Auctions</Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
