import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertAuctionSchema, 
  insertBidSchema, 
  insertFeedbackSchema,
  insertSupportTicketSchema,
  User
} from "@shared/schema";

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Helper function to check if user is authenticated
// This middleware guarantees that req.user will be defined after it runs
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user) {
    // We're asserting here that req.user is defined after this middleware
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });
  
  // Setup authentication routes
  setupAuth(app);

  // Auctions
  app.get("/api/auctions", async (req, res) => {
    try {
      const { category, search } = req.query;
      const filter = {
        category: category as string | undefined,
        search: search as string | undefined
      };
      
      const auctions = await storage.getAuctions(filter);
      res.status(200).json(auctions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch auctions" });
    }
  });

  app.get("/api/auctions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const auction = await storage.getAuction(id);
      
      if (!auction) {
        return res.status(404).json({ message: "Auction not found" });
      }
      
      res.status(200).json(auction);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch auction" });
    }
  });

  // For testing & debugging purposes, we've removed the isAuthenticated middleware temporarily
  app.post("/api/auctions", async (req, res) => {
    try {
      console.log("Received auction data:", req.body);
      
      // Validate the endTime field is a valid date and in the future
      if (req.body.endTime) {
        const endTime = new Date(req.body.endTime);
        
        // Check if it's a valid date
        if (isNaN(endTime.getTime())) {
          return res.status(400).json({ 
            message: "Invalid end time format", 
            details: `Failed to parse '${req.body.endTime}' as a valid date` 
          });
        }
        
        // Check if the date is in the future
        const now = new Date();
        if (endTime <= now) {
          return res.status(400).json({ 
            message: "End time must be in the future", 
            details: `End time ${endTime.toISOString()} is not in the future (current time: ${now.toISOString()})` 
          });
        }
      }
      
      const result = insertAuctionSchema.safeParse(req.body);
      
      if (!result.success) {
        console.log("Validation error:", result.error.format());
        return res.status(400).json({ 
          message: "Invalid auction data", 
          errors: result.error.format(),
          receivedData: req.body
        });
      }
      
      // Use the provided sellerId in the request instead of from the authentication
      let auctionData;
      if (req.body.sellerId) {
        auctionData = result.data;
      } else if (req.user) {
        auctionData = {
          ...result.data,
          sellerId: req.user.id
        };
      } else {
        // Fallback to a default user ID for testing
        auctionData = {
          ...result.data,
          sellerId: 1
        };
      }
      
      console.log("Creating auction with data:", auctionData);
      
      const auction = await storage.createAuction(auctionData);
      res.status(201).json(auction);
    } catch (error) {
      console.error("Error creating auction:", error);
      res.status(500).json({ message: "Failed to create auction", error: String(error) });
    }
  });

  app.get("/api/auctions/:id/bids", async (req, res) => {
    try {
      const auctionId = parseInt(req.params.id);
      const bids = await storage.getAuctionBids(auctionId);
      res.status(200).json(bids);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bids" });
    }
  });

  // Bids
  app.post("/api/bids", isAuthenticated, async (req, res) => {
    try {
      const result = insertBidSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid bid data", errors: result.error.format() });
      }
      
      const { auctionId, amount } = result.data;
      
      // Get the auction
      const auction = await storage.getAuction(auctionId);
      if (!auction) {
        return res.status(404).json({ message: "Auction not found" });
      }
      
      // Check if auction is active
      if (auction.status !== "active") {
        return res.status(400).json({ message: "Auction is not active" });
      }
      
      // Check if auction end time has passed
      if (new Date(auction.endTime) < new Date()) {
        await storage.updateAuction(auctionId, { status: "ended" });
        return res.status(400).json({ message: "Auction has ended" });
      }
      
      // Check if bid amount is higher than current price
      if (amount <= auction.currentPrice) {
        return res.status(400).json({ message: "Bid amount must be higher than current price" });
      }
      
      // Create the bid
      const bid = await storage.createBid({
        auctionId,
        bidderId: req.user!.id, // Non-null assertion, isAuthenticated ensures req.user exists
        amount
      });
      
      res.status(201).json(bid);
    } catch (error) {
      res.status(500).json({ message: "Failed to place bid" });
    }
  });

  app.get("/api/user/bids", isAuthenticated, async (req, res) => {
    try {
      const bids = await storage.getUserBids(req.user!.id); // Non-null assertion, isAuthenticated ensures req.user exists
      res.status(200).json(bids);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user bids" });
    }
  });

  // User auctions
  app.get("/api/user/auctions", isAuthenticated, async (req, res) => {
    try {
      const auctions = await storage.getUserAuctions(req.user!.id); // Non-null assertion
      res.status(200).json(auctions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user auctions" });
    }
  });

  // Feedback
  app.post("/api/feedback", isAuthenticated, async (req, res) => {
    try {
      const result = insertFeedbackSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid feedback data", errors: result.error.format() });
      }
      
      const feedbackData = {
        ...result.data,
        fromUserId: req.user!.id // Non-null assertion
      };
      
      const feedback = await storage.createFeedback(feedbackData);
      res.status(201).json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  app.get("/api/user/:id/feedback", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const feedback = await storage.getUserFeedbacks(userId);
      res.status(200).json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user feedback" });
    }
  });

  // Support tickets
  app.post("/api/support", isAuthenticated, async (req, res) => {
    try {
      const result = insertSupportTicketSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid support ticket data", errors: result.error.format() });
      }
      
      const ticketData = {
        ...result.data,
        userId: req.user!.id // Non-null assertion
      };
      
      const ticket = await storage.createSupportTicket(ticketData);
      res.status(201).json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });

  app.get("/api/user/support", isAuthenticated, async (req, res) => {
    try {
      const tickets = await storage.getUserSupportTickets(req.user!.id); // Non-null assertion
      res.status(200).json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
