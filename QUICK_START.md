# ⚡ Quick Start Commands

## 🚀 Copy-Paste Setup (After cloning the repo)

### 1. Backend Environment File
```bash
cd backend-parlour-api
cat > .env << 'EOF'
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-for-parlour-dashboard-2024
MONGODB_URI=mongodb://localhost:27017/parlour-dashboard
EOF
```

### 2. Frontend Environment File
```bash
cd frontend-parlour-dashboard
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:5000/api
EOF
```

### 3. Install All Dependencies
```bash
# Backend
cd backend-parlour-api
npm install

# Frontend
cd ../frontend-parlour-dashboard
npm install
```

### 4. Run Both Servers
```bash
# Terminal 1 - Backend
cd backend-parlour-api
npm run dev

# Terminal 2 - Frontend
cd frontend-parlour-dashboard
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Login: superadmin@parlour.com / password123

## 🎯 One-Line Commands

### Kill Ports (if needed)
```bash
npx kill-port 3000 && npx kill-port 5000
```

### Clean Install
```bash
rm -rf node_modules package-lock.json && npm install
```

### Full Reset
```bash
# Backend
cd backend-parlour-api && rm -rf node_modules package-lock.json && npm install

# Frontend  
cd ../frontend-parlour-dashboard && rm -rf node_modules package-lock.json && npm install
```

---

**🔥 Pro Tip**: Use the main `LOCAL_SETUP_GUIDE.md` for detailed explanations! 