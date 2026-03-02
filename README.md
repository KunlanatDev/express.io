# Express Platform - Enterprise Delivery & Logistics System

> **"Express ที่ดีที่สุด"** - ชนะด้วย ETA แม่น, Matching ฉลาด, Realtime เชื่อถือได้ + พร้อมต่อยอดเป็น Shopping Platform

## 🎯 Overview

Express Platform เป็นระบบ Delivery & Logistics แบบ Enterprise-grade ที่ออกแบบมาเพื่อให้ดีกว่า Grab/LineMan/Lalamove ด้วยฟีเจอร์ที่ครบครันและสถาปัตยกรรมที่ยืดหยุ่น พร้อมรองรับการขยายเป็น Shopping Platform ในอนาคต

### Key Differentiators

- ✅ **ETA แม่นยำ** - คำนวณเวลารับ-ส่งแบบ realtime (traffic + rider density)
- ✅ **Smart Matching** - จับคู่ rider ที่เหมาะสมที่สุด (ไม่ใช่แค่ใกล้สุด)
- ✅ **Multi-stop/Multi-parcel** - รองรับหลายจุดรับ-ส่ง + หลายประเภทพัสดุ
- ✅ **Special Services** - รอรับ, ยกของ, ช่วยแพ็ค, COD, ประกัน
- ✅ **Realtime Tracking** - ติดตามสถานะและตำแหน่งแบบ realtime
- ✅ **Security & Proof** - OTP, รูปถ่าย, ลายเซ็น, audit trail

## 🏗️ Architecture

### Repository Structure

```
POC/
├── platform-core/              # Shared Platform Services
│   ├── cmd/api/               # Main API entry
│   ├── internal/              # Business logic
│   └── pkg/                   # Shared packages
│
├── express-service/           # Express Domain Service
│   ├── cmd/api/              # Express API
│   ├── internal/             # Express logic
│   └── internal/workflow/    # Temporal workflows
│
├── realtime-gateway/         # WebSocket Gateway
│   ├── cmd/api/             # Gateway entry
│   └── internal/            # WebSocket handlers
│
├── express-customer-web/     # Customer Web (React TS)
├── express-merchant-web/     # Merchant Web (React TS)
├── express-admin-web/        # Admin Web (React TS)
│
├── express_customer_app/     # Customer Mobile (Flutter)
├── express_merchant_app/     # Merchant Mobile (Flutter)
└── express_rider_app/        # Rider Mobile (Flutter)
```

### Tech Stack

**Backend**

- Go (Fiber framework)
- Temporal (Workflow orchestration)
- PostgreSQL (Transactional data)
- Redis (Cache, Realtime, Geo)

**Frontend**

- React TypeScript (Web applications)
- Flutter (Mobile applications)

**Infrastructure**

- WebSocket (Realtime communication)
- Kafka/Redis Streams (Event streaming)
- Docker & Docker Compose

## 🚀 Quick Start

> **📖 สำหรับคู่มือการรันแบบละเอียด ดูที่ [RUN_GUIDE.md](./RUN_GUIDE.md)**  
> **⚡ สำหรับ Quick Reference ดูที่ [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)**

### Prerequisites

- Go 1.22+
- Node.js 18+
- Flutter 3.19+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### 1. Start Infrastructure

```bash
docker-compose up -d postgres redis temporal
```

### 2. Start Backend Services

**Platform Core**

```bash
cd platform-core
go mod download
go run cmd/api/main.go
```

**Express Service**

```bash
cd express-service
go mod download
go run cmd/api/main.go
```

**Realtime Gateway**

```bash
cd realtime-gateway
go mod download
go run cmd/api/main.go
```

### 3. Start Frontend Applications

**Customer Web**

```bash
cd express-customer-web
npm install
npm run dev
```

**Merchant Web**

```bash
cd express-merchant-web
npm install
npm run dev
```

**Admin Web**

```bash
cd express-admin-web
npm install
npm run dev
```

### 4. Start Mobile Apps

**Customer App**

```bash
cd express_customer_app
flutter pub get
flutter run
```

**Merchant App**

```bash
cd express_merchant_app
flutter pub get
flutter run
```

**Rider App**

```bash
cd express_rider_app
flutter pub get
flutter run
```

## 📋 Features

### For Customers

- 📦 สร้างออเดอร์ (ด่วน 1-2 ชม / ภายในวัน / ข้ามจังหวัด)
- 🗺️ Multi-stop delivery (รับ-ส่งหลายที่)
- 📅 Scheduled delivery (นัดหมายล่วงหน้า)
- 💰 ราคาโปร่งใส + Promotion
- 📍 Live tracking + Share link
- 💬 Chat/Call masking
- 🧾 Receipt & Invoice

### For Merchants

- 🏢 Organization management (Owner/Admin/Staff roles)
- 📋 Bulk order creation / CSV import
- 📊 SLA dashboard
- 💵 COD management
- 📦 Address book + Warehouse
- 🔌 API integration

### For Riders

- 🎯 Smart job matching
- 🗺️ Navigation integration
- 💰 Wallet & Earnings
- 📈 Performance tracking
- 🚗 Vehicle management
- ✅ Proof of delivery (OTP/Photo/Signature)

### For Admin/Operations

- 🎛️ Order console (realtime)
- 🗺️ Rider console (map view)
- 💲 Pricing configuration
- ✅ KYC review
- ⚖️ Dispute center
- 🛡️ Risk/Fraud dashboard
- 📝 Audit log

## 🔄 Shared Core (Express + Future Shopping)

Platform Core ถูกออกแบบให้ใช้ร่วมกันได้ระหว่าง Express และ Shopping:

- **Identity & Access** - User, Merchant, Rider, Admin + RBAC
- **Payment & Ledger** - Gateway, Wallet, Ledger, COD
- **Geo & Location** - Geocoding, Zones, GPS tracking
- **Communication** - Push, SMS, Email, Chat, Call masking
- **Media** - Image upload, Document storage
- **Promotion** - Coupon, Membership, Campaign
- **Observability** - Logging, Metrics, Tracing, Audit

## 📊 Implementation Phases

### Phase 1: MVP (Foundation) ✅

- Customer order creation + Pricing
- Basic matching algorithm
- Rider app (accept/deliver)
- Realtime tracking
- Proof of delivery
- Basic payment

### Phase 2: Competitive Edge 🚧

- Multi-stop delivery
- Add-on services
- Scheduled delivery
- SLA management
- Merchant org + Roles
- Admin console with map
- Dispute/Refund

### Phase 3: Enterprise Grade 📅

- Fraud/Risk detection
- Complete ledger system
- Insurance integration
- Cross-province hub
- Corporate billing
- Advanced promotion

### Phase 4: Shopping Platform 🔮

- Product catalog
- Shopping cart
- Checkout flow
- Order management
- Fulfillment → Express

## 🔐 Security

- JWT authentication
- Role-based access control (RBAC)
- KYC verification
- GPS anti-spoofing
- Proof of delivery (OTP/Photo/Signature)
- Audit trail
- Data encryption
- Rate limiting

## 📖 Documentation

- [Architecture Overview](.agent/artifacts/express_platform_architecture.md)
- [API Documentation](docs/api/)
- [Deployment Guide](docs/deployment/)
- [Development Guide](docs/development/)

## 🤝 Contributing

This is an enterprise project. Please follow the contribution guidelines.

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ for the best Express & Shopping Platform**
