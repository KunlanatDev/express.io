# 🚀 Express Platform - คู่มือการรันทั้งหมด (Step by Step)

## 📋 สารบัญ

1. [ตรวจสอบ Prerequisites](#1-ตรวจสอบ-prerequisites)
2. [Setup Environment Variables](#2-setup-environment-variables)
3. [Start Infrastructure](#3-start-infrastructure)
4. [Start Backend Services](#4-start-backend-services)
5. [Start Frontend Applications](#5-start-frontend-applications)
6. [ทดสอบระบบ](#6-ทดสอบระบบ)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. ตรวจสอบ Prerequisites

### ✅ ตรวจสอบว่าติดตั้งครบหรือยัง

```bash
# ตรวจสอบ Go
go version
# ควรได้: go version go1.22.x หรือสูงกว่า

# ตรวจสอบ Node.js
node --version
# ควรได้: v18.x.x หรือสูงกว่า

# ตรวจสอบ npm
npm --version
# ควรได้: 9.x.x หรือสูงกว่า

# ตรวจสอบ Flutter
flutter --version
# ควรได้: Flutter 3.19.x หรือสูงกว่า

# ตรวจสอบ Docker
docker --version
# ควรได้: Docker version 24.x.x หรือสูงกว่า

# ตรวจสอบ Docker Compose
docker-compose --version
# ควรได้: Docker Compose version v2.x.x หรือสูงกว่า
```

### ❌ ถ้ายังไม่มี ให้ติดตั้ง:

**macOS:**

```bash
# ติดตั้ง Homebrew (ถ้ายังไม่มี)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# ติดตั้ง Go
brew install go

# ติดตั้ง Node.js
brew install node

# ติดตั้ง Flutter
brew install --cask flutter

# ติดตั้ง Docker Desktop
brew install --cask docker
```

---

## 2. Setup Environment Variables

### Step 2.1: Platform Core

```bash
cd /Users/kullanatpakine/Desktop/POP/POC/platform-core

# Copy environment template
cp .env.example .env

# แก้ไขไฟล์ .env (ใช้ editor ที่ชอบ)
nano .env
# หรือ
code .env
```

**แก้ไขค่าใน .env:**

```bash
# Environment
ENVIRONMENT=development

# Database (PostgreSQL Port ที่เปลี่ยนใหม่ให้ไม่ชน)
DB_HOST=localhost
DB_PORT=5434
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=platform_core
DB_SSL_MODE=disable

# Redis (ใช้ค่าเดิมได้เลย ถ้ารัน Docker)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT (⚠️ สำคัญ: เปลี่ยนเป็น secret ของคุณ)
JWT_SECRET=your-super-secret-key-change-this-in-production

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:5175

# Payment Gateway (ใส่ค่าจริงถ้ามี หรือปล่อยว่างไว้ก่อน)
PAYMENT_GATEWAY_URL=
PAYMENT_API_KEY=
PAYMENT_SECRET_KEY=

# Server (เปลี่ยนเป็น 8081 เพื่อไม่ให้ชนกับ Temporal UI 8080)
PORT=8081
```

### Step 2.2: Express Service

```bash
cd /Users/kullanatpakine/Desktop/POP/POC/express-service

# Copy environment template
cp .env.example .env

# แก้ไขไฟล์ .env
nano .env
```

**แก้ไขค่าใน .env:**

```bash
# Environment
ENVIRONMENT=development

# Database
DB_HOST=localhost
DB_PORT=5434
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=express_service
DB_SSL_MODE=disable

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Temporal
TEMPORAL_HOST=localhost:7233
TEMPORAL_NAMESPACE=default

# Platform Core API (ชี้ไปที่ Port 8081)
PLATFORM_CORE_URL=http://localhost:8081

# Google Maps API (⚠️ ต้องมี API key จริง)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Server
PORT=8082
```

### Step 2.3: Realtime Gateway

```bash
cd /Users/kullanatpakine/Desktop/POP/POC/realtime-gateway

# สร้างไฟล์ .env
cat > .env << 'EOF'
ENVIRONMENT=development
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
PORT=8083
EOF
```

---

## 3. Start Infrastructure

### Step 3.1: Start Docker Services

```bash
# กลับไป root directory
cd /Users/kullanatpakine/Desktop/POP/POC

# Start PostgreSQL, Redis, Temporal
docker-compose up -d postgres redis temporal temporal-ui
```

### Step 3.2: ตรวจสอบว่า Services ทำงาน

```bash
# ดูสถานะ
docker-compose ps

# ควรเห็น:
# NAME                    STATUS
# express-postgres        Up
# express-redis           Up
# express-temporal        Up
# express-temporal-ui     Up
```

### Step 3.3: ดู Logs (ถ้าต้องการ)

```bash
# ดู logs ทั้งหมด
docker-compose logs -f

# หรือดูแค่ service เดียว
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f temporal
```

### Step 3.4: ตรวจสอบ Database

```bash
# เชื่อมต่อ PostgreSQL
docker exec -it express-postgres psql -U postgres

# ตรวจสอบว่า databases ถูกสร้างแล้ว
\l

# ควรเห็น:
# - platform_core
# - express_service
# - shopping_service

# ออกจาก psql
\q
```

### Step 3.5: เข้าถึง Temporal UI

เปิด browser:

```
http://localhost:8080
```

คุณจะเห็น Temporal Web UI สำหรับดู workflows (Port 8080)

---

## 4. Start Backend Services

### 🔴 สำคัญ: เปิดแต่ละ service ใน Terminal แยกกัน

### Step 4.1: Platform Core (Terminal 1)

```bash
# Terminal 1
cd /Users/kullanatpakine/Desktop/POP/POC/platform-core

# Download dependencies (ถ้ายังไม่เคย)
go mod tidy

# Run service
go run cmd/api/main.go
```

**ผลลัพธ์ที่ควรเห็น:**

```
INFO    Starting Platform Core API on port 8081
```

**ทดสอบ:**

```bash
# Terminal ใหม่
curl http://localhost:8081/health

# ควรได้:
{"status":"ok","service":"platform-core"}
```

### Step 4.2: Express Service (Terminal 2)

```bash
# Terminal 2
cd /Users/kullanatpakine/Desktop/POP/POC/express-service

# Download dependencies (ถ้ายังไม่เคย)
go mod tidy

# Run service
go run cmd/api/main.go
```

**ผลลัพธ์ที่ควรเห็น:**

```
INFO    Starting Express Service API on port 8082
```

**ทดสอบ:**

```bash
# Terminal ใหม่
curl http://localhost:8082/health

# ควรได้:
{"status":"ok","service":"express-service"}
```

### Step 4.3: Realtime Gateway (Terminal 3)

```bash
# Terminal 3
cd /Users/kullanatpakine/Desktop/POP/POC/realtime-gateway

# Download dependencies (ถ้ายังไม่เคย)
go mod tidy

# Run service
go run cmd/api/main.go
```

**ผลลัพธ์ที่ควรเห็น:**

```
INFO    Starting Realtime Gateway on port 8083
```

**ทดสอบ:**

```bash
# Terminal ใหม่
curl http://localhost:8083/health

# ควรได้:
{"status":"ok","service":"realtime-gateway"}
```

---

## 5. Start Frontend Applications

### Step 5.1: Customer Web (Terminal 4)

```bash
# Terminal 4
cd /Users/kullanatpakine/Desktop/POP/POC/express-customer-web

# Install dependencies (ครั้งแรกเท่านั้น)
npm install

# Run dev server
npm run dev
```

**ผลลัพธ์ที่ควรเห็น:**

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**เปิด browser:**

```
http://localhost:5173
```

### Step 5.2: Merchant Web (Terminal 5)

```bash
# Terminal 5
cd /Users/kullanatpakine/Desktop/POP/POC/express-merchant-web

# Install dependencies (ครั้งแรกเท่านั้น)
npm install

# Run dev server
npm run dev
```

**เปิด browser:**

```
http://localhost:5174
```

### Step 5.3: Admin Web (Terminal 6)

```bash
# Terminal 6
cd /Users/kullanatpakine/Desktop/POP/POC/express-admin-web

# Install dependencies (ครั้งแรกเท่านั้น)
npm install

# Run dev server
npm run dev
```

**เปิด browser:**

```
http://localhost:5175
```

### Step 5.4: Rider App (Terminal 7) - Flutter

```bash
# Terminal 7
cd /Users/kullanatpakine/Desktop/POP/POC/express_rider_app

# Get dependencies (ครั้งแรกเท่านั้น)
flutter pub get

# Run app (เลือก device ที่ต้องการ)
flutter run

# หรือระบุ device เฉพาะ
flutter run -d chrome        # Web browser
flutter run -d macos         # macOS desktop
flutter run -d <device-id>   # iOS/Android simulator
```

### Step 5.5: Customer App (Optional - Terminal 8)

```bash
# Terminal 8
cd /Users/kullanatpakine/Desktop/POP/POC/express_customer_app

flutter pub get
flutter run
```

### Step 5.6: Merchant App (Optional - Terminal 9)

```bash
# Terminal 9
cd /Users/kullanatpakine/Desktop/POP/POC/express_merchant_app

flutter pub get
flutter run
```

---

## 6. ทดสอบระบบ

### ✅ Health Check ทุก Services

```bash
# Platform Core
curl http://localhost:8081/health

# Express Service
curl http://localhost:8082/health

# Realtime Gateway
curl http://localhost:8083/health
```

### ✅ ทดสอบ API Flow

#### 6.1 Register User

```bash
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User",
    "role": "customer"
  }'
```

#### 6.2 Login

```bash
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**บันทึก access_token ที่ได้**

#### 6.3 Get Current User

```bash
curl http://localhost:8081/api/v1/users/me \
  -H "Authorization: Bearer {access_token}"
```

---

## 7. Troubleshooting

### ❌ Problem: Port already in use

```bash
# ดูว่า port ไหนถูกใช้
lsof -i :8081  # Platform Core
lsof -i :8082  # Express Service
lsof -i :8083  # Realtime Gateway
lsof -i :5173  # Customer Web
lsof -i :5434  # PostgreSQL (Changed from 5432)
lsof -i :6379  # Redis

# Kill process ที่ใช้ port
kill -9 <PID>
```

### ❌ Problem: Docker containers not starting

```bash
# Stop all containers
docker-compose down

# Remove volumes
docker-compose down -v

# Start again
docker-compose up -d postgres redis temporal temporal-ui

# Check logs
docker-compose logs -f
```

### ❌ Problem: Database connection error

```bash
# ตรวจสอบว่า PostgreSQL ทำงาน
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# ดู logs
docker-compose logs postgres

# ทดสอบเชื่อมต่อ
docker exec -it express-postgres psql -U postgres -c "SELECT 1"
```

### ❌ Problem: Missing Module / go.mod

```bash
cd <service-folder>
go mod tidy
```

---

## 📊 สรุป: Services ทั้งหมดที่ต้องรัน

| Service          | Port       | Terminal   | URL                   |
| ---------------- | ---------- | ---------- | --------------------- |
| PostgreSQL       | 5434       | Docker     | - (Host Port 5434)    |
| Redis            | 6379       | Docker     | -                     |
| Temporal         | 7233, 8233 | Docker     | -                     |
| Temporal UI      | 8080       | Docker     | http://localhost:8080 |
| Platform Core    | 8081       | Terminal 1 | http://localhost:8081 |
| Express Service  | 8082       | Terminal 2 | http://localhost:8082 |
| Realtime Gateway | 8083       | Terminal 3 | http://localhost:8083 |
| Customer Web     | 5173       | Terminal 4 | http://localhost:5173 |
| Merchant Web     | 5174       | Terminal 5 | http://localhost:5174 |
| Admin Web        | 5175       | Terminal 6 | http://localhost:5175 |
| Rider App        | -          | Terminal 7 | Flutter app           |

---

## 🎯 Quick Commands (ใช้ Makefile)

```bash
# Setup ทั้งหมด (ครั้งแรก)
make dev-setup

# Start infrastructure
make infra-up

# Start backend (แต่ละ terminal)
make platform-core      # Terminal 1
make express-service    # Terminal 2
make realtime-gateway   # Terminal 3

# Start frontend (แต่ละ terminal)
make web-customer       # Terminal 4
make web-merchant       # Terminal 5
make web-admin          # Terminal 6
make flutter-rider      # Terminal 7

# Health check
make health-check

# Stop infrastructure
make infra-down
```

---

**พร้อมแล้ว! เริ่มพัฒนาได้เลย! 🚀**
