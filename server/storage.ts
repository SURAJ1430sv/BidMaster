import { 
  User, InsertUser, 
  Auction, InsertAuction, 
  Bid, InsertBid, 
  Feedback, InsertFeedback, 
  SupportTicket, InsertSupportTicket 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import * as fs from 'fs';

const MemoryStore = createMemoryStore(session);

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<Map<number, User>>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Auction operations
  getAuction(id: number): Promise<Auction | undefined>;
  getAuctions(includeEnded?: boolean): Promise<Auction[]>;
  getUserAuctions(userId: number): Promise<Auction[]>;
  createAuction(auction: InsertAuction): Promise<Auction>;
  updateAuction(id: number, auction: Partial<Auction>): Promise<Auction | undefined>;
  closeAuction(id: number, userId: number): Promise<Auction | undefined>;
  deleteAuction(id: number, userId: number): Promise<boolean>;
  
  // Bid operations
  getBid(id: number): Promise<Bid | undefined>;
  getAuctionBids(auctionId: number): Promise<Bid[]>;
  getUserBids(userId: number): Promise<Bid[]>;
  createBid(bid: InsertBid): Promise<Bid>;
  closeBid(bidId: number, userId: number): Promise<Bid | undefined>;
  
  // Feedback operations
  getFeedback(id: number): Promise<Feedback | undefined>;
  getUserFeedbacks(userId: number): Promise<Feedback[]>;
  getAllFeedbacks(): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  
  // Support ticket operations
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  getUserSupportTickets(userId: number): Promise<SupportTicket[]>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;

  // Session store
  sessionStore: any; // Using 'any' for session store due to type compatibility issues
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private auctions: Map<number, Auction>;
  private bids: Map<number, Bid>;
  private feedbacks: Map<number, Feedback>;
  private supportTickets: Map<number, SupportTicket>;
  sessionStore: any; // Using 'any' for session store due to type compatibility issues
  
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
  
  async getUsers(): Promise<Map<number, User>> {
    return this.users;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    this.saveDataToFiles(); // Save changes to file
    return user;
  }
  
  async updateUserProfile(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    // Only update allowed fields (e.g., profileImage, fullName)
    // Don't allow updating sensitive data like password through this method
    const allowedUpdates = ['profileImage', 'fullName'];
    const filteredUpdates: Partial<User> = {};
    
    for (const key of allowedUpdates) {
      if (key in userData) {
        filteredUpdates[key as keyof User] = userData[key as keyof User];
      }
    }
    
    const updatedUser = { ...existingUser, ...filteredUpdates };
    this.users.set(id, updatedUser);
    this.saveDataToFiles(); // Save changes to file
    return updatedUser;
  }

  // Auction methods
  async getAuction(id: number): Promise<Auction | undefined> {
    return this.auctions.get(id);
  }

  async getAuctions(includeEnded = false): Promise<Auction[]> {
    const now = new Date();
    const auctions = Array.from(this.auctions.values());
    
    // Update status of ended auctions
    auctions.forEach(auction => {
      if (auction.status === "active" && new Date(auction.endTime) <= now) {
        auction.status = "ended";
        this.auctions.set(auction.id, auction);
      }
    });
    
    // Save changes if any auctions were updated
    if (auctions.some(auction => auction.status === "ended")) {
      this.saveDataToFiles();
    }
    
    // Filter out ended auctions unless explicitly requested
    return includeEnded ? auctions : auctions.filter(auction => auction.status !== "ended");
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

  async closeAuction(id: number, userId: number): Promise<Auction | undefined> {
    const auction = this.auctions.get(id);
    
    // Check if auction exists and belongs to the user
    if (!auction || auction.sellerId !== userId) {
      return undefined;
    }
    
    // Update auction status to cancelled
    const updatedAuction = { ...auction, status: "cancelled" };
    this.auctions.set(id, updatedAuction);
    this.saveDataToFiles();
    
    return updatedAuction;
  }

  async deleteAuction(id: number, userId: number): Promise<boolean> {
    const auction = this.auctions.get(id);
    
    // Check if auction exists and belongs to the user
    if (!auction || auction.sellerId !== userId) {
      return false;
    }
    
    // Delete the auction
    this.auctions.delete(id);
    this.saveDataToFiles();
    
    return true;
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

  async closeBid(bidId: number, userId: number): Promise<Bid | undefined> {
    const bid = this.bids.get(bidId);
    
    // Check if bid exists and belongs to the user
    if (!bid || bid.bidderId !== userId) {
      return undefined;
    }
    
    // Get the auction to check if it's still active
    const auction = this.auctions.get(bid.auctionId);
    if (!auction || auction.status !== "active") {
      return undefined;
    }
    
    // Mark the bid as closed
    const updatedBid = { ...bid, status: "closed" };
    this.bids.set(bidId, updatedBid);
    this.saveDataToFiles();
    
    return updatedBid;
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
  
  async getAllFeedbacks(): Promise<Feedback[]> {
    return Array.from(this.feedbacks.values());
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
