# 402 Token Explorer

## Overview

The 402 Token Explorer is a web application that discovers and displays Solana SPL tokens containing "402" or "x402" in their name or symbol. The application provides comprehensive token information including social links, mint addresses, and direct integration with Dexscreener for price charts and trading. It fetches token data from Jupiter's official token registry and presents it through a modern, responsive interface with dark/light theme support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tools**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (single-page application with home and 404 routes)

**State Management & Data Fetching**
- React Query (TanStack Query) handles server state management with built-in caching
- Tokens are fetched from `/api/tokens` endpoint with automatic cache invalidation
- Client-side filtering for search functionality without additional API calls

**Styling System**
- Tailwind CSS provides utility-first styling with custom theme configuration
- Shadcn UI component library for consistent, accessible components
- Custom CSS variables for theme support (light/dark mode)
- Design follows glassmorphism patterns with gradient backgrounds
- Typography uses Inter (body) and Space Grotesk (headings) from Google Fonts

**Component Architecture**
- Page components in `client/src/pages/` (home, not-found)
- Reusable UI components in `client/src/components/`
- Custom hooks for theme management (`use-theme.tsx`) and mobile detection (`use-mobile.tsx`)
- Separation of presentational components (HeroSection, TokenCard, TokenGrid) from layout components (Navigation, Footer)

### Backend Architecture

**Server Framework**
- Express.js web server handling API routes and serving static assets
- TypeScript for end-to-end type safety with shared schema definitions
- Vite middleware integration for development with HMR (Hot Module Replacement)

**API Design**
- Single endpoint: `GET /api/tokens` returns filtered token list
- Server-side caching of Jupiter API responses (5-minute TTL) to reduce external API calls
- Error handling with appropriate HTTP status codes and JSON error responses

**Data Flow**
- SolanaTokenScanner class (`server/solana-scanner.ts`) fetches tokens from Jupiter API
- Filters tokens containing "402" or "x402" in name/symbol (case-insensitive)
- Maps Jupiter token format to internal Token schema defined in `shared/schema.ts`
- Caches results in memory to avoid redundant API calls

### Database & Data Storage

**Current Implementation**
- In-memory storage (`MemStorage` class) for user data (placeholder implementation)
- No persistent database currently configured
- Token data cached transiently in server memory

**Schema Definition**
- Drizzle ORM configured for PostgreSQL (`drizzle.config.ts`)
- Schema file exists at `shared/schema.ts` defining Token and User types
- Database credentials expected via `DATABASE_URL` environment variable
- Ready for future database integration when persistence is needed

### Authentication & Authorization

**Current State**
- No authentication implemented
- User schema exists but not actively used
- Storage interface prepared for future user management

## External Dependencies

### Third-Party APIs
- **Jupiter Token API** (`https://tokens.jup.ag/tokens`): Primary data source for Solana SPL token metadata including names, symbols, decimals, and social links
- **Dexscreener**: External links for price charts and trading (client-side navigation only)

### Blockchain Integration
- **@solana/web3.js**: Solana blockchain interaction library (imported but not actively used in current implementation)
- **@solana/spl-token**: SPL token utilities (imported but not actively used in current implementation)

### UI Component Libraries
- **Radix UI** (@radix-ui/*): Headless UI primitives for accessible components (accordion, dialog, dropdown, toast, etc.)
- **Shadcn UI**: Pre-built component compositions using Radix primitives
- **Lucide React**: Icon library for UI elements
- **React Icons**: Additional icon sets (used for social media icons)

### Development Tools
- **Replit Plugins**: Development banner, runtime error overlay, and cartographer for Replit environment integration
- **Framer Motion**: Animation library (installed but not actively used)

### Database & ORM (Configured but Inactive)
- **Drizzle ORM** with **@neondatabase/serverless**: PostgreSQL ORM ready for database integration
- **drizzle-kit**: Database migration management tool

### Utilities
- **bs58**: Base58 encoding/decoding for Solana addresses
- **clsx** + **tailwind-merge**: Utility for conditional CSS class management
- **date-fns**: Date manipulation library
- **zod**: Schema validation (used for Token type validation)