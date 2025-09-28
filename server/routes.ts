import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFileSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // GET /api/files - List all files
  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getAllFiles();
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ error: "Failed to fetch files" });
    }
  });

  // POST /api/files - Upload a new file
  app.post("/api/files", async (req, res) => {
    try {
      const result = insertFileSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid file data", 
          details: result.error.errors 
        });
      }

      const fileData = result.data;
      // Set downloadUrl to the API endpoint for this file
      const fileRecord = await storage.createFile({
        ...fileData,
        downloadUrl: `/api/files/${fileData.username}/${fileData.filename}/download`
      });
      
      // Update downloadUrl with actual file ID
      const updatedFileRecord = {
        ...fileRecord,
        downloadUrl: `/api/files/${fileRecord.id}/download`
      };
      
      res.status(201).json(updatedFileRecord);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // GET /api/files/:id/download - Download file data
  app.get("/api/files/:id/download", async (req, res) => {
    try {
      const { id } = req.params;
      const file = await storage.getFileById(id);
      
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      // Return the encrypted file data
      res.json({
        id: file.id,
        originalFilename: file.originalFilename,
        mimetype: file.mimetype,
        size: file.size,
        encryptedData: file.encryptedData,
        salt: file.salt,
        iv: file.iv,
        kdf: file.kdf,
        iterations: file.iterations,
        algorithm: file.algorithm,
        version: file.version
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ error: "Failed to download file" });
    }
  });

  // DELETE /api/files/:id - Delete a file
  app.delete("/api/files/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const file = await storage.getFileById(id);
      
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      await storage.deleteFile(id);
      res.json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
