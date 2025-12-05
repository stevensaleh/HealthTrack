# HealthTrack - Health & Fitness Tracking Application

A comprehensive health and fitness tracking web application demonstrating Hexagonal Architecture with Repository, Strategy, Adapter, and Factory design patterns. Built with NestJS backend, React frontend, and PostgreSQL database.

---

## 📋 Project Overview

HealthTrack allows users to:
- Track daily health metrics (weight, steps, calories, exercise, sleep, water)
- Set and manage fitness goals with automatic progress calculation
- Integrate with third-party apps (Strava, Fitbit, Lose It)
- View progress through interactive cards and dashboards
- Manage goal lifecycle (create, pause, resume, complete)

**Architecture Highlights:**
- **Hexagonal Architecture** - Clean separation of concerns
- **Repository Pattern** - Data access abstraction
- **Strategy Pattern** - Dynamic goal calculation algorithms
- **Adapter Pattern** - Third-party API integration
- **Factory Pattern** - Strategy and adapter creation

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your computer:

### 1. Docker Desktop

Docker is required to run the PostgreSQL database.

**Download and Install:**
- **Windows/Mac:** [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux:** [Install Docker Engine](https://docs.docker.com/engine/install/)

**Verify Installation:**
```bash
docker --version
# Should show: Docker version 20.x.x or higher
```

### 2. Node.js and npm

Node.js is required to run both the backend and frontend.

**Download and Install:**
- [Download Node.js LTS](https://nodejs.org/) (version 18.x or higher recommended)
- npm comes bundled with Node.js

**Verify Installation:**
```bash
node --version
# Should show: v18.x.x or higher

npm --version
# Should show: 9.x.x or higher
```

---

## 📁 Project Structure

```
# HealthTrack Project Structure

app/
├── api/                              #backend folder
│   └── healthtrack-backend/          # NestJS Backend
│       ├── prisma/                   # Database schema and migrations
│       ├── src/                      # Backend source code
│       │   ├── app/
│       │   ├── core/
│       │   ├── infra/
│       │   ├── app.controller.spec.ts
│       │   ├── app.controller.ts
│       │   ├── app.module.ts
│       │   ├── app.service.ts
│       │   ├── ARCHITECTURE.md
│       │   └── main.ts               # Application entry point
│       ├── .prettierrc
│       ├── docker-compose.yml
│       ├── eslint.config.mjs
│       ├── nest-cli.json
│       ├── package-lock.json
│       ├── package.json
│       ├── README.md
│       ├── tsconfig.build.json
│       └── tsconfig.json
│
├── .gitignore                        # backend gitignore
├── API_QUICK_START.md                # Backend setup guide
├── QUICK_START.md                    # General project setup guide
│
├── web/                              # React/Vite Frontend
│    ├── public/                       # Static assets
│    ├── src/                          # Frontend source code
│    │   ├── assets/
│    │   ├── components/
│    │   ├── context/
│    │   ├── hooks/
│    │   ├── pages/
│    │   ├── services/
│    │   ├── styles/
│    │   ├── types/
│    │   ├── utils/
│    │   ├── App.tsx                   # Main React component
│    │   ├── main.tsx                  # Frontend entry point
│    │   └── vite-env.d.ts
│    ├── .env
│    ├── .gitignore                    # front end gitignore
│    ├── eslint.config.js
│    ├── index.html                    # HTML entry point
│    ├── package-lock.json
│    └── package.json
└── README.md
```

---

## 🚀 Installation & Setup

### Step 1: Start Docker Desktop

1. Open **Docker Desktop** application
2. Wait until Docker is running (you'll see a green icon)
3. Keep Docker Desktop running throughout the setup

### Step 2: Set Up Backend

#### 2.1 Navigate to Backend Directory

```bash
cd app/api/healthtrack-backend
```

#### 2.2 Install all Dependencies

```bash
npm install
```

This will take 2-3 minutes to complete.

#### 2.3 Create Environment File

- Create a file named `.env` in the `healthtrack-backend` directory:

Open the `.env` file in any text editor and add the following:

***NOTE: Please refer to our project report for the actual .env file, we couldnt not paste the real env file here for security reasons!***

```env
# Database
DATABASE_URL="postgresql://postgres:dev123@localhost:5432/healthhive?schema=public"

# JWT Secret (you can use any random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Port
PORT=3000

# Node Environment
NODE_ENV=development
```

**Save the file.**

#### 2.4 Start Database

within the terminal, start the PostgreSQL database using Docker:

```bash
docker-compose up -d
```

**What this does:**
- Downloads PostgreSQL Docker image (first time only)
- Creates and starts a PostgreSQL container
- Database will be accessible at `localhost:5432`

**Verify database is running:**
```bash
docker ps
```

You should see `healthtrack-backend` container running.

#### 2.5 Run Database Migrations

Generate Prisma client and create database tables:

```bash
npm run prisma:generate
npm run prisma:migrate
```

**When prompted:** 
- Enter a migration name: `initial_setup` (or press Enter for default)


#### 2.6 Start Backend Server

```bash
npm run start dev
```

**Success indicators:**
- You'll see:
```
🚀 HealthTrack Backend is running on: http://localhost:3000
📚 API Documentation: http://localhost:3000/api
```

**Keep this terminal window open!**

---

### Step 3: Set Up Frontend

Open a **NEW terminal window/tab** (keep backend running).

#### 3.1 Navigate to Frontend Directory

```bash
cd app/web
```

#### 3.2 Install Dependencies

```bash
npm install
```

This will take 2-3 minutes to complete.

#### 3.3 Create Environment File

- Create a file named `.env` in the `web` directory:

Add the following content:

```env
VITE_API_URL=http://localhost:3000/api
```

**Save the file.**

#### 3.4 Start Frontend Development Server

In the terminal, make sure you are in the "web" folder
```bash
npm run dev
```

**Success indicators:**
- You'll see: `Local: http://localhost:5173/`
- Frontend is now running

---

## 🎉 Access the Application

1. Open your web browser
2. Go to: **http://localhost:5173**
3. You should see the HealthTrack landing page

### Login

**Use one of the seeded accounts:**
- **Email:** `gigi@example.com`
- **Password:** `password123`

**OR create a new account:**
- Click "Sign Up"
- Fill in your details
- Click "Create Account"

---

## 🧪 Testing the Application

Once logged in, you can:

### 1. View Dashboard
- See your health statistics
- View weekly summaries
- Check goal progress

### 2. Add Health Data
- Click "Add Entry" button
- Fill in metrics (weight, steps, calories, etc.)
- Save to see data in charts

### 3. Create Goals
- Click "Manage Goals" button
- Click "+ Add Goal"
- Choose goal type (Steps, Weight Loss, Exercise, etc.)
- Fill in details and create
- Watch automatic progress calculation!

### 4. Connect Integrations (Optional)
- Click "Connect Apps" in sidebar
- Connect to Strava, Fitbit, or Lose It
- Sync data automatically

---

## 🐛 Troubleshooting

### Backend won't start

**Problem:** Port 3000 already in use

**Solution:**
```bash
# Find and kill process on port 3000
# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

---

### Frontend won't start

**Problem:** Port 5173 already in use

**Solution:**
```bash
# Find and kill process on port 5173
# On Mac/Linux:
lsof -ti:5173 | xargs kill -9

# On Windows:
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

---

### Database connection errors

**Problem:** Cannot connect to database

**Solution:**

1. Check Docker is running:
   ```bash
   docker ps
   ```

2. If no containers running, start database:
   ```bash
   cd backend
   docker-compose up -d
   ```

3. Check database logs:
   ```bash
   docker logs healthhive-db
   ```

---

### Prisma errors

**Problem:** Prisma Client out of sync

**Solution:**
```bash
cd backend
npm run prisma:generate
```

---

### Module not found errors

**Problem:** Missing dependencies

**Solution:**
```bash
# In backend:
cd backend
rm -rf node_modules package-lock.json
npm install

# In frontend:
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🔧 Additional Commands

### Backend

- for all the commands below make sure you are in app/api/healthtrack-backend folder

```bash
# View database in browser
npm run prisma:studio

# Run all backend tests
npm test

# Stop database
docker-compose down

# Stop and remove data
docker-compose down -v
```

---

## 📊 API Documentation

Once backend is running, view interactive API documentation:

**Swagger UI:** http://localhost:3000/api

You can test all endpoints directly from the browser!

---

## 🎓 Architecture Overview

### Backend (NestJS)

```
src/
├── domain/              # Domain entities and interfaces
│   ├── repositories/    # Repository interfaces
│   └── strategies/      # Strategy interfaces
│
├── infrastructure/      # External concerns
│   ├── database/        # Prisma and repositories
│   ├── adapters/        # Third-party API adapters
│   └── strategies/      # Goal calculation strategies
│
├── application/         # Application logic
│   ├── services/        # Business logic
│   ├── controllers/     # HTTP endpoints
│   └── dto/             # Data transfer objects
│
└── core/                # Shared utilities
```

### Frontend (React + TypeScript)

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API client
└── styles/             # CSS files
```

---

## 🎯 Key Features Demonstrated

### Design Patterns

1. **Repository Pattern**
   - `UserRepository`, `GoalRepository`, `HealthDataRepository`
   - Clean data access abstraction

2. **Strategy Pattern**
   - Different calculation algorithms per goal type
   - `WeightLossStrategy`, `StepsStrategy`, `ExerciseStrategy`

3. **Adapter Pattern**
   - Normalize third-party API responses
   - `StravaAdapter`, `FitbitAdapter`, `LoseItAdapter`

4. **Factory Pattern**
   - `GoalCalculationStrategyFactory`
   - `HealthDataProviderFactory`

### Architecture Principles

- **Hexagonal Architecture** - Core business logic isolated from external concerns
- **SOLID Principles** - Single responsibility, dependency inversion
- **Clean Architecture** - Dependency rules, layer separation
- **Type Safety** - Full TypeScript implementation

---

**Estimated Setup Time:** 15-20 minutes
