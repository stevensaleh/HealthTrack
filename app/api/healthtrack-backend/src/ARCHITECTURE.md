# HealthTrack Backend - Architecture Documentation

## Hexagonal Architecture (Ports & Adapters)

We implement Hexagonal Architecture to keep business logic independent from external concerns like databases, APIs, and frameworks.

```
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                            │
│  (Controllers, DTOs, Guards - HTTP/API Interface)               │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Auth       │  │   Health     │  │    Goals     │         │
│  │ Controller   │  │  Controller  │  │  Controller  │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                  │                  │
└─────────┼─────────────────┼──────────────────┼─────────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CORE LAYER                                │
│           (Business Logic - Independent of Infrastructure)       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Domain Services                        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │  │
│  │  │   User     │  │   Health   │  │    Goal    │        │  │
│  │  │  Service   │  │  Service   │  │  Service   │        │  │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘        │  │
│  │        │               │               │                │  │
│  └────────┼───────────────┼───────────────┼────────────────┘  │
│           │               │               │                    │
│  ┌────────▼───────────────▼───────────────▼────────────────┐  │
│  │           Repository Interfaces (PORTS)                  │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │  │
│  │  │IUserRepo   │  │IHealthRepo │  │ IGoalRepo  │        │  │
│  │  │(Interface) │  │(Interface) │  │(Interface) │        │  │
│  │  └────────────┘  └────────────┘  └────────────┘        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              │ Dependency Injection
                              │
┌─────────────────────────────▼────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                            │
│     (Database, External APIs, Framework-specific code)            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │        Repository Implementations (ADAPTERS)              │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │  UserRepo  │  │ HealthRepo │  │  GoalRepo  │        │   │
│  │  │  (Prisma)  │  │  (Prisma)  │  │  (Prisma)  │        │   │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘        │   │
│  │        └───────────────┬──────────────┬─┘               │   │
│  └────────────────────────┼──────────────┼─────────────────┘   │
│                           │              │                      │
│  ┌────────────────────────▼──────────────▼─────────────────┐   │
│  │              Prisma Service (Adapter)                    │   │
│  │         (Wraps PrismaClient for NestJS)                  │   │
│  └────────────────────────┬──────────────────────────────────┘  │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │   PostgreSQL    │
                   │    Database     │
                   └─────────────────┘
```

## Design Patterns Implementation

### 1. Repository Pattern
**Purpose**: Abstract data access logic from business logic
**Location**:
- **Interfaces (Ports)**: `src/core/repositories/*.interface.ts`
- **Implementations (Adapters)**: `src/infrastructure/database/repositories/*.repository.ts`

**Example**:
```typescript
// Port (Interface) - Core Layer
export interface IUserRepository {
  findById(id: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  create(data: CreateUserDto): Promise<User>;
}

// Adapter (Implementation) - Infrastructure Layer
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}
  
  async findById(id: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
```

**Benefits**:
- Business logic doesn't depend on Prisma
- Easy to swap database implementations
- Easier to test (can mock repositories)
- Single Responsibility Principle

---

### 2. Adapter Pattern

**Purpose**: Make incompatible interfaces work together
**Implementation**: `PrismaService`
**Example**:
```typescript
// PrismaService adapts PrismaClient to work with NestJS
@Injectable()
export class PrismaService 
  extends PrismaClient 
  implements OnModuleInit, OnModuleDestroy {
  
  // Adapts lifecycle methods
  async onModuleInit() {
    await this.$connect();
  }
  
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

**Benefits**:
- PrismaClient works seamlessly with NestJS lifecycle
- Centralized database connection management
- Can add custom methods (like `cleanDatabase()`)

---

### 3. Strategy Pattern (TBD)

**Purpose**: Define a family of algorithms and make them interchangeable
**Use Cases**:
- Different goal calculation strategies
- Multiple authentication strategies (JWT, Google OAuth, etc.)
- Various data sync strategies for integrations

**Example Structure**:
```typescript
// Strategy Interface
interface GoalCalculationStrategy {
  calculate(current: number, target: number): GoalProgress;
}

// Concrete Strategies
class WeightLossStrategy implements GoalCalculationStrategy { }
class StepsStrategy implements GoalCalculationStrategy { }
class ExerciseStrategy implements GoalCalculationStrategy { }

// Context
class GoalService {
  constructor(private strategy: GoalCalculationStrategy) {}
  
  calculateProgress() {
    return this.strategy.calculate(current, target);
  }
}
```

---

### 4. Dependency Injection (Built-in)

This is already built into the NestJS language

**Purpose**: Invert control of dependencies
**Implementation**: NestJS IoC Container

**Example**:
```typescript
@Injectable()
export class UserService {
  // Dependencies injected by NestJS
  constructor(
    private userRepository: IUserRepository,
    private jwtService: JwtService,
  ) {}
}
```

**Benefits**:
- Loose coupling
- Easy testing (can inject mocks)
- Single Responsibility Principle
- Automatic lifecycle management

---

## Folder Structure Explained

```
src/
├── core/                           # DOMAIN LAYER
│   ├── entities/                  # Domain models (business objects)
│   │   ├── user.entity.ts
│   │   ├── health-data.entity.ts
│   │   └── goal.entity.ts
│   │
│   ├── repositories/              # Repository interfaces (PORTS)
│   │   ├── user.repository.interface.ts
│   │   ├── health.repository.interface.ts
│   │   └── goal.repository.interface.ts
│   │
│   └── services/                  # Business logic services
│       ├── user.service.ts
│       ├── health.service.ts
│       └── goal.service.ts
│
├── infra/                        # INFRASTRUCTURE LAYER
│   ├── database/                  # Database concerns
│   │   ├── prisma.service.ts     # Prisma adapter
│   │   ├── prisma.module.ts      # Database module
│   │   └── repositories/          # Repository implementations (ADAPTERS)
│   │       ├── user.repository.ts
│   │       ├── health.repository.ts
│   │       └── goal.repository.ts
│   │
│   └── adapters/                  # External service adapters
│       ├── google-fit.adapter.ts
│       └── fitbit.adapter.ts
│
└── app/                           # APPLICATION LAYER
    ├── controllers/               # HTTP endpoints
    │   ├── auth.controller.ts
    │   ├── user.controller.ts
    │   ├── health.controller.ts
    │   └── goal.controller.ts
    │
    ├── dto/                       # Data transfer objects
    │   ├── create-user.dto.ts
    │   └── update-health.dto.ts
    │
    ├── guards/                    # Authentication/Authorization
    │   ├── jwt-auth.guard.ts
    │   └── google-oauth.guard.ts
    │
    └── decorators/                # Custom decorators
        └── current-user.decorator.ts
```

---

## Data Flow Example

A trace a request to create health data:

```
1. HTTP Request
   POST /api/health
   Body: { weight: 75, steps: 8000, ... }
   ↓

2. Controller (Application Layer)
   @Post()
   create(@Body() dto: CreateHealthDto, @CurrentUser() user: User) {
     return this.healthService.create(user.id, dto);
   }
   ↓

3. Service (Core Layer - Business Logic)
   async create(userId: string, dto: CreateHealthDto) {
     // Validate business rules
     // Calculate derived values
     return this.healthRepository.create(userId, dto);
   }
   ↓

4. Repository Interface (Core Layer - PORT)
   interface IHealthRepository {
     create(userId: string, data: CreateHealthDto): Promise<HealthData>;
   }
   ↓

5. Repository Implementation (Infrastructure Layer - ADAPTER)
   async create(userId: string, data: CreateHealthDto) {
     return this.prisma.healthData.create({
       data: { userId, ...data }
     });
   }
   ↓

6. Prisma Service (Infrastructure Layer - ADAPTER)
   PrismaClient.healthData.create(...)
   ↓

7. PostgreSQL Database
   INSERT INTO health_data VALUES (...)
   ↓

8. Response flows back up
   Database → Prisma → Repository → Service → Controller → HTTP Response
```

---

## Why This Architecture?

### Benefits:

1. **Testability**
   - Mock repositories for unit tests
   - Test business logic without database

2. **Maintainability**
   - Clear separation of concerns
   - Easy to locate and modify code

3. **Flexibility**
   - Swap database (Prisma → TypeORM)
   - Change frameworks (NestJS → Express)
   - Add new features without breaking existing code

4. **Educational Value**
   - Demonstrates professional architecture
   - Shows understanding of SOLID principles
   - Perfect for Master's project

### Trade-offs:

- More initial setup
- More files to manage
- Might be overkill for  simple apps

---

## Key Principles

### 1. Dependency Rule
> Dependencies point inward. Core never depends on Infrastructure.

Good:
```typescript
// Infrastructure depends on Core
class UserRepository implements IUserRepository { }
```



### 2. Ports & Adapters
> Ports define what we need, Adapters provide implementations.

**Port** (Interface):
```typescript
export interface IUserRepository {
  findById(id: string): Promise<User>;
}
```

**Adapter** (Implementation):
```typescript
export class PrismaUserRepository implements IUserRepository {
  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
```

### 3. Dependency Injection
> Don't create dependencies, receive them.

```typescript
// Constructor injection
constructor(
  @Inject('IUserRepository') 
  private userRepository: IUserRepository
) {}
```

---
