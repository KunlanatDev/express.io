# Express Platform - Enterprise Architecture

## 🎯 Vision

สร้าง "Express Platform ที่ดีที่สุด" ที่ชนะ Grab/LineMan/Lalamove ด้วย:

- **ETA แม่นยำ** + SLA ชัดเจน (ด่วน 1-2 ชม, ภายในวัน, ข้ามจังหวัด)
- **Matching ฉลาด** (ไม่ใช่แค่ใกล้สุด แต่ดูความเหมาะสม)
- **Multi-stop/Multi-parcel** + Special Services
- **Realtime ที่เชื่อถือได้** + ระบบความปลอดภัย
- **พร้อมต่อยอดเป็น Shopping Platform** (ใช้ฐานร่วมกัน)

## 🏗️ Repository Structure

### Shared Platform (Core Services)

```
platform-core/              # Auth, User, Payment, Notification, Geo
realtime-gateway/           # WebSocket, PubSub
shared-proto/              # Event Schema, OpenAPI
```

### Express Domain

```
express-service/           # Delivery, Matching, Tracking, SLA
express-temporal/          # Workflow Orchestration
```

### Shopping Domain (Future)

```
shopping-service/          # Catalog, Cart, Order, Fulfillment
```

### Frontend Applications

```
express-customer-web/      # React TS
express-customer-app/      # Flutter
express-merchant-web/      # React TS
express-merchant-app/      # Flutter
express-rider-app/         # Flutter
express-admin-web/         # React TS
```

## 🔧 Tech Stack

### Backend

- **Go** (Fiber framework)
- **Temporal** (Workflow orchestration)
- **PostgreSQL** (Transactional data)
- **Redis** (Cache, Realtime, Geo)

### Frontend

- **Flutter** (Mobile apps)
- **React TypeScript** (Web apps)

### Infrastructure

- **WebSocket** (Realtime updates)
- **Kafka/Redis Streams** (Event streaming)
- **Payment Gateway** + Ledger Service

## 📋 Core Features

### A) Order & Delivery

- ประเภทบริการ: ด่วน 1-2 ชม / ภายในวัน / ข้ามจังหวัด
- Multi-stop (รับ-ส่งหลายที่)
- Scheduled delivery
- Parcel types: เอกสาร / กล่อง / อาหาร / ของแตกหัก / แช่เย็น / มูลค่าสูง
- Add-ons: รอรับ / ยกของ / ช่วยแพ็ค / ส่งถึงมือ
- Proof: OTP + รูป + ลายเซ็น + บาร์โค้ด
- Insurance + Declare value

### B) Pricing & Promotion

- โปร่งใส: base + distance + time + demand + add-ons
- Surge control
- Coupon / Membership / Corporate billing

### C) Rider System

- Online/Offline + Heatmap
- Job offer/accept/reject
- Navigation integration
- Wallet + Earnings
- Fraud detection (GPS spoof)

### D) Merchant System

- บุคคล vs ธุรกิจ + Role-based access
- Address book + Warehouse
- Bulk order / CSV import / API
- COD management
- SLA dashboard

### E) Customer Experience

- Saved locations
- Live tracking + Share link
- Chat/Call masking
- Complaint/Claim flow
- Receipt/Invoice

### F) Admin/Operations

- Order console (realtime)
- Rider console (map view)
- Pricing config
- KYC review
- Dispute center
- Risk/Fraud dashboard
- Audit log + Permissions

## 🔄 Shared Core (Express + Shopping)

### Identity & Access

- User management (Customer/Merchant/Rider/Admin)
- RBAC (Role-Based Access Control)
- Multi-tenant support

### Payment & Ledger

- Payment gateway integration
- Wallet system
- Ledger service (ทุกเงินเข้าออกต้องมีรายการ)
- COD management

### Geo & Location

- Geocoding
- Zone management
- GPS tracking
- Distance calculation

### Communication

- Push notification
- SMS/Email
- In-app chat
- Call masking

### Media & Storage

- Image upload (Proof, KYC)
- Document storage

### Promotion Engine

- Coupon system
- Membership tiers
- Campaign management

### Observability

- Logging
- Metrics
- Tracing
- Audit log

## 🚀 Implementation Phases

### Phase 1: MVP (Foundation)

- Customer create order + Pricing
- Basic matching algorithm
- Rider app (accept/deliver)
- Realtime tracking
- Proof of delivery
- Basic payment

### Phase 2: Competitive Edge

- Multi-stop delivery
- Add-on services
- Scheduled delivery
- SLA management
- Merchant org + Roles
- Admin console with map
- Dispute/Refund system

### Phase 3: Enterprise Grade

- Fraud/Risk detection
- Complete ledger system
- Insurance integration
- Cross-province hub
- Corporate billing
- Advanced promotion engine

### Phase 4: Shopping Platform

- Product catalog
- Shopping cart
- Checkout flow
- Order management
- Fulfillment → Express integration

## 🏛️ Clean Architecture (Go Services)

```
/cmd/api                    # Main entry point
/internal
  /config                   # Configuration
  /controller               # HTTP handlers
  /service                  # Business logic interface
  /service/impl             # Implementation
  /repo                     # Database access
  /entity                   # DB models
  /model                    # DTOs
  /domain                   # Domain models
  /middleware               # HTTP middleware
  /errors                   # Error handling
  /events                   # Event pub/sub
  /workflow                 # Temporal workflows
/pkg                        # Shared libraries
```

## 🔐 Security & Compliance

- KYC verification
- Proof of pickup/delivery
- OTP verification
- GPS anti-spoofing
- Audit trail
- Data encryption
- Rate limiting
- Anti-abuse mechanisms

## 📊 Observability & Monitoring

- Structured logging
- Metrics (Prometheus)
- Distributed tracing
- Error tracking
- Performance monitoring
- Business metrics dashboard

## 🌐 API Architecture

- **External**: API Gateway / BFF
- **Internal**: HTTP/gRPC between services
- **Async**: Event-driven (Kafka/Redis Streams)
- **Events**: order._, payment._, rider.location._, merchant._
