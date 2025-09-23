# Web Memer - Full-Stack Meme Economy Game

## Overview

Web Memer is a full-stack web application that emulates the core functionality of the Dank Memer Discord bot, adapted for a browser-based experience. This is a meme-themed economy game where users can earn coins, play games, manage inventories, and interact in a virtual economy system. The application features a dark-themed, meme-aesthetic UI with comprehensive gaming and social features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with protected routes
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Custom component library built on Radix UI primitives with shadcn/ui styling
- **Styling**: Tailwind CSS with custom CSS variables for theming, featuring a dark meme aesthetic
- **Authentication**: Context-based auth provider with JWT token management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints with rate limiting and CORS support
- **Authentication**: Passport.js with local strategy using session-based auth and JWT tokens
- **Password Security**: Crypto module with scrypt for password hashing
- **Real-time Features**: WebSocket implementation for live chat functionality

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon Database serverless driver
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Management**: Drizzle Kit for migrations and database management
- **Session Storage**: In-memory session store with connect-pg-simple for PostgreSQL sessions
- **Data Validation**: Zod schemas for runtime type validation and API contract enforcement

### Authentication and Authorization
- **Strategy**: Session-based authentication with Passport.js local strategy
- **Password Security**: Scrypt-based password hashing with salt generation
- **Rate Limiting**: Express-rate-limit for auth endpoints (5 attempts per 5-minute window)
- **Route Protection**: Middleware-based route protection for authenticated and admin routes
- **User Roles**: Basic user and admin role system with admin key verification

### Game Economy System
- **Core Services**: Modular service architecture with EconomyService, GameService, and FreemiumService
- **Banking System**: Virtual bank with deposit/withdrawal functionality and transaction fees
- **Gaming**: Multiple game implementations (Blackjack, Slots, Coinflip, Trivia) with server-side logic
- **Freemium Model**: Daily rewards system with loot tables and cooldown management
- **Transaction Logging**: Comprehensive transaction history with type categorization

### API Architecture
- **Structure**: Service-oriented architecture with separated concerns
- **Error Handling**: Centralized error handling middleware with standardized error responses
- **Validation**: Input validation using Zod schemas for type safety
- **Rate Limiting**: API-wide rate limiting (100 requests per 15-minute window)
- **Logging**: Request/response logging with performance metrics

## External Dependencies

### Database and Infrastructure
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-kit**: Database schema management and migrations
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Frontend UI and Styling
- **@radix-ui/***: Comprehensive primitive component library for accessible UI components
- **tailwindcss**: Utility-first CSS framework with custom design system
- **class-variance-authority**: Component variant management
- **clsx**: Conditional CSS class composition
- **lucide-react**: Icon library for consistent iconography

### Authentication and Security
- **passport**: Authentication middleware with local strategy
- **express-rate-limit**: Rate limiting middleware for API protection
- **express-session**: Session management for user authentication
- **crypto**: Node.js crypto module for password hashing and security

### State Management and API
- **@tanstack/react-query**: Server state management with caching and synchronization
- **wouter**: Lightweight client-side routing
- **@hookform/resolvers**: Form validation integration with Zod schemas
- **react-hook-form**: Form state management and validation

### Development and Build Tools
- **vite**: Fast build tool and development server
- **@vitejs/plugin-react**: React integration for Vite
- **typescript**: Static type checking
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution for development server

### Real-time Communication
- **ws**: WebSocket implementation for live chat functionality
- **embla-carousel-react**: Carousel components for UI interactions

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation
- **zod**: Runtime type validation and schema definition