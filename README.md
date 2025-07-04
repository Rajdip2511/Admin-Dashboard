# Parlour Admin Dashboard

A comprehensive web-based dashboard system for parlour business management with role-based access control and real-time attendance tracking.

## 🚀 Technologies Used

- **Frontend**: Next.js 15 (App Router) with TypeScript
- **UI Framework**: TailwindCSS + ShadCN UI
- **Backend**: Node.js + TypeScript with MVC architecture
- **Database**: MongoDB (Docker for local, Atlas for production)
- **Real-time**: WebSocket using Socket.IO
- **Authentication**: JWT-based authentication
- **Containerization**: Docker & Docker Compose

## 📁 Project Structure

```
parlour-project/
├── frontend-parlour-dashboard/    # Next.js 15 + TypeScript + ShadCN UI
├── backend-parlour-api/          # Node.js + TypeScript + MVC + WebSocket
├── docker-compose.yml            # Docker services configuration
└── README.md                     # This file
```

## 👥 User Roles

### Super Admin
- Full dashboard access
- CRUD operations on employees and tasks
- View attendance logs
- Delete any data

### Admin
- Read-only dashboard access
- View employees and tasks (no editing/deletion)
- View attendance logs
- Cannot delete or update anything

## 🔧 Features

### Landing Page (/)
- Feature overview and technology stack
- Quick access to login and attendance
- Default credentials display

### Authentication System (/login)
- Secure JWT-based authentication
- Role-based access control
- Password validation

### Dashboard (/dashboard)
- Employee management (role-based permissions)
- Task management (role-based permissions)
- Live attendance tracking via WebSocket
- Real-time statistics and analytics

### Attendance Page (/attendance)
- Public-facing punch in/out interface
- Real-time updates to admin dashboards
- Employee status tracking
- Live attendance display

## 🐳 Local Development with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rajdip2511/Admin-Dashboard.git
   cd Admin-Dashboard
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: mongodb://localhost:27017

## 🚀 Production Deployment

For production, the project uses:
- MongoDB Atlas for database
- Environment-specific configurations
- Optimized Docker images

## 🔒 Authentication

The system uses JWT-based authentication with role-based access control:
- Super Admin: Full access to all features
- Admin: Read-only access to dashboard features

### Default Credentials

#### Super Admin
- **Email**: admin@parlour.com
- **Password**: Admin@123
- **Permissions**: Full CRUD access, user management

#### Admin/Manager
- **Email**: manager@parlour.com
- **Password**: Manager@123
- **Permissions**: Read-only access

## 📊 Real-time Features

WebSocket integration provides:
- Live attendance updates
- Real-time dashboard synchronization
- Instant punch in/out notifications

## 📝 API Documentation

API endpoints are available at `/api/docs` when running the backend in development mode.

## 🧪 Testing

Run tests with:
```bash
# Backend tests
cd backend-parlour-api
npm test

# Frontend tests
cd frontend-parlour-dashboard
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License. 