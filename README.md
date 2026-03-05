# Life Dashboard

An AI-driven personal life dashboard that tracks habits, goals, health, finance, and productivity in one place.

## Features

- **Health Tracking**: Monitor health metrics and habits
- **Finance Management**: Track your financial health
- **Task Management**: Manage daily tasks and priorities
- **Calendar Integration**: View upcoming events
- **Goal Tracking**: Set and monitor progress on personal goals
- **AI Insights**: Get actionable insights and recommendations

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Testing**: Vitest + React Testing Library
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 22.x or higher
- Docker and Docker Compose (for containerized setup)
- PostgreSQL (if running without Docker)

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/srirammanian/life-dashboard.git
   cd life-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Setup

1. Start all services with Docker Compose:
   ```bash
   docker-compose up
   ```

2. The application will be available at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate test coverage report

## Project Structure

```
life-dashboard/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Shared utilities and configs
├── __tests__/             # Test files
├── .github/               # GitHub Actions workflows
├── public/                # Static assets
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
└── vitest.config.ts       # Vitest configuration
```

## Testing

Run the test suite:
```bash
npm test
```

Watch mode:
```bash
npm test -- --watch
```

Coverage report:
```bash
npm run test:coverage
```

## Contributing

This project is managed by AI agents. For contributions:
1. Create an issue describing the feature or bug
2. The AI agents will plan and implement changes
3. Review the automated PRs

## License

MIT
