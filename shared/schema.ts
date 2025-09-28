import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const files = pgTable("files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull(),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  mimetype: text("mimetype").notNull(),
  size: integer("size").notNull(),
  downloadUrl: text("download_url").notNull(),
  uploadTimestamp: timestamp("upload_timestamp").defaultNow().notNull(),
  salt: text("salt").notNull(), // Base64 encoded
  iv: text("iv").notNull(), // Base64 encoded
  kdf: text("kdf").notNull().default("PBKDF2"),
  iterations: integer("iterations").notNull().default(200000),
  algorithm: text("algorithm").notNull().default("AES-GCM"),
  version: text("version").notNull().default("1.0"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertFileSchema = createInsertSchema(files).pick({
  username: true,
  filename: true,
  originalFilename: true,
  mimetype: true,
  size: true,
  downloadUrl: true,
  salt: true,
  iv: true,
  kdf: true,
  iterations: true,
  algorithm: true,
  version: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type FileRecord = typeof files.$inferSelect;

// File upload types
export const fileUploadSchema = z.object({
  username: z.string().min(1, "Username is required"),
  pattern: z.array(z.number()).min(4, "Pattern must connect at least 4 dots"),
});

export type FileUploadData = z.infer<typeof fileUploadSchema>;

// File decryption types
export const fileDecryptSchema = z.object({
  pattern: z.array(z.number()).min(1, "Pattern is required"),
});

export type FileDecryptData = z.infer<typeof fileDecryptSchema>;
