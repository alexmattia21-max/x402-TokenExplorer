import type { Express } from "express";
import { createServer, type Server } from "http";
import { SolanaTokenScanner } from "./solana-scanner";

export async function registerRoutes(app: Express): Promise<Server> {
  const scanner = new SolanaTokenScanner();

  app.get("/api/tokens", async (req, res) => {
    try {
      console.log('Fetching 402/x402 tokens...');
      const tokens = await scanner.scanFor402Tokens();
      res.json(tokens);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      res.status(500).json({ 
        error: 'Failed to fetch tokens',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
