import { 
  User, InsertUser, 
  Auction, InsertAuction, 
  Bid, InsertBid, 
  Feedback, InsertFeedback, 
  SupportTicket, InsertSupportTicket 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Auction operations
  getAuction(id: number): Promise<Auction | undefined>;
  getAuctions(filter?: { category?: string; search?: string }): Promise<Auction[]>;
  getUserAuctions(userId: number): Promise<Auction[]>;
  createAuction(auction: InsertAuction): Promise<Auction>;
  updateAuction(id: number, auction: Partial<Auction>): Promise<Auction | undefined>;
  
  // Bid operations
  getBid(id: number): Promise<Bid | undefined>;
  getAuctionBids(auctionId: number): Promise<Bid[]>;
  getUserBids(userId: number): Promise<Bid[]>;
  createBid(bid: InsertBid): Promise<Bid>;
  
  // Feedback operations
  getFeedback(id: number): Promise<Feedback | undefined>;
  getUserFeedbacks(userId: number): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  
  // Support ticket operations
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  getUserSupportTickets(userId: number): Promise<SupportTicket[]>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private auctions: Map<number, Auction>;
  private bids: Map<number, Bid>;
  private feedbacks: Map<number, Feedback>;
  private supportTickets: Map<number, SupportTicket>;
  sessionStore: session.SessionStore;
  
  private userId: number = 1;
  private auctionId: number = 1;
  private bidId: number = 1;
  private feedbackId: number = 1;
  private supportTicketId: number = 1;

  constructor() {
    this.users = new Map();
    this.auctions = new Map();
    this.bids = new Map();
    this.feedbacks = new Map();
    this.supportTickets = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  // Auction methods
  async getAuction(id: number): Promise<Auction | undefined> {
    return this.auctions.get(id);
  }

  async getAuctions(filter?: { category?: string; search?: string }): Promise<Auction[]> {
    let auctions = Array.from(this.auctions.values());
    
    if (filter?.category) {
      auctions = auctions.filter(auction => auction.category === filter.category);
    }
    
    if (filter?.search) {
      const searchLower = filter.search.toLowerCase();
      auctions = auctions.filter(auction => 
        auction.title.toLowerCase().includes(searchLower) || 
        auction.description.toLowerCase().includes(searchLower)
      );
    }
    
    return auctions;
  }

  async getUserAuctions(userId: number): Promise<Auction[]> {
    return Array.from(this.auctions.values()).filter(
      auction => auction.sellerId === userId
    );
  }

  async createAuction(insertAuction: InsertAuction): Promise<Auction> {
    const id = this.auctionId++;
    const now = new Date();
    const auction: Auction = { 
      ...insertAuction, 
      id, 
      currentPrice: insertAuction.startingPrice,
      status: "active", // Explicitly set status to active
      createdAt: now 
    };
    this.auctions.set(id, auction);
    return auction;
  }

  async updateAuction(id: number, auctionUpdate: Partial<Auction>): Promise<Auction | undefined> {
    const existingAuction = this.auctions.get(id);
    if (!existingAuction) return undefined;
    
    const updatedAuction = { ...existingAuction, ...auctionUpdate };
    this.auctions.set(id, updatedAuction);
    return updatedAuction;
  }

  // Bid methods
  async getBid(id: number): Promise<Bid | undefined> {
    return this.bids.get(id);
  }

  async getAuctionBids(auctionId: number): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter(
      bid => bid.auctionId === auctionId
    );
  }

  async getUserBids(userId: number): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter(
      bid => bid.bidderId === userId
    );
  }

  async createBid(insertBid: InsertBid): Promise<Bid> {
    const id = this.bidId++;
    const now = new Date();
    const bid: Bid = { ...insertBid, id, createdAt: now };
    this.bids.set(id, bid);
    
    // Update the auction's current price
    const auction = this.auctions.get(insertBid.auctionId);
    if (auction && insertBid.amount > auction.currentPrice) {
      auction.currentPrice = insertBid.amount;
      this.auctions.set(auction.id, auction);
    }
    
    return bid;
  }

  // Feedback methods
  async getFeedback(id: number): Promise<Feedback | undefined> {
    return this.feedbacks.get(id);
  }

  async getUserFeedbacks(userId: number): Promise<Feedback[]> {
    return Array.from(this.feedbacks.values()).filter(
      feedback => feedback.toUserId === userId
    );
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = this.feedbackId++;
    const now = new Date();
    const feedback: Feedback = { ...insertFeedback, id, createdAt: now };
    this.feedbacks.set(id, feedback);
    return feedback;
  }

  // Support ticket methods
  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    return this.supportTickets.get(id);
  }

  async getUserSupportTickets(userId: number): Promise<SupportTicket[]> {
    return Array.from(this.supportTickets.values()).filter(
      ticket => ticket.userId === userId
    );
  }

  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const id = this.supportTicketId++;
    const now = new Date();
    const ticket: SupportTicket = { ...insertTicket, id, createdAt: now };
    this.supportTickets.set(id, ticket);
    return ticket;
  }
}

export const storage = new MemStorage();
