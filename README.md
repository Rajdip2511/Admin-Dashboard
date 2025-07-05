# Parlour Admin Dashboard

This project is a full-stack application for a parlour business to manage employees, tasks, and attendance, with role-based access control and live real-time updates via WebSockets.

## Technologies Used

- **Frontend:** Next.js 15 (App Router) with TypeScript
- **UI Framework:** TailwindCSS + ShadCN UI
- **Backend:** Node.js + TypeScript using MVC architecture
- **Database:** MongoDB
- **Realtime:** WebSocket using Socket.IO
- **Auth:** JWT-based authentication

## Project Structure

This is a monorepo setup with two projects:

- `/frontend-parlour-dashboard`: The Next.js frontend application.
- `/backend-parlour-api`: The Node.js backend API.

## Getting Started

### Prerequisites

- Docker Desktop
- Node.js
- pnpm

### Running Locally

1. Clone the repository.
2. Run `pnpm install` in the root directory.
3. Run `docker-compose up -d` to start the services.

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:5000`. 