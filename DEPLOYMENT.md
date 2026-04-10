# 🚀 Deployment Guide

## Prerequisites
- Docker & Docker Compose installed
- Domain name (optional, for production)
- Firebase project setup
- PostgreSQL database (or use Docker Compose)

## Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL="postgresql://restaurant:restaurant123@postgres:5432/restaurant_db"
POSTGRES_USER=restaurant
POSTGRES_PASSWORD=restaurant123
POSTGRES_DB=restaurant_db

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Firebase
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL="your-client-email"
FIREBASE_STORAGE_BUCKET="your-bucket.appspot.com"

# App
NODE_ENV="production"
PORT=3000
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Local Development with Docker

```bash
# Build and start services
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f app
```

## Production Deployment (VPS)

### 1. Clone Repository
```bash
git clone https://github.com/your-repo/smart-resto.git
cd smart-resto
```

### 2. Configure Environment
```bash
cp .env.example .env
nano .env  # Edit with your production values
```

### 3. Build and Deploy
```bash
docker-compose up -d --build
```

### 4. Run Database Migrations
```bash
docker-compose exec app npx prisma db push
```

### 5. Seed Database (Optional)
```bash
docker-compose exec app npm run seed
```

## Nginx Reverse Proxy (Optional)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support for Socket.io
    location /api/socket {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Monitoring

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart
```

## Backup Database

```bash
docker-compose exec postgres pg_dump -U restaurant restaurant_db > backup.sql
```

## Restore Database

```bash
docker-compose exec -T postgres psql -U restaurant restaurant_db < backup.sql
```

## Troubleshooting

### Container won't start
```bash
docker-compose logs app
docker-compose logs postgres
```

### Database connection issues
```bash
docker-compose exec app npx prisma db push
```

### Clear and rebuild
```bash
docker-compose down -v
docker-compose up --build
```
