# SPL Token Explorer Design Guidelines

## Design Approach

**Reference-Based Approach**: Draw inspiration from modern Web3 platforms like Dexscreener, Phantom Wallet, and Solana's official branding. The design should feel premium, tech-forward, and aligned with crypto-native aesthetics while maintaining excellent data readability.

**Core Principles**:
- Tech-forward sophistication with glassmorphism and depth
- Information density balanced with breathing room
- Immediate value: Critical token data visible without scrolling
- Interactive discovery: Engaging token cards that invite exploration

## Typography

**Font Stack**: 
- Primary: Inter (Google Fonts) - Clean, modern, excellent for data display
- Accent: Space Grotesk (Google Fonts) - Bold, tech-forward for headlines

**Hierarchy**:
- Hero Headline: Space Grotesk, 3xl-6xl, bold (responsive scaling)
- Section Headers: Space Grotesk, 2xl-4xl, semibold
- Token Names: Inter, lg-xl, semibold
- Token Symbols: Inter, sm-base, medium, uppercase
- Metadata/Stats: Inter, xs-sm, regular
- Body Text: Inter, sm-base, regular

## Layout System

**Spacing Units**: Standardize on Tailwind units of **4, 6, 8, 12, 16** for consistent rhythm
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-16
- Card gaps: gap-6 to gap-8
- Container margins: mx-4 to mx-8

**Grid System**:
- Container: max-w-7xl with consistent horizontal padding
- Token Grid: 1 column mobile → 2 columns tablet → 3-4 columns desktop
- Responsive breakpoints: Mobile-first with md: and lg: variants

## Component Library

### Hero Section
Full-viewport hero with dynamic gradient background (no hero image - gradients create the visual impact)
- Centered content with max-w-4xl
- Large headline explaining the token explorer purpose
- Subtitle with key value proposition
- Prominent search/filter input with glassmorphism effect
- Live token count indicator
- Subtle animated gradient background

### Navigation Header
Sticky header with glassmorphism backdrop blur
- Logo/branding on left
- GitHub link icon on right
- Minimal, unobtrusive design
- Height: h-16

### Token Cards
Premium card design with depth and interactivity:
- Glassmorphism container with border and backdrop blur
- Hover state: Subtle lift with shadow increase
- Card sections:
  - Token header: Icon placeholder + Name + Symbol badge
  - Stats row: Mint address (truncated with copy button), supply if available
  - Dexscreener button: Prominent primary action with blur background
  - Social links row: Icon buttons for Twitter, Telegram, Discord, Website (show only if available)
- Consistent padding: p-6
- Rounded corners: rounded-xl to rounded-2xl

### Search & Filter Bar
Prominent search interface before token grid:
- Large search input with icon
- Filter chips/toggles for "402" vs "x402"
- Real-time results counter
- Glassmorphism styling matching overall theme
- Spacing: mb-12 from token grid

### Loading States
Skeleton screens for token cards while fetching:
- Animated shimmer effect
- Card-shaped placeholders matching final layout
- Grid maintains structure during load

### Empty States
When no tokens found:
- Centered message with helpful icon
- Suggestion text
- Option to adjust filters
- Generous vertical padding: py-20

### Footer
Minimal footer with:
- Project attribution
- GitHub repository link
- Solana blockchain reference
- Social/community links if applicable
- Padding: py-8 to py-12

## Images

**No Traditional Hero Image**: The hero section uses animated gradients as the visual anchor instead of photography.

**Token Icons**: Each token card should display a token icon if available from metadata:
- Size: 48x48px (w-12 h-12)
- Rounded: full circle
- Fallback: Gradient circle with first letter of symbol
- Position: Top-left of card content

**Social Icons**: Use Heroicons via CDN for all social media links:
- Size: 20x20px (w-5 h-5)
- Consistent styling across all platforms
- Hover states with scale transform

## Animations

**Strategic Animation Points** (use sparingly):

1. **Hero Gradient**: Slow-moving, subtle gradient animation on background
2. **Token Cards Entrance**: Stagger fade-in as they load (100ms delay between cards)
3. **Hover Effects**: 
   - Cards: Scale 1.02 + shadow expansion (200ms ease)
   - Buttons: Subtle scale 0.98 on active press
4. **Loading Skeleton**: Shimmer animation (1.5s loop)

**No Animation**:
- Avoid excessive scroll-triggered effects
- No parallax
- No complex micro-interactions beyond hover states

## Layout Structure

**Page Flow**:
1. Hero Section (80vh): Gradient background, search bar, headline
2. Token Grid Section: Full-width container with responsive grid
3. Footer: Minimal, informative

**Glassmorphism Implementation**:
- Cards and overlays: Semi-transparent backgrounds with backdrop-filter blur
- Border: 1px semi-transparent border for definition
- Use consistently across search bar, nav, and token cards

**Responsive Behavior**:
- Mobile: Single column, larger touch targets, condensed spacing
- Tablet: 2-column grid, balanced proportions  
- Desktop: 3-4 column grid, generous spacing, full effects

**Information Hierarchy**:
- Most critical: Token name, symbol, Dexscreener link
- Secondary: Mint address, social links
- Tertiary: Supply, additional metadata

This design creates a modern, crypto-native experience that feels premium and professional while maintaining excellent usability for discovering and exploring SPL tokens.