import { z } from "zod";

export const tokenSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  mintAddress: z.string(),
  decimals: z.number(),
  supply: z.string().optional(),
  socials: z.object({
    twitter: z.string().optional(),
    telegram: z.string().optional(),
    discord: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
  marketCap: z.number().optional(),
  createdAt: z.number().optional(),
});

export type Token = z.infer<typeof tokenSchema>;
