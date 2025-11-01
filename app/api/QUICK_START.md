#  HealthTrack Backend

A **NestJS backend with Prisma ORM and PostgreSQL** 

---

##  What's Included

### Complete Project Structure
```
healthtrack-backend/
│── prisma/
│      ├── schema.prisma  → Database models
│      └── seed.ts        → Test data
│
├── Backend Code
│   └── src/
│       ├── main.ts                 → Entry point
│       ├── app.module.ts           → Root module
│       └── infrastructure/
│           └── database/
│               ├── prisma.service.ts  → Database adapter
│               └── prisma.module.ts   → Database module
│
|
├── package.json       → Dependencies & scripts
├── tsconfig.json      → TypeScript config
└── nest-cli.json      → NestJS config
└── docker-compose.yml → PostgreSQL container
└── .env               → environment vars
```

---

##  Quick Start

###  Install Dependencies
```bash
cd healthtrack-backend
npm install
```

### Start PostgreSQL Database
- Make sure you have installed Docker on your machine.
- For Mac users go here to install: [Mac Install](https://docs.docker.com/desktop/setup/install/mac-install/)
- For Windows go here to install: [Windows Install](https://docs.docker.com/desktop/setup/install/windows-install/)
- Once you have installed it, sign/log in and then just leave the app running in the background (If your a first time user, make sure your email is verified after sign in)

Then run the command below

```bash
docker compose up -d
```

### Generate Prisma Client
```bash
npm run prisma:generate
```

### Run Database Migrations
```bash
npm run prisma:migrate
# Name it: "initial_schema"
```

### Seed Database (Optional)
```bash
npm run prisma:seed
```

### Start Backend Server
```bash
npm run start:dev
```

**Done! Backend is now running at:** `http://localhost:3000`

---

## Database Schema

We created 4 main models:

### User
- Email/password authentication
- Google OAuth support
- Profile information

### HealthData
- Weight, steps, calories, sleep, water, exercise
- Heart rate tracking
- Mood and notes

### Goal
- Weight loss, steps, exercise goals
- Progress tracking
- Status management (active/completed/cancelled)

### Integration
- Google Fit, Fitbit, Apple Health, Strava
- OAuth token management
- Sync tracking

---

## Test Data (After Seeding)

**Login Credentials:**
- Email: `test@healthhive.com`
- Password: `password123`

**What's Included:**
- 2 test users
- 7 days of health data
- 2 active goals
- 1 sample integration

---

## Useful Commands

```bash
# Development
npm run start:dev              # Start with hot-reload
npm run start:debug            # Start with debugger

# Database
docker-compose up -d           # Start PostgreSQL
docker-compose down            # Stop PostgreSQL
npm run prisma:studio          # Open database GUI (localhost:5555)
npm run prisma:generate        # Regenerate Prisma Client
npx prisma migrate reset       # Reset database (careful!)

# Code Quality
npm run lint                   # Lint code
npm run format                 # Format code
npm test                       # Run tests
```

---

## Architecture Highlights

### Hexagonal Architecture (Ports & Adapters)
```
Application Layer (Controllers, DTOs)
         ↓
Core Layer (Business Logic, Repository Interfaces)
         ↓
Infrastructure Layer (Prisma Repositories, Adapters)
         ↓
PostgreSQL Database
```

### Design Patterns Implemented:
1. **Repository Pattern** - Abstracts data access
2. **Adapter Pattern** - PrismaService adapts to NestJS
3. **Dependency Injection** - NestJS built-in IoC container
4. **Strategy Pattern** - For goal calculations and auth strategies

---


## Troubleshooting

**Database connection failed?**
```bash
docker-compose ps          # Check if running
docker-compose logs -f     # View logs
```

**Prisma Client not found?**
```bash
npm run prisma:generate    # Regenerate client
```

**Port already in use?**
- Change `PORT` in `.env` file
- Or change PostgreSQL port in `docker-compose.yml`

---

