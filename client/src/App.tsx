import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuctionsPage from "@/pages/auctions-page";
import AuctionDetailPage from "@/pages/auction-detail-page";
import CreateAuctionPage from "@/pages/create-auction-page";
import ProfilePage from "@/pages/profile-page";
import SupportPage from "@/pages/support-page";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auctions" component={AuctionsPage} />
      <Route path="/auctions/:id" component={AuctionDetailPage} />
      {/* Temporarily making create-auction accessible without auth for testing */}
      <Route path="/create-auction" component={CreateAuctionPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route path="/support" component={SupportPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
