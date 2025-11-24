# HealthHive API - Quick Start Guide

##  **Prerequisites**
- make sure your local branch is up to date with MAIN branch
- PostgreSQL running (via Docker or locally)
- `.env` file configured: your file must contain 
```
JWT_SECRET=your_super_secret_jwt_token
JWT_EXPIRES_IN=24h
```

---

## **Starting the Backend**

### **1. Install Dependencies**
 
```bash
#navigate to the backend folder
cd app/api/healthtrack-backend

#install dependecies
npm install
```

### **2. Set Up Database**
```bash
# Start PostgreSQL (if using Docker)
docker-compose up -d

# Run migrations
npx prisma migrate dev

```

### **3. Start the Server**
```bash
npm run start:dev
```

**Server runs at:** `http://localhost:3000`  
**API Documentation:** `http://localhost:3000/api`

### 4. Navigate to API URL

```
in your browser  paste -> http://localhost:3000/api
```
---

## **Using Swagger UI**

### **What is Swagger UI?**
Interactive API documentation where you can test all endpoints directly in your browser - **no Postman needed!**

### **Access Swagger**
1. Start the backend server
2. Open browser: `http://localhost:3000/api`
3. You'll see all 38 endpoints organized by category

---

## **Testing Endpoints (Step-by-Step)**

### **Step 1: Register a User**
1. Find **Users** section
2. Click `POST /users/register` → Click dropdown
3. Click **"Try it out"** button
4. Edit the JSON:
   ```json
   {
     "email": "yourname@example.com",
     "password": "Password123",
     "firstName": "Your",
     "lastName": "Name"
   }
   ```
5. Click **"Execute"**
6. You should see `201 Created` with your user data + JWT token

### **Step 2: Login (Get Your Token)**
1. Click `POST /users/login`
2. Click **"Try it out"**
3. Use the same credentials:
   ```json
   {
     "email": "yourname@example.com",
     "password": "Password123"
   }
   ```
4. Click **"Execute"**
5. **Copy the `accessToken`** from the response (long string starting with `eyJ...`)

### **Step 3: Authorize Swagger**
1. Click the **🔓 Authorize** button (top right corner)
2. Paste your token in the input field
3. Click **"Authorize"**
4. Click **"Close"**
5. ✅ You're now authenticated! The lock icon turns closed 🔒

### **Step 4: Test Protected Endpoints**

Now you can test any protected endpoint!

**Example: Get Your Profile**
1. Find `GET /users/me`
2. Click **"Try it out"**
3. Click **"Execute"**
4. ✅ You'll see your user data

**Example: Log Health Data**
1. Find `POST /health`
2. Click **"Try it out"**
3. Edit the data:
   ```json
   {
     "weight": 70,
     "steps": 8000,
     "calories": 2000,
     "sleep": 7.5
   }
   ```
4. Click **"Execute"**
5. ✅ Health data logged!

**Example: Create a Goal**
1. Find `POST /goals`
2. Click **"Try it out"**
3. Set your goal:
   ```json
   {
     "type": "WEIGHT_LOSS",
     "title": "Lose 5kg",
     "targetValue": 65,
     "startValue": 70,
     "endDate": "2025-12-31"
   }
   ```
4. Click **"Execute"**
5. ✅ Goal created!

---

## **Available Endpoints**

### **Users (8 endpoints)**
- Register, login, get profile, update profile, change password, OAuth

### **Health Data (11 endpoints)**
- Log data, get by date, get stats, analytics, trends

### **Goals (11 endpoints)**
- Create, update, delete, track progress, get active/completed goals

### **Integrations (8 endpoints)**
- Connect Strava/Fitbit/Lose It, sync data, manage connections

---

## **Authentication Notes**

- **Public endpoints** (no token needed):
  - `POST /users/register`
  - `POST /users/login`
  - `POST /users/google-auth`

- **Protected endpoints** (token required):
  - Everything else!

- **Token expires in:** 24 hours
- **Re-authorize** if you get 401 errors

---

## **Pro Tips**

1. **Use Swagger's Examples**: Click "Schema" tab to see required fields
2. **Check Response Codes**: 
   - 200/201 = Success ✅
   - 400 = Bad request (check your data)
   - 401 = Not authenticated (authorize first)
   - 404 = Not found
3. **Test Error Cases**: Try invalid data to see validation errors
4. **Explore All Endpoints**: Click through each section to see what's available
5. **Copy curl Commands**: Swagger generates curl commands you can use in terminal

---

## **Troubleshooting**

### **Server won't start**
```bash
# Check if PostgreSQL is running
docker ps

# Check for port conflicts
lsof -i :3000
```

### **401 Unauthorized errors**
- Make sure you clicked **🔓 Authorize** and pasted your token
- Token might be expired → Login again to get a new one

### **Database errors**
```bash
# Reset database
npx prisma migrate reset

# Re-run migrations
npx prisma migrate dev
```

---

## **Next Steps**

1. **Test all endpoints** - Try creating health data, goals, and viewing analytics
2. **Check the database** - Use `npx prisma studio` to see your data
3. **Start building frontend** - Use Swagger as reference for API calls to the backend

---

## **You're Ready!**

You now have a fully functional REST API with:
- ✅ JWT Authentication
- ✅ Health data tracking
- ✅ Goal management
- ✅ Third-party integrations
- ✅ Interactive documentation


---

**Questions?** Check the main README or ask Andrew Luwaga