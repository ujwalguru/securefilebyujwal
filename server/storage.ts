import { type User, type InsertUser, type FileRecord, type InsertFile } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, files } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // File operations
  getAllFiles(): Promise<FileRecord[]>;
  getFileById(id: string): Promise<FileRecord | undefined>;
  createFile(file: InsertFile): Promise<FileRecord>;
  deleteFile(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // File operations
  async getAllFiles(): Promise<FileRecord[]> {
    return await db.select().from(files).orderBy(files.uploadTimestamp);
  }

  async getFileById(id: string): Promise<FileRecord | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file || undefined;
  }

  async createFile(insertFile: InsertFile): Promise<FileRecord> {
    const [file] = await db
      .insert(files)
      .values(insertFile)
      .returning();
    return file;
  }

  async deleteFile(id: string): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }
}

export const storage = new DatabaseStorage();
