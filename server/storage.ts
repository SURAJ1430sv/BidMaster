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
  
  // File paths for persisting data
  private DATA_DIR = './data';
  private USERS_FILE = './data/users.json';
  private AUCTIONS_FILE = './data/auctions.json';
  private BIDS_FILE = './data/bids.json';
  private FEEDBACKS_FILE = './data/feedbacks.json';
  private TICKETS_FILE = './data/tickets.json';
  private COUNTERS_FILE = './data/counters.json';

  constructor() {
    // Initialize empty maps
    this.users = new Map();
    this.auctions = new Map();
    this.bids = new Map();
    this.feedbacks = new Map();
    this.supportTickets = new Map();
    
    // Setup session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Load data from file if exists
    this.loadDataFromFiles();
  }
  
  // Load data from JSON files
  private loadDataFromFiles() {
    try {
      const fs = require('fs');
      
      // Create data directory if it doesn't exist
      if (!fs.existsSync(this.DATA_DIR)) {
        fs.mkdirSync(this.DATA_DIR, { recursive: true });
        console.log(`Created data directory: ${this.DATA_DIR}`);
        // If directory didn't exist, return as there's no data to load
        return;
      }
      
      // Load counters
      if (fs.existsSync(this.COUNTERS_FILE)) {
        const counters = JSON.parse(fs.readFileSync(this.COUNTERS_FILE, 'utf8'));
        this.userId = counters.userId || 1;
        this.auctionId = counters.auctionId || 1;
        this.bidId = counters.bidId || 1;
        this.feedbackId = counters.feedbackId || 1;
        this.supportTicketId = counters.supportTicketId || 1;
        console.log('Loaded counters:', counters);
      }
      
      // Load users
      if (fs.existsSync(this.USERS_FILE)) {
        const users = JSON.parse(fs.readFileSync(this.USERS_FILE, 'utf8'));
        users.forEach((user: User) => {
          this.users.set(user.id, user);
        });
        console.log(`Loaded ${this.users.size} users from storage`);
      }
      
      // Load auctions
      if (fs.existsSync(this.AUCTIONS_FILE)) {
        const auctions = JSON.parse(fs.readFileSync(this.AUCTIONS_FILE, 'utf8'));
        auctions.forEach((auction: Auction) => {
          // Parse date strings back to Date objects
          auction.endTime = new Date(auction.endTime);
          auction.createdAt = new Date(auction.createdAt);
          this.auctions.set(auction.id, auction);
        });
        console.log(`Loaded ${this.auctions.size} auctions from storage`);
      }
      
      // Load bids
      if (fs.existsSync(this.BIDS_FILE)) {
        const bids = JSON.parse(fs.readFileSync(this.BIDS_FILE, 'utf8'));
        bids.forEach((bid: Bid) => {
          bid.createdAt = new Date(bid.createdAt);
          this.bids.set(bid.id, bid);
        });
        console.log(`Loaded ${this.bids.size} bids from storage`);
      }
      
      // Load feedbacks
      if (fs.existsSync(this.FEEDBACKS_FILE)) {
        const feedbacks = JSON.parse(fs.readFileSync(this.FEEDBACKS_FILE, 'utf8'));
        feedbacks.forEach((feedback: Feedback) => {
          feedback.createdAt = new Date(feedback.createdAt);
          this.feedbacks.set(feedback.id, feedback);
        });
        console.log(`Loaded ${this.feedbacks.size} feedbacks from storage`);
      }
      
      // Load support tickets
      if (fs.existsSync(this.TICKETS_FILE)) {
        const tickets = JSON.parse(fs.readFileSync(this.TICKETS_FILE, 'utf8'));
        tickets.forEach((ticket: SupportTicket) => {
          ticket.createdAt = new Date(ticket.createdAt);
          this.supportTickets.set(ticket.id, ticket);
        });
        console.log(`Loaded ${this.supportTickets.size} support tickets from storage`);
      }
    } catch (error) {
      console.error('Error loading data from files:', error);
    }
  }
  
  // Save data to JSON files
  private saveDataToFiles() {
    try {
      const fs = require('fs');
      
      // Save counters
      const counters = {
        userId: this.userId,
        auctionId: this.auctionId,
        bidId: this.bidId,
        feedbackId: this.feedbackId,
        supportTicketId: this.supportTicketId
      };
      fs.writeFileSync(this.COUNTERS_FILE, JSON.stringify(counters, null, 2));
      
      // Save users
      fs.writeFileSync(this.USERS_FILE, JSON.stringify(Array.from(this.users.values()), null, 2));
      
      // Save auctions
      fs.writeFileSync(this.AUCTIONS_FILE, JSON.stringify(Array.from(this.auctions.values()), null, 2));
      
      // Save bids
      fs.writeFileSync(this.BIDS_FILE, JSON.stringify(Array.from(this.bids.values()), null, 2));
      
      // Save feedbacks
      fs.writeFileSync(this.FEEDBACKS_FILE, JSON.stringify(Array.from(this.feedbacks.values()), null, 2));
      
      // Save support tickets
      fs.writeFileSync(this.TICKETS_FILE, JSON.stringify(Array.from(this.supportTickets.values()), null, 2));
      
    } catch (error) {
      console.error('Error saving data to files:', error);
    }
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
    this.saveDataToFiles(); // Save changes to file
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
    this.saveDataToFiles(); // Save changes to file
    return auction;
  }

  async updateAuction(id: number, auctionUpdate: Partial<Auction>): Promise<Auction | undefined> {
    const existingAuction = this.auctions.get(id);
    if (!existingAuction) return undefined;
    
    const updatedAuction = { ...existingAuction, ...auctionUpdate };
    this.auctions.set(id, updatedAuction);
    this.saveDataToFiles(); // Save changes to file
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
    
    this.saveDataToFiles(); // Save changes to file
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
    this.saveDataToFiles(); // Save changes to file
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
    this.saveDataToFiles(); // Save changes to file
    return ticket;
  }
}

export const storage = new MemStorage();
