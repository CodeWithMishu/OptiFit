# Quick Command Reference

## 🚀 Start Development Servers

### Backend
```bash
cd /home/codewithmishu/OptiFit/backend
npm run dev
```
Runs on: http://localhost:5000

### Frontend
```bash
cd /home/codewithmishu/OptiFit/frontend
npm run dev
```
Runs on: http://localhost:3000

---

## 🔨 Build for Production

### Backend
```bash
cd /home/codewithmishu/OptiFit/backend
npm run build
npm start
```

### Frontend
```bash
cd /home/codewithmishu/OptiFit/frontend
npm run build
npm start
```

---

## 🧪 Test Backend API

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Create User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "age": 30,
    "dob": "1994-01-01",
    "gender": "Male",
    "mobile": "+1234567890",
    "address": "123 Test St",
    "wardNo": "5",
    "boothNo": "101",
    "prescription": {
      "rightEye": {"spherical": -2.5},
      "leftEye": {"spherical": -2.0}
    },
    "faceShape": "Oval",
    "frameSize": "Medium (51-54mm)",
    "frameSuggestion": ["Aviator", "Wayfarer"]
  }'
```

### Get All Users
```bash
curl http://localhost:5000/api/users
```

---

## 📦 Install Dependencies

### Backend
```bash
cd /home/codewithmishu/OptiFit/backend
npm install
```

### Frontend
```bash
cd /home/codewithmishu/OptiFit/frontend
npm install
```

---

## 🧹 Clean and Reinstall

### Backend
```bash
cd /home/codewithmishu/OptiFit/backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend
```bash
cd /home/codewithmishu/OptiFit/frontend
rm -rf node_modules package-lock.json .next
npm install
```

---

## 📝 Environment Files

### View Backend .env
```bash
cat /home/codewithmishu/OptiFit/backend/.env
```

### Edit Backend .env
```bash
nano /home/codewithmishu/OptiFit/backend/.env
# or
code /home/codewithmishu/OptiFit/backend/.env
```

### View Frontend .env.local
```bash
cat /home/codewithmishu/OptiFit/frontend/.env.local
```

---

## 🔍 Check Logs

### Backend TypeScript Check
```bash
cd /home/codewithmishu/OptiFit/backend
npx tsc --noEmit
```

### Frontend Build Check
```bash
cd /home/codewithmishu/OptiFit/frontend
npm run build
```

---

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health
- **API Endpoints**:
  - POST `/api/users` - Create user
  - GET `/api/users` - List all users
  - GET `/api/users/:id` - Get user by ID

---

## 🎯 First Time Setup

1. **Install backend dependencies**:
   ```bash
   cd /home/codewithmishu/OptiFit/backend && npm install
   ```

2. **Install frontend dependencies**:
   ```bash
   cd /home/codewithmishu/OptiFit/frontend && npm install
   ```

3. **Set up MongoDB Atlas** (see START_HERE.md)

4. **Update backend/.env** with MongoDB connection string

5. **Start backend**:
   ```bash
   cd /home/codewithmishu/OptiFit/backend && npm run dev
   ```

6. **Start frontend** (new terminal):
   ```bash
   cd /home/codewithmishu/OptiFit/frontend && npm run dev
   ```

7. **Open browser**: http://localhost:3000

---

## 📚 Documentation Files

- **START_HERE.md** - Quickest setup instructions
- **SETUP_GUIDE.md** - Detailed setup with MongoDB Atlas
- **README.md** - Project overview and features
- **COMMANDS.md** - This file
