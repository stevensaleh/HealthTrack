# Repository Pattern - Implementation Summary

## What We Built

We've successfully implemented the **Repository Pattern** for the **User, Health** and **Goal** entity, demonstrating the core principles of Hexagonal Architecture.

---

## Files Created

### Core Layer (Domain/Business Logic)
```
src/core/
├── types/
│   └── user.types.ts                    # Data transfer types
│   └── health-data.types.ts             # Data transfer types
│   └── goal.types.ts                    # Data transfer types
├── repositories/
│   └── user.repository.interface.ts     # Repository contract (PORT)
│   └── health.repository.interface.ts   # Repository contract (PORT)
│   └── goal.repository.interface.ts     # Repository contract (PORT)
├── services/
│   ├── user.service.ts                  # Business logic
│   ├── health.service.ts                # Business logic
│   ├── goal.service.ts                  # Business logic
│   └── __tests__/
│       └── user.service.spec.ts         # Unit tests
│       └── health.service.spec.ts       # Unit tests
│       └── goal.service.spec.ts         # Unit tests
└── core.module.ts                       # Core module configuration
```

### Infrastructure Layer (Technical Implementation)
```
src/infrastructure/
├── database/
│   └── repositories/
│       └── user.repository.ts           # Prisma implementation (ADAPTER)
│       └── health.repository.ts         # Prisma implementation (ADAPTER)
│       └── goal.repository.ts           # Prisma implementation (ADAPTER)
└── infrastructure.module.ts             # Infrastructure module configuration
```

### Application Layer (Root)
```
src/
└── app.module.ts                        # Root module (updated)
```

---

##  Architecture Layers

### 1. Type Definitions (`user.types.ts`, `goal.types.ts`, `health-data.types.ts`)

**Purpose:** These files define data shapes for the respective entity operations. 

**Why Separate?**
- Core layer doesn't depend on Prisma types
- Can differ from database structure
- Security: Exclude sensitive fields (password, googleId)

---

### 2. Repository Interfaces (`user.repository.interface.ts`, `goal.repository.interface.ts`, `health-data.repository.interface.ts`)

**Purpose:** These define the contract for each entities data access (PORT)

**Key Principle:** Interface defines WHAT, not HOW
- Lives in core layer (no Prisma knowledge)
- Services depend on this interface
- Multiple implementations possible

---

### 3. Repository Implementation (`user.repository.ts`, `goal.repository.ts`,`health-data.repository.ts`)

**Purpose:** These files implement the interface for each respective entity   using Prisma (ADAPTER)

**Key Features:**
- `user.repository` Implements `IUserRepository`, `health-data.repository` Implements `IHealthDataRepository` and `goal.repository` Implements `IGoalRepository`interface.
- Uses `PrismaService` for database operations
- Handles Prisma specific errors
- Converts to domain appropriate exceptions


**Why It's an Adapter:**
- Adapts Prisma to work with our interface
- Could swap to MongoDB, TypeORM, etc.
- Services remain unchanged

---

### 4. Domain Services (`user.service.ts`, `health.service`, `health.service`)

**Purpose:** Each service file controls its respective entity's business logic and orchestration

**Why This Matters:**
- Business logic separated from HTTP and database
- Testable without database
- Clear, focused responsibility

---

### 5. Module Configuration

**InfrastructureModule:**
- Provides concrete repository implementations
- Exports repository tokens for injection
- Manages database dependencies

**CoreModule:**
- Provides domain services
- Imports repositories from InfrastructureModule
- Exports services for controllers

**AppModule:**
- Root module
- Imports CoreModule
- Ties everything together

**Example Dependency Injection (User Enitity):**
```typescript
// In service:
constructor(@Inject('IUserRepository') private repo: IUserRepository)

// NestJS provides:
{ provide: 'IUserRepository', useClass: UserRepository }
```

---

### 6. Unit Tests (`user.service.spec.ts`, `health.service.spec.ts`, `goal.service.spec.ts`)
**Purpose:** Each service file has a respective test file used to test all the methods in the service file



---

## Design Patterns Demonstrated

### 1. Repository Pattern 

**Interface (Port):**
```typescript
interface IUserRepository {
  findById(id: string): Promise<User | null>;
}
```

**Implementation (Adapter):**
```typescript
class UserRepository implements IUserRepository {
  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
```

**Service Usage:**
```typescript
class UserService {
  constructor(@Inject('IUserRepository') private repo: IUserRepository) {}
  // Depends on interface, not implementation!
}
```

---

### 2. Dependency Injection 

**Framework-Managed Dependencies:**
```typescript
// NestJS creates and injects dependencies
constructor(
  @Inject('IUserRepository') private repo: IUserRepository,
  private prisma: PrismaService,
) {}
```

**Benefits:**
-  Loose coupling
-  Easy testing
-  Automatic lifecycle management
-  Clear dependencies

---

## Complete Flow Example For Each Entity

### User Registration Request:

```
1. HTTP POST /auth/register
   { email: "john@example.com", password: "Secret123" }
   
2. Controller 
   → Validates input
   → Calls UserService.register()
   
3. UserService (Core Layer)
   → Checks email uniqueness via IUserRepository
   → Validates password strength
   → Hashes password
   → Calls repository.create()
   
4. IUserRepository (Interface)
   → Contract: create(data): Promise<User>
   
5. UserRepository (Infrastructure)
   → Implements interface using Prisma
   → Calls prisma.user.create()
   
6. PrismaService
   → Executes SQL INSERT
   
7. PostgreSQL
   → Stores user
   
8. Response flows back up
   Database → Prisma → Repository → Service → Controller → HTTP
```

**Key Points:**
- UserService never imports Prisma
- UserService depends on interface only
- Can test UserService without database
- Can swap database without changing service

### Goal Entity Complete Request Flow:
```
1. User wants progress for weight loss goal
   ↓
2. GoalService.getGoalWithProgress(goalId)
   ↓
3. Get goal from IGoalRepository
   ↓
4. GoalService.calculateGoalProgress(goal)
   ↓
5. strategyFactory.getStrategy('WEIGHT_LOSS')
   → Returns WeightLossStrategy
   ↓
6. Get health data from IHealthDataRepository
   ↓
7. strategy.calculate(goal, healthData)
   → WeightLossStrategy executes its algorithm
   → Returns GoalProgress { percentage: 40%, ... }
   ↓
8. Return goal with progress to user
```

**Key Point:** Service orchestrates, strategies calculate!

---


