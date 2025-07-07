# 🚀 Local Setup Guide - Parlour Admin Dashboard

## 📋 Complete Step-by-Step Setup Instructions

This guide will help you set up and run the Parlour Admin Dashboard locally on your machine. It includes all the challenges you might face and their solutions.

---

## 🔧 Prerequisites

Make sure you have the following installed on your system:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

### Verify Installation
```bash
node --version
npm --version
git --version
```

---

## 📥 Step 1: Clone the Repository

```bash
git clone https://github.com/Rajdip2511/Admin-Dashboard.git
cd Admin-Dashboard
```

---

## 🏗️ Step 2: Backend Setup

### Navigate to Backend Directory
```bash
cd backend-parlour-api
```

### Install Dependencies
```bash
npm install
```

### Create Environment File
Create a `.env` file in the `backend-parlour-api/` directory:

```env
# Backend Environment Variables
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-for-parlour-dashboard-2024
MONGODB_URI=mongodb://localhost:27017/parlour-dashboard

# Note: System works with mock data even without MongoDB
```

### Create/Update .gitignore
Create a `.gitignore` file in the `backend-parlour-api/` directory:

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

# IDE
.vscode/
.idea/

# TypeScript
*.tsbuildinfo
```

---

## 🎨 Step 3: Frontend Setup

### Navigate to Frontend Directory
```bash
cd ../frontend-parlour-dashboard
```

### Install Dependencies
```bash
npm install
```

### Install Missing Dependencies (Critical!)
The project has missing dependencies that need to be installed:

```bash
npm install react-hook-form
npm install @radix-ui/react-select
```

### Create Environment File
Create a `.env.local` file in the `frontend-parlour-dashboard/` directory:

```env
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Verify .gitignore
The frontend `.gitignore` should already exist and contain:

```gitignore
# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

---

## 🚀 Step 4: Running the Application

### Important Note for Windows Users
If you're using **PowerShell**, the `&&` operator doesn't work. You need to run commands separately.

### Method 1: Using Separate Terminals (Recommended)

#### Terminal 1 - Backend Server
```bash
cd backend-parlour-api
npm run dev
```

You should see:
```
Server started on port 5000
[DB] Error: connect ECONNREFUSED (this is normal - using mock data)
[DB] Server will continue without database connection
```

#### Terminal 2 - Frontend Server
```bash
cd frontend-parlour-dashboard
npm run dev
```

You should see:
```
▲ Next.js 15.3.4
- Local: http://localhost:3000
- Network: http://[your-ip]:3000
✓ Ready in 2.7s
```

### Method 2: Using Background Processes

If you prefer to run both from one terminal:

```bash
# Start backend in background
cd backend-parlour-api
start npm run dev

# Start frontend in background
cd ../frontend-parlour-dashboard
start npm run dev
```

---

## 🌐 Step 5: Access the Application

Once both servers are running:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health
- **API Documentation**: http://localhost:5000/api-docs

---

## 🔑 Step 6: Test Login Credentials

The system uses **dummy JWT tokens** for demonstration. Use these credentials:

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

## 🎯 Available Features

- ✅ **Employee Management** - Create, Read, Update, Delete employees
- ✅ **Task Management** - Create, assign, and track tasks
- ✅ **Attendance Tracking** - Real-time punch in/out system
- ✅ **Role-based Access Control** - Different permission levels
- ✅ **Real-time Updates** - WebSocket integration for live updates
- ✅ **Dashboard Analytics** - Business insights and reporting

---

## 🐛 Common Issues & Solutions

### Issue 1: PowerShell `&&` Operator Error
**Problem**: `The token '&&' is not a valid statement separator`

**Solution**: Run commands separately or use `;` instead of `&&`
```bash
# Instead of this:
cd backend-parlour-api && npm run dev

# Use this:
cd backend-parlour-api
npm run dev
```

### Issue 2: Module Not Found Errors
**Problem**: `Module not found: Can't resolve 'react-hook-form'` or `@radix-ui/react-select`

**Solution**: Install missing dependencies
```bash
cd frontend-parlour-dashboard
npm install react-hook-form @radix-ui/react-select
```

### Issue 3: Port Already in Use
**Problem**: `EADDRINUSE: address already in use`

**Solution**: Kill existing processes
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <process-id> /F

# Or use
npx kill-port 3000
npx kill-port 5000
```

### Issue 4: Frontend Build Errors
**Problem**: Build fails with missing dependencies

**Solution**: Clear cache and reinstall
```bash
cd frontend-parlour-dashboard
rm -rf node_modules package-lock.json
npm install
npm install react-hook-form @radix-ui/react-select
```

### Issue 5: Database Connection Errors
**Problem**: MongoDB connection errors

**Solution**: This is normal! The app works with mock data:
```
[DB] Error: connect ECONNREFUSED (this is normal - using mock data)
[DB] Server will continue without database connection
```

### Issue 6: Environment Variables Not Loading
**Problem**: API calls failing or configuration issues

**Solution**: 
- Ensure `.env` files are in the correct directories
- Restart servers after creating environment files
- Check for typos in environment variable names

---

## 🔍 Step 7: Verification

### Backend Verification
Test the backend API:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Parlour Admin Dashboard Backend is running",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### Frontend Verification
1. Open browser: http://localhost:3000
2. Should see login page
3. Login with test credentials
4. Should redirect to dashboard

### Real-time Features Test
1. Open two browser tabs:
   - Tab 1: http://localhost:3000/dashboard/attendance
   - Tab 2: http://localhost:3000/attendance
2. In Tab 2, click "Punch In" for any employee
3. Tab 1 should update immediately (WebSocket working)

---

## 📊 Project Structure

```
Admin-Dashboard/
├── backend-parlour-api/          # Node.js/Express API
│   ├── src/
│   │   ├── controllers/          # API route handlers
│   │   ├── models/              # Data models
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   └── server.ts            # Main server file
│   ├── .env                     # Environment variables
│   ├── .gitignore              # Git ignore rules
│   └── package.json            # Dependencies
├── frontend-parlour-dashboard/   # Next.js/React Frontend
│   ├── src/
│   │   ├── app/                # Next.js app router
│   │   ├── components/         # React components
│   │   ├── lib/               # Utility functions
│   │   └── types/             # TypeScript types
│   ├── .env.local             # Environment variables
│   ├── .gitignore            # Git ignore rules
│   └── package.json          # Dependencies
└── LOCAL_SETUP_GUIDE.md       # This file
```

---

## 🎉 Success Checklist

Before considering the setup complete, verify:

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] Can access login page at http://localhost:3000
- [ ] Can login with test credentials
- [ ] Dashboard loads after login
- [ ] No console errors in browser
- [ ] Real-time features working (WebSocket connected)
- [ ] API health check returns OK status

---

## 🚨 Critical Dependencies

Make sure these are installed in the frontend:

```json
{
  "dependencies": {
    "react-hook-form": "^7.60.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-slot": "^1.2.3",
    "axios": "^1.10.0",
    "socket.io-client": "^4.7.1",
    "next": "15.3.4",
    "react": "^18",
    "react-dom": "^18"
  }
}
```

---

## 💡 Pro Tips

1. **Use separate terminals** for backend and frontend during development
2. **Check browser console** for any JavaScript errors
3. **Verify port availability** before starting servers
4. **Keep environment files secure** - never commit them to version control
5. **Test real-time features** to ensure WebSocket is working
6. **Use browser developer tools** to debug network requests

---

## 📞 Support

If you encounter issues not covered in this guide:

1. Check the browser console for errors
2. Verify all dependencies are installed
3. Ensure environment files are created correctly
4. Check that both servers are running without errors
5. Test API endpoints directly using tools like Postman

---

## 🎯 Next Steps

Once the setup is complete, you can:

1. **Explore the codebase** to understand the architecture
2. **Test all features** using the provided test accounts
3. **Customize the application** for your specific needs
4. **Add new features** following the existing patterns
5. **Deploy to production** using the provided Docker configurations

---

**🎉 Congratulations! Your Parlour Admin Dashboard is now running locally!**

The application should be fully functional with employee management, task tracking, real-time attendance monitoring, and role-based access control.
