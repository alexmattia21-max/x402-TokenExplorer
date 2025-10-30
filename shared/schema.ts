import { z } from "zod";

export const tokenSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  mintAddress: z.string(),
  supply: z.string().optional(),
  decimals: z.number().optional(),
  socials: z.object({
    twitter: z.string().optional(),
    telegram: z.string().optional(),
    discord: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
});

export type Token = z.infer<typeof tokenSchema>;
