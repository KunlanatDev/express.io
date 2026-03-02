# 🚀 Express Platform - Quick Reference

## เริ่มต้นด่วน (5 นาที)

### 1. Start Infrastructure

```bash
cd /Users/kullanatpakine/Desktop/POP/POC
docker-compose up -d postgres redis temporal temporal-ui
```

### 2. Setup Environment (ครั้งแรกเท่านั้น)

```bash
# Platform Core
cd platform-core && cp .env.example .env

# Express Service
cd ../express-service && cp .env.example .env

# Realtime Gateway
cd ../realtime-gateway
echo "ENVIRONMENT=development
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=8083" > .env
```

_(⚠️ อย่าลืมแก้ .env ให้ Platform Core ใช้ Port 8081 และ DB Port 5434)_

### 3. Start Backend (3 Terminals)

```bash
# Terminal 1
cd platform-core && go run cmd/api/main.go
# (Port 8081)

# Terminal 2
cd express-service && go run cmd/api/main.go
# (Port 8082)

# Terminal 3
cd realtime-gateway && go run cmd/api/main.go
# (Port 8083)
```

### 4. Start Frontend (3 Terminals)

```bash
# Terminal 4
cd express-customer-web && npm install && npm run dev

# Terminal 5
cd express-merchant-web && npm install && npm run dev

# Terminal 6
cd express-admin-web && npm install && npm run dev
```

### 5. Start Rider App (Terminal 7)

```bash
cd express_rider_app && flutter pub get && flutter run
```

---

## 🔍 Health Check

```bash
curl http://localhost:8081/health  # Platform Core (8081)
curl http://localhost:8082/health  # Express Service
curl http://localhost:8083/health  # Realtime Gateway
```

---

## 🌐 URLs

| Service             | URL                   |
| ------------------- | --------------------- |
| Temporal UI         | http://localhost:8080 |
| Platform Core API   | http://localhost:8081 |
| Express Service API | http://localhost:8082 |
| Realtime Gateway    | ws://localhost:8083   |
| Customer Web        | http://localhost:5173 |
| Merchant Web        | http://localhost:5174 |
| Admin Web           | http://localhost:5175 |

---

## 🛑 Stop Everything

```bash
# Stop Docker
docker-compose down

# Stop Backend/Frontend: Ctrl+C in each terminal
```

---

## 📖 เอกสารเพิ่มเติม

- **RUN_GUIDE.md** - คู่มือรันแบบละเอียด (Updated ports)
- **QUICK_START.md** - Quick start guide
