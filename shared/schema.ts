import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auctions = pgTable("auctions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startingPrice: doublePrecision("starting_price").notNull(),
  currentPrice: doublePrecision("current_price").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  sellerId: integer("seller_id").notNull(),
  status: text("status").notNull().default("active"), // active, ended, cancelled
  endTime: timestamp("end_time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  auctionId: integer("auction_id").notNull(),
  bidderId: integer("bidder_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  auctionId: integer("auction_id").notNull(),
  fromUserId: integer("from_user_id").notNull(),
  toUserId: integer("to_user_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"), // open, closed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Create base schema from Drizzle ORM
const baseAuctionSchema = createInsertSchema(auctions);

// Modify the endTime field to accept string (ISO format) and make sellerId optional
export const insertAuctionSchema = baseAuctionSchema.omit({
  id: true, 
  currentPrice: true,
  createdAt: true,
  sellerId: true, // We'll add this manually in the route handler
}).extend({
  // Override the endTime field to accept ISO string format
  endTime: z.string().or(z.date())
    .transform((val) => {
      if (typeof val === 'string') {
        return new Date(val);
      }
      return val;
    }),
});

export const insertBidSchema = createInsertSchema(bids).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
});

// Extended Schemas for validation
export const loginSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Type Exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAuction = z.infer<typeof insertAuctionSchema>;
export type InsertBid = z.infer<typeof insertBidSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type LoginData = z.infer<typeof loginSchema>;

export type User = typeof users.$inferSelect;
export type Auction = typeof auctions.$inferSelect;
export type Bid = typeof bids.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
export type SupportTicket = typeof supportTickets.$inferSelect;
