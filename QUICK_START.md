# 🚀 Express Platform - Quick Start Guide

## ✅ สิ่งที่สร้างเสร็จแล้ว

### Backend Services (Go)

- ✅ **platform-core** - Shared services (Auth, User, Payment, Wallet, Ledger)
- ✅ **express-service** - Express domain (Orders, Matching, Tracking, SLA)
- ✅ **realtime-gateway** - WebSocket gateway for realtime updates

### Frontend Applications

- ✅ **express-customer-web** - Customer web app (React TS + Vite)
- ✅ **express-merchant-web** - Merchant web app (React TS + Vite)
- ✅ **express-admin-web** - Admin web app (React TS + Vite)
- ✅ **express_customer_app** - Customer mobile app (Flutter)
- ✅ **express_merchant_app** - Merchant mobile app (Flutter)
- ✅ **express_rider_app** - Rider mobile app (Flutter)

### Infrastructure

- ✅ **docker-compose.yml** - PostgreSQL, Redis, Temporal setup
- ✅ **Database Schema** - Complete schema for all tables
- ✅ **Environment Templates** - .env.example files

### Documentation

- ✅ **README.md** - Project overview
- ✅ **IMPLEMENTATION_GUIDE.md** - Detailed implementation guide
- ✅ **Architecture Document** - System architecture

---

## 🏃 การเริ่มต้นใช้งาน

### 1. ติดตั้ง Dependencies

**Backend (Go)**

```bash
cd platform-core
go mod download

cd ../express-service
go mod download

cd ../realtime-gateway
go mod download
```

**Frontend Web (React)**

```bash
cd express-customer-web
npm install

cd ../express-merchant-web
npm install

cd ../express-admin-web
npm install
```

**Frontend Mobile (Flutter)**

```bash
cd express_customer_app
flutter pub get

cd ../express_merchant_app
flutter pub get

cd ../express_rider_app
flutter pub get
```

### 2. Setup Environment Variables

**Platform Core**

```bash
cd platform-core
cp .env.example .env
# แก้ไขค่าใน .env ตามต้องการ
```

**Express Service**

```bash
cd express-service
cp .env.example .env
# แก้ไขค่าใน .env ตามต้องการ
```

### 3. Start Infrastructure (Docker)

```bash
# กลับมาที่ root directory
cd /Users/kullanatpakine/Desktop/POP/POC

# Start PostgreSQL, Redis, Temporal
docker-compose up -d postgres redis temporal temporal-ui
```

**ตรวจสอบว่า services ทำงาน:**

```bash
docker-compose ps

# ควรเห็น:
# - express-postgres (port 5432)
# - express-redis (port 6379)
# - express-temporal (port 7233, 8233)
# - express-temporal-ui (port 8080)
```

**เข้าถึง Temporal UI:**

```
http://localhost:8080
```

### 4. Initialize Database

```bash
# Database จะถูก initialize อัตโนมัติจาก scripts/init-db.sql
# ตรวจสอบว่า database ถูกสร้าง:

docker exec -it express-postgres psql -U postgres -c "\l"

# ควรเห็น:
# - platform_core
# - express_service
# - shopping_service (สำหรับอนาคต)
```

### 5. Start Backend Services

**Terminal 1: Platform Core**

```bash
cd platform-core
go run cmd/api/main.go

# API จะทำงานที่: http://localhost:8080
```

**Terminal 2: Express Service**

```bash
cd express-service
go run cmd/api/main.go

# API จะทำงานที่: http://localhost:8082
```

**Terminal 3: Realtime Gateway**

```bash
cd realtime-gateway
go run cmd/api/main.go

# WebSocket จะทำงานที่: ws://localhost:8083
```

### 6. Start Frontend Applications

**Terminal 4: Customer Web**

```bash
cd express-customer-web
npm run dev

# Web จะทำงานที่: http://localhost:5173
```

**Terminal 5: Merchant Web**

```bash
cd express-merchant-web
npm run dev

# Web จะทำงานที่: http://localhost:5174
```

**Terminal 6: Admin Web**

```bash
cd express-admin-web
npm run dev

# Web จะทำงานที่: http://localhost:5175
```

### 7. Start Mobile Apps (Optional)

**Customer App**

```bash
cd express_customer_app
flutter run
```

**Merchant App**

```bash
cd express_merchant_app
flutter run
```

**Rider App**

```bash
cd express_rider_app
flutter run
```

---

## 🧪 ทดสอบระบบ

### 1. Health Check

```bash
# Platform Core
curl http://localhost:8080/health

# Express Service
curl http://localhost:8082/health

# Realtime Gateway
curl http://localhost:8083/health
```

### 2. Test API (ตัวอย่าง)

**Register User**

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "customer"
  }'
```

**Login**

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "password123"
  }'
```

---

## 📁 โครงสร้างโปรเจกต์

```
POC/
├── .agent/                          # Agent artifacts
│   └── artifacts/
│       └── express_platform_architecture.md
│
├── platform-core/                   # Platform Core Service (Go)
│   ├── cmd/api/main.go             # Entry point
│   ├── internal/
│   │   ├── config/                 # Configuration
│   │   ├── controller/             # HTTP handlers
│   │   ├── service/                # Business logic
│   │   ├── repo/                   # Database access
│   │   ├── entity/                 # DB models
│   │   ├── model/                  # DTOs
│   │   └── middleware/             # Middleware
│   ├── pkg/logger/                 # Shared logger
│   ├── go.mod
│   ├── Dockerfile
│   └── .env.example
│
├── express-service/                 # Express Service (Go)
│   ├── cmd/api/main.go
│   ├── internal/
│   │   ├── workflow/               # Temporal workflows
│   │   │   ├── workflows/          # Workflow definitions
│   │   │   └── activities/         # Activity functions
│   │   └── ... (similar to platform-core)
│   ├── go.mod
│   ├── Dockerfile
│   └── .env.example
│
├── realtime-gateway/                # WebSocket Gateway (Go)
│   ├── cmd/api/main.go
│   ├── internal/
│   │   ├── websocket/              # WebSocket handlers
│   │   └── pubsub/                 # Redis pub/sub
│   ├── go.mod
│   └── Dockerfile
│
├── express-customer-web/            # Customer Web (React TS)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── express-merchant-web/            # Merchant Web (React TS)
├── express-admin-web/               # Admin Web (React TS)
│
├── express_customer_app/            # Customer App (Flutter)
│   ├── lib/
│   │   ├── screens/
│   │   ├── widgets/
│   │   ├── services/
│   │   ├── providers/
│   │   └── main.dart
│   └── pubspec.yaml
│
├── express_merchant_app/            # Merchant App (Flutter)
├── express_rider_app/               # Rider App (Flutter)
│
├── scripts/
│   └── init-db.sql                 # Database initialization
│
├── docker-compose.yml              # Infrastructure setup
├── README.md                       # Project overview
└── IMPLEMENTATION_GUIDE.md         # Implementation guide
```

---

## 🎯 ขั้นตอนถัดไป

### Phase 1: MVP (ลำดับความสำคัญ)

1. **Platform Core**
   - [ ] Implement Auth Controller (register, login, verify)
   - [ ] Implement User Service
   - [ ] Implement Wallet & Ledger Service
   - [ ] Add JWT middleware

2. **Express Service**
   - [ ] Implement Order Controller (create, get, list, cancel)
   - [ ] Implement Pricing Service (calculate price + ETA)
   - [ ] Implement Matching Service (find nearest rider)
   - [ ] Setup Temporal workflows (order lifecycle)
   - [ ] Implement Tracking Service

3. **Realtime Gateway**
   - [ ] Implement WebSocket handler
   - [ ] Setup Redis pub/sub
   - [ ] Implement event broadcasting

4. **Customer Web**
   - [ ] Create order form with address autocomplete
   - [ ] Implement pricing calculation (realtime)
   - [ ] Build order tracking page with map
   - [ ] Add WebSocket integration

5. **Rider App**
   - [ ] Build home screen (online/offline toggle)
   - [ ] Implement job offer screen
   - [ ] Add navigation integration
   - [ ] Build proof of delivery screen (OTP/Photo)
   - [ ] Setup background location tracking

6. **Merchant Web**
   - [ ] Build dashboard
   - [ ] Create order creation form
   - [ ] Implement order list & detail
   - [ ] Add address book management

---

## 🐛 Troubleshooting

### Database Connection Error

```bash
# ตรวจสอบว่า PostgreSQL ทำงาน
docker-compose ps postgres

# ดู logs
docker-compose logs postgres

# Restart
docker-compose restart postgres
```

### Redis Connection Error

```bash
# ตรวจสอบ Redis
docker-compose ps redis

# Test connection
docker exec -it express-redis redis-cli ping
# ควรได้ PONG
```

### Temporal Connection Error

```bash
# ตรวจสอบ Temporal
docker-compose ps temporal

# ดู logs
docker-compose logs temporal

# เข้า Temporal UI
open http://localhost:8080
```

### Go Module Error

```bash
# Clear cache
go clean -modcache

# Re-download
go mod download
go mod tidy
```

### Flutter Error

```bash
# Clean
flutter clean

# Get dependencies
flutter pub get

# Run doctor
flutter doctor
```

---

## 📞 Support

หากมีปัญหาหรือคำถาม:

1. ตรวจสอบ logs ของ service ที่มีปัญหา
2. อ่าน IMPLEMENTATION_GUIDE.md สำหรับรายละเอียดเพิ่มเติม
3. ตรวจสอบ .env configuration

---

**Happy Coding! 🚀**
