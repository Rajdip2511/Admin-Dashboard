# 🚀 Local Setup Guide - Parlour Admin Dashboard

A complete step-by-step guide to run the Full Stack Parlour Admin Dashboard on your local machine.

## 📋 Prerequisites

Before starting, ensure you have the following installed on your system:

1. **Node.js** (v18.0.0 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Git** 
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

3. **Code Editor** (Trae or cursor ide recommended)
   - Download from: https://code.visualstudio.com/

---

## 🏗️ Project Structure

```
AdminDashBOard/
├── backend-parlour-api/          # Node.js + TypeScript Backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend-parlour-dashboard/   # Next.js + TypeScript Frontend
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── context/
│   ├── package.json
│   └── next.config.ts
└── README.md
```

---

## 🔧 Step-by-Step Setup Instructions

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Rajdip2511/Admin-Dashboard.git

# Navigate to project directory
cd AdminDashBOard
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend-parlour-api

# Install dependencies
npm install

# Install TypeScript globally (if not already installed)
npm install -g typescript ts-node nodemon

# Create .env file (optional - system works without it)
touch .env
```

#### Create Backend .env File (Optional)
Create a `.env` file in the `backend-parlour-api/` directory:

```env
# Backend Environment Variables (Optional)
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-for-parlour-dashboard-2024
MONGODB_URI=mongodb://localhost:27017/parlour-dashboard

# Note: System works with mock data even without MongoDB
```

#### Backend .gitignore
Create/verify `.gitignore` in `backend-parlour-api/` directory:

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build output
dist/
build/

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Mac
.DS_Store

# Windows
Thumbs.db
```

### Step 3: Frontend Setup

```bash
# Open new terminal and navigate to frontend directory
cd frontend-parlour-dashboard

# Install dependencies
npm install
```

#### Create Frontend .env.local File
Create a `.env.local` file in the `frontend-parlour-dashboard/` directory:

```env
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### Frontend .gitignore
Create/verify `.gitignore` in `frontend-parlour-dashboard/` directory:

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# Production
build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
```

### Step 4: Root Level .gitignore
Create/verify `.gitignore` in the root directory:

```gitignore
# Dependencies
node_modules/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build output
dist/
build/
.next/
out/

# Misc
.DS_Store
*.pem
Thumbs.db

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

---

## ▶️ Running the Project

### Method 1: Run Both Servers Simultaneously

#### Terminal 1 - Backend Server
```bash
# Navigate to backend directory
cd backend-parlour-api

# Start backend server
npm run dev

# You should see:
# Server started on port 5000
# [DB] Error: connect ECONNREFUSED (this is normal - using mock data)
# [DB] Server will continue without database connection
```

#### Terminal 2 - Frontend Server
```bash
# Navigate to frontend directory (in new terminal)
cd frontend-parlour-dashboard

# Start frontend server
npm run dev

# You should see:
# ▲ Next.js 15.x.x
# - Local: http://localhost:3000
```

### Method 2: Using Package Scripts (If Available)

```bash
# From root directory (if scripts are configured)
npm run dev:backend     # Start backend
npm run dev:frontend    # Start frontend
npm run dev             # Start both (if configured)
```

---

## 🌐 Access URLs

Once both servers are running:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Login Page**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard
- **Public Attendance**: http://localhost:3000/attendance

---

## 🔑 Test Credentials

The system uses **dummy JWT tokens** for demonstration. Use these test credentials:

### Super Admin (Full Access)
```
Email: superadmin@parlour.com
Password: password123
```

### Admin (Read-Only Access)
```
Email: admin@parlour.com
Password: password123
```

### Employee Account
```
Email: employee@parlour.com
Password: password123
```

---

## ✅ Verification Steps

### 1. Check Backend is Running
Visit: http://localhost:5000/api/

You should see a response or status page.

### 2. Check Frontend is Running
Visit: http://localhost:3000

You should see the login page.

### 3. Test Authentication
1. Go to http://localhost:3000/login
2. Use Super Admin credentials: `superadmin@parlour.com` / `password123`
3. You should be redirected to the dashboard

### 4. Test Real-time Features
1. Open two browser tabs/windows
2. Tab 1: http://localhost:3000/dashboard/attendance
3. Tab 2: http://localhost:3000/attendance
4. In Tab 2, click "Punch In" for any employee
5. Tab 1 should update immediately (WebSocket working)

---

## 🎯 Available Features

### Super Admin Features
- ✅ Employee Management (Create, Read, Update, Delete)
- ✅ Task Management (Create, Read, Update, Delete)
- ✅ Attendance Monitoring (Real-time updates)
- ✅ Full dashboard access

### Admin Features
- ✅ Employee Viewing (Read-only)
- ✅ Task Viewing (Read-only)
- ✅ Attendance Monitoring (Read-only)
- ✅ Dashboard access (limited)

### Public Features
- ✅ Attendance Punch In/Out page
- ✅ Real-time status updates

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 5000
npx kill-port 5000
```

#### 2. Node Modules Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. TypeScript Errors
```bash
# Install TypeScript globally
npm install -g typescript

# Rebuild TypeScript
npm run build
```

#### 4. Environment Variables Not Loading
- Ensure `.env.local` is in the correct directory
- Restart the development server after creating .env files
- Check for typos in environment variable names

#### 5. API Connection Issues
- Verify backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Ensure no firewall blocking localhost connections

#### 6. WebSocket Not Working
- Check browser console for WebSocket connection errors
- Ensure both frontend and backend are running
- Try refreshing the page

---

## 📱 Browser Compatibility

- ✅ Chrome (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

---

## 🚀 Ready to Go!

If you've followed all steps correctly, you should now have:

1. ✅ Backend running on http://localhost:5000
2. ✅ Frontend running on http://localhost:3000
3. ✅ Dummy authentication working
4. ✅ Real-time WebSocket features active
5. ✅ Full CRUD operations functional

### Quick Test Checklist:
- [ ] Can login with dummy credentials
- [ ] Can view dashboard as Super Admin
- [ ] Can create/edit/delete employees
- [ ] Can create/edit/delete tasks
- [ ] Can see real-time attendance updates
- [ ] Public attendance page works

---

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure all environment files are created correctly
4. Check that both servers are running without errors

**Note**: This system uses mock data and dummy JWT tokens, so it works completely offline without any external database dependencies!

---

## 🎉 Success!

You're now ready to explore the Full Stack Parlour Admin Dashboard with all its features including role-based access control, real-time attendance tracking, and complete CRUD operations! 🚀 
