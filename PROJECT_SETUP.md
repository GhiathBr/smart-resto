# Restaurant Ordering System - Project Setup

## Project Structure

```
smart-resto/
├── src/
│   ├── app/              # Next.js App Router pages and layouts
│   ├── lib/              # Utility functions and shared libraries
│   ├── controllers/      # API controllers (HTTP request handlers)
│   ├── services/         # Business logic services
│   ├── models/           # Data models and Prisma client interactions
│   ├── middleware/       # Authentication, authorization middleware
│   └── types/            # TypeScript type definitions
├── .env.example          # Environment variables template
├── next.config.js        # Next.js configuration
├── tsconfig.json         # TypeScript configuration with path aliases
├── tailwind.config.ts    # Tailwind CSS configuration
└── package.json          # Project dependencies and scripts
```

## Technology Stack

- **Frontend Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.io
- **Authentication**: JWT with bcrypt
- **File Storage**: Firebase Admin SDK
- **Package Manager**: npm

## Installed Dependencies

### Production Dependencies
- `next` - Next.js framework
- `react` & `react-dom` - React library
- `typescript` - TypeScript language
- `@prisma/client` - Prisma ORM client
- `socket.io` & `socket.io-client` - Real-time communication
- `firebase-admin` - Firebase Admin SDK for storage
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT token generation
- `tailwindcss` - Utility-first CSS framework

### Development Dependencies
- `prisma` - Prisma CLI
- `@types/bcrypt` - TypeScript types for bcrypt
- `@types/jsonwebtoken` - TypeScript types for JWT
- `@types/socket.io` - TypeScript types for Socket.io

## Path Aliases

The following path aliases are configured in `tsconfig.json`:

- `@/*` → `./src/*`
- `@/app/*` → `./src/app/*`
- `@/lib/*` → `./src/lib/*`
- `@/controllers/*` → `./src/controllers/*`
- `@/services/*` → `./src/services/*`
- `@/models/*` → `./src/models/*`
- `@/middleware/*` → `./src/middleware/*`
- `@/types/*` → `./src/types/*`

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

### Database
- `DATABASE_URL` - PostgreSQL connection string

### JWT
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRES_IN` - Token expiration time

### Firebase
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_PRIVATE_KEY` - Firebase private key
- `FIREBASE_CLIENT_EMAIL` - Firebase client email
- `FIREBASE_STORAGE_BUCKET` - Firebase storage bucket name

### Application
- `NODE_ENV` - Environment (development/production)
- `PORT` - Application port
- `NEXT_PUBLIC_API_URL` - Public API URL
- `NEXT_PUBLIC_SOCKET_URL` - Socket.io server URL

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Next Steps

1. Set up PostgreSQL database
2. Configure environment variables in `.env`
3. Initialize Prisma schema
4. Set up Firebase project for image storage
5. Implement authentication middleware
6. Create API routes and controllers
7. Build frontend components

## Requirements Satisfied

This setup satisfies the following requirements from the specification:

- **Requirement 15.1**: API code organized into controllers, services, and models layers
- **Requirement 15.5**: Async/await for all asynchronous operations
- **Requirement 14.5**: Environment variables for configuration values
