# 402 Token Explorer

A modern web application for discovering and tracking Solana SPL tokens containing "402" or "x402" in their name or symbol. Built with React, Express, and Solana Web3.js, powered by Jupiter's Token API.

![402 Token Explorer](https://img.shields.io/badge/Solana-Blockchain-blueviolet) ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

- 🔍 **Real-time Token Discovery** - Scans Jupiter's comprehensive token registry for SPL tokens with "402" or "x402"
- 📊 **Token Details** - View comprehensive information including symbol, decimals, and mint address
- 🔗 **Dexscreener Integration** - Direct links to Dexscreener for price charts and trading
- 🌐 **Social Links** - Access Twitter, Telegram, Discord, and website links when available from token metadata
- 🎨 **Modern UI** - Beautiful, responsive design with glassmorphism effects and smooth animations
- 🌓 **Dark Mode** - Full dark/light theme support
- ⚡ **Fast Performance** - Built with React Query for optimal caching and data fetching
- 🔄 **Automatic Updates** - Cached token data refreshes every 5 minutes

## Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - High-quality component library
- **React Query** - Powerful data synchronization
- **Wouter** - Lightweight routing
- **Framer Motion** - Smooth animations

### Backend
- **Express.js** - Fast Node.js web framework
- **@solana/web3.js** - Solana blockchain interaction
- **@solana/spl-token** - SPL token utilities
- **Jupiter Token API** - Official Solana token registry
- **TypeScript** - End-to-end type safety

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/402-token-explorer.git
cd 402-token-explorer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5000
```

## Usage

### Searching for Tokens

1. The homepage displays all discovered tokens containing "402" or "x402" from Jupiter's registry
2. Use the search bar to filter by name, symbol, or mint address
3. Click on any token card to view more details
4. Click "View on Dexscreener" to see price charts and trading pairs

### Viewing Token Information

Each token card displays:
- Token name and symbol
- Mint address (with copy functionality)
- Decimal places
- Social media links from token metadata (Twitter, Telegram, Discord, Website)

## Project Structure

```
402-token-explorer/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
│   └── index.html         # HTML entry point
├── server/                # Backend Express application
│   ├── routes.ts          # API route handlers
│   ├── solana-scanner.ts  # Jupiter API integration
│   └── index.ts           # Server entry point
├── shared/                # Shared TypeScript types
│   └── schema.ts          # Data models and validation
└── README.md
```

## API Endpoints

### GET `/api/tokens`

Returns all SPL tokens containing "402" or "x402" from Jupiter's token registry.

**Response:**
```json
[
  {
    "name": "402 Protocol",
    "symbol": "402X",
    "mintAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "decimals": 9,
    "socials": {
      "twitter": "https://twitter.com/402protocol",
      "telegram": "https://t.me/402protocol",
      "website": "https://402protocol.com"
    }
  }
]
```

**Caching:** Results are cached for 5 minutes to reduce API load.

## How It Works

### Token Discovery

The application uses Jupiter's Token API (https://tokens.jup.ag/tokens) to fetch all verified Solana tokens. Jupiter maintains the most comprehensive and up-to-date token registry for Solana, automatically filtering out imposters and scam tokens.

The scanner:
1. Fetches the complete token list from Jupiter
2. Filters tokens whose name or symbol contains "402" or "x402" (case-insensitive)
3. Extracts social media links from token metadata extensions
4. Caches results for 5 minutes to minimize API calls

### Social Links

Social media links are sourced from each token's metadata extensions, which projects submit when listing their tokens. Available links include:
- Twitter/X profiles
- Telegram groups
- Discord servers
- Official websites

## Development

### Running in Development Mode

The project uses a single command to run both frontend and backend:

```bash
npm run dev
```

This starts:
- Express backend server with Jupiter API integration
- Vite development server for the frontend
- Both served on port 5000

### Building for Production

```bash
npm run build
```

This creates optimized production builds in the `dist` directory.

## Environment Variables

Create a `.env` file in the root directory (optional):

```env
PORT=5000
```

No API keys are required - the Jupiter Token API is free and publicly accessible.

## Deployment

### Deploy to Replit

1. Import this repository to Replit
2. The app will automatically install dependencies
3. Click "Run" to start the application
4. Use the "Publish" button to deploy to production

### Deploy to Other Platforms

The app can be deployed to any platform that supports Node.js:

- **Vercel** - Zero-config deployment
- **Netlify** - Full-stack hosting
- **Railway** - Container-based deployment
- **Heroku** - Traditional PaaS deployment

No environment variables or API keys required!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Roadmap

- [ ] Real-time price data from Dexscreener API
- [ ] Token analytics and charts
- [ ] Favorites/watchlist functionality with local storage
- [ ] Advanced filtering (by verification status, tags)
- [ ] Export token lists to CSV/JSON
- [ ] Token comparison tool
- [ ] On-chain supply data integration
- [ ] Mobile app version

## Technical Notes

### Data Sources

- **Token List**: Jupiter Token API (https://tokens.jup.ag/tokens)
- **Token Registry**: Community-maintained via https://github.com/jup-ag/token-list
- **Social Links**: Extracted from token metadata extensions
- **Price Data**: Users redirected to Dexscreener for live pricing

### Caching Strategy

- Token data is cached server-side for 5 minutes
- Reduces load on Jupiter API
- Falls back to stale cache if API is unavailable
- Client-side caching via React Query

### Future Enhancements

For production deployment, consider:
- Implementing token supply data from on-chain RPC queries
- Adding price/market cap data from Dexscreener or Birdeye APIs
- Setting up webhooks for real-time new token notifications
- Adding rate limiting for the API endpoint
- Implementing pagination for large result sets

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built on the [Solana](https://solana.com) blockchain
- Token data powered by [Jupiter](https://jup.ag) Token API
- Price discovery via [Dexscreener](https://dexscreener.com)
- UI components from [Shadcn UI](https://ui.shadcn.com)

## Support

For questions or issues, please open an issue on GitHub or contact the maintainers.

---

**Built with ❤️ on Solana**
