# Parlour Admin Dashboard - Local Development Setup

This guide will help you set up the Parlour Admin Dashboard for local development without Docker.

## Prerequisites

- Node.js v18+ (you have v22.14.0 ✅)
- MongoDB Atlas account (free tier available)
- Git (for version control)

## Quick Setup

### 1. Install Dependencies and Setup Environment

```bash
npm install
npm run setup
```

This will:
- Install `concurrently` for running both frontend and backend
- Create `.env` files for both backend and frontend
- Install dependencies for both projects

### 2. Set Up MongoDB Atlas (Cloud Database)

Since Docker is having issues, we'll use MongoDB Atlas (cloud database):

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free account
3. Create a new cluster (choose the free tier)
4. Create a database user:
   - Go to Database Access
   - Add New Database User
   - Username: `parlour-admin`
   - Password: `your-secure-password`
   - Database User Privileges: Read and write to any database
5. Whitelist your IP address:
   - Go to Network Access
   - Add IP Address
   - Add Current IP Address (or 0.0.0.0/0 for development)
6. Get your connection string:
   - Go to Database → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

### 3. Update Environment Variables

Edit `backend-parlour-api/.env` and replace the MONGODB_URI:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://parlour-admin:your-secure-password@cluster0.xxxxx.mongodb.net/parlour-admin?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-for-security
CORS_ORIGIN=http://localhost:3000
```

### 4. Start the Application

```bash
npm run dev
```

This will start both the backend and frontend concurrently:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- API Documentation: http://localhost:5000/api-docs

## Default Login Credentials

The application will automatically seed the database with test data:

### Super Admin
- Email: `superadmin@parlour.com`
- Password: `password123`
- Can: Create, Read, Update, Delete all data

### Admin
- Email: `admin@parlour.com`
- Password: `password123`
- Can: View all data, limited edit permissions

### Test Employees
- `john.doe@parlour.com` / `password123`
- `jane.smith@parlour.com` / `password123`
- `mike.wilson@parlour.com` / `password123`

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Super Admin, Admin, Employee)
- Protected routes and API endpoints

### 👥 Employee Management
- Add, edit, delete employees
- Role assignment
- Employee profiles with contact information

### 📋 Task Management
- Create and assign tasks
- Priority levels (Low, Medium, High)
- Status tracking (Pending, In Progress, Completed)
- Due date management

### ⏰ Real-time Attendance
- Punch in/out functionality
- Live attendance dashboard
- WebSocket integration for real-time updates
- Public attendance page for employees

### 📊 Dashboard Features
- Live attendance monitoring
- Employee status overview
- Task statistics
- Real-time notifications

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (Super Admin only)

### Employees
- `GET /api/employees` - List all employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Attendance
- `POST /api/attendance/punch-in` - Punch in
- `POST /api/attendance/punch-out` - Punch out
- `GET /api/attendance/employees-status` - Get all employee statuses

## Troubleshooting

### Docker Issues
If you encounter Docker problems:
1. Use the local development setup (this guide)
2. Docker Desktop on Windows can be unstable
3. Local development is faster for development anyway

### Database Connection Issues
1. Check your MongoDB Atlas connection string
2. Ensure your IP is whitelisted
3. Verify database user credentials
4. Check if the cluster is running

### Port Conflicts
If ports 3000 or 5000 are in use:
1. Change PORT in `backend-parlour-api/.env`
2. Update NEXT_PUBLIC_API_URL in `frontend-parlour-dashboard/.env.local`
3. Restart the application

### Environment Variables
Make sure both `.env` files are created:
- `backend-parlour-api/.env`
- `frontend-parlour-dashboard/.env.local`

## Development Commands

```bash
# Setup everything
npm run setup

# Start both frontend and backend
npm run dev

# Start only backend
npm run dev:backend

# Start only frontend  
npm run dev:frontend

# Build for production
npm run build

# Start production build
npm start
```

## Project Structure

```
AdminDashBOard/
├── backend-parlour-api/          # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/          # Route handlers
│   │   ├── models/              # MongoDB models
│   │   ├── routes/              # API routes
│   │   ├── middleware/          # Authentication middleware
│   │   └── services/            # Business logic
│   └── .env                     # Backend environment variables
├── frontend-parlour-dashboard/   # Next.js frontend
│   ├── src/
│   │   ├── app/                 # Next.js app router
│   │   ├── components/          # React components
│   │   ├── lib/                 # Utilities and API client
│   │   └── types/               # TypeScript types
│   └── .env.local               # Frontend environment variables
└── setup-local.js               # Setup script
```

## Next Steps

1. Customize the UI/UX to match your brand
2. Add more employee fields as needed
3. Implement additional features (reports, analytics, etc.)
4. Set up production deployment
5. Configure production database and security

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure MongoDB Atlas is properly configured
4. Check that all dependencies are installed

Happy coding! 🚀 