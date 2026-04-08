# Restaurant Ordering System

A production-ready restaurant ordering platform that replaces WhatsApp/manual orders with a structured online ordering system.

## Features

- **Customer Ordering**: Browse menu, add items to cart, place orders
- **Staff Dashboard**: Real-time order management with status updates
- **Admin Panel**: Menu management, category organization, analytics
- **Real-Time Updates**: Socket.io integration for live order notifications
- **Mobile-First Design**: Responsive UI optimized for all devices

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Real-Time**: Socket.io
- **Storage**: Firebase Storage (images)
- **Auth**: JWT with role-based access control
- **Deployment**: Docker + docker-compose

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Firebase account (for image storage)

### Installation

```bash
# Clone the repository
git clone https://github.com/GhiathBr/smart-resto.git
cd smart-resto

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
/src
  /app          # Next.js App Router pages
  /controllers  # HTTP request handlers
  /services     # Business logic layer
  /models       # Data models and Prisma client
  /middleware   # Authentication and validation
  /lib          # Utilities and helpers
  /types        # TypeScript type definitions
```

## Development Phases

1. Project Setup
2. Database Design
3. Authentication System
4. Menu Management
5. Customer Ordering
6. Real-Time Features
7. Staff Dashboard
8. Analytics
9. Deployment

## License

MIT
