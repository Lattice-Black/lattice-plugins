# Lattice Web Dashboard

A technical, monochromatic Next.js 14 dashboard for visualizing the Lattice service discovery platform.

## Features

- **Service Discovery Dashboard**: Grid view of all discovered services with real-time metadata
- **Service Detail Pages**: Technical spec sheets with routes, dependencies, and discovery information
- **Network Graph Visualization**: Interactive canvas-based graph showing service relationships
- **Monochromatic Design**: Black background with white/gray wireframe aesthetics

## Tech Stack

- Next.js 14 with App Router
- TypeScript (strict mode)
- Tailwind CSS
- React Server Components
- Canvas API for graph visualization

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn 1.22+
- Lattice API running on port 3000

### Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

The dashboard will be available at `http://localhost:3010`

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with fonts and global styles
│   ├── page.tsx           # Main dashboard (service grid)
│   ├── services/[id]/     # Service detail pages
│   └── graph/             # Network graph visualization
├── components/            # Reusable React components
│   ├── Header.tsx        # Navigation header
│   ├── DotGrid.tsx       # Background dot pattern
│   ├── ServiceCard.tsx   # Service card component
│   ├── NetworkGraph.tsx  # Interactive network visualization
│   ├── Loading.tsx       # Loading states
│   └── ErrorState.tsx    # Error handling UI
├── lib/                   # Utility functions
│   ├── api.ts            # API client functions
│   └── utils.ts          # Helper functions
└── types/                 # TypeScript type definitions
    └── index.ts          # Shared types
```

## Design System

### Colors

- Black: `#000000` (background)
- White: `#FFFFFF` (primary text)
- Gray Scale: `#E5E5E5` to `#171717` (UI elements)

### Typography

- **Sans Serif**: Inter (headings, body text)
- **Monospace**: JetBrains Mono (technical data, IDs, paths)

### Components

- Wireframe boxes and borders
- Dot grid background pattern
- No shadows or gradients
- Generous white space
- Technical spec sheet layouts

## API Integration

The dashboard fetches data from the Lattice API:

- `GET /api/v1/services` - List all services
- `GET /api/v1/services/:id` - Get service details

## Development

```bash
# Run development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Run linter
yarn lint
```

## License

MIT
