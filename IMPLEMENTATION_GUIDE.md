# Express Platform - Implementation Guide

## 📋 Overview

เอกสารนี้เป็นคู่มือการพัฒนา Express Platform แบบทีละ Phase ตามแผนที่วางไว้

## 🎯 Phase 1: MVP (Foundation)

### Objectives

สร้างระบบพื้นฐานที่ทำงานได้จริง ครอบคลุม:

- Customer สร้างออเดอร์ได้
- ระบบคำนวณราคา
- Matching rider แบบง่าย (ใกล้สุด)
- Rider รับงานและส่งของได้
- Tracking realtime
- Proof of delivery
- Payment พื้นฐาน

### Backend Tasks

#### 1. Platform Core Service

**Auth & User Management**

```go
// internal/controller/auth_controller.go
- POST /api/v1/auth/register (customer, merchant, rider)
- POST /api/v1/auth/login
- POST /api/v1/auth/verify-email
- POST /api/v1/auth/verify-phone
- GET /api/v1/auth/me
```

**User Service**

```go
// internal/service/interface/user_service.go
type UserService interface {
    Register(req RegisterRequest) (*User, error)
    Login(email, password string) (*AuthResponse, error)
    GetByID(id string) (*User, error)
    UpdateProfile(id string, req UpdateProfileRequest) error
}
```

**Wallet & Ledger**

```go
// internal/controller/wallet_controller.go
- GET /api/v1/wallets/me
- POST /api/v1/wallets/topup
- POST /api/v1/wallets/withdraw
- GET /api/v1/wallets/transactions

// internal/service/interface/ledger_service.go
type LedgerService interface {
    RecordTransaction(walletID, txType string, amount float64, ref string) error
    GetBalance(walletID string) (float64, error)
    GetTransactions(walletID string, limit, offset int) ([]Transaction, error)
}
```

#### 2. Express Service

**Order Management**

```go
// internal/controller/order_controller.go
- POST /api/v1/orders (create order)
- GET /api/v1/orders/:id
- GET /api/v1/orders (list with filters)
- PATCH /api/v1/orders/:id/cancel

// internal/model/create_order_request.go
type CreateOrderRequest struct {
    ServiceType    string         `json:"service_type"` // express_1_2h, same_day
    PickupAddress  AddressInput   `json:"pickup_address"`
    DeliveryAddress AddressInput  `json:"delivery_address"`
    PickupContact  ContactInput   `json:"pickup_contact"`
    DeliveryContact ContactInput  `json:"delivery_contact"`
    Parcels        []ParcelInput  `json:"parcels"`
    ScheduledAt    *time.Time     `json:"scheduled_at,omitempty"`
}
```

**Pricing Engine**

```go
// internal/service/interface/pricing_service.go
type PricingService interface {
    CalculatePrice(req PricingRequest) (*PricingResponse, error)
}

type PricingRequest struct {
    ServiceType string
    Distance    float64 // km
    Parcels     []Parcel
    ScheduledAt *time.Time
}

type PricingResponse struct {
    BasePrice     float64
    DistancePrice float64
    TimePrice     float64
    TotalPrice    float64
    ETA           int // minutes
}
```

**Matching Service (Simple)**

```go
// internal/service/interface/matching_service.go
type MatchingService interface {
    FindNearestRider(lat, lng float64, vehicleType string) (*Rider, error)
    OfferJob(riderID, orderID string) error
}
```

**Temporal Workflows**

```go
// internal/workflow/workflows/order_workflow.go
func OrderWorkflow(ctx workflow.Context, orderID string) error {
    // 1. Find rider
    // 2. Offer job (with timeout)
    // 3. Wait for acceptance
    // 4. Track pickup
    // 5. Track delivery
    // 6. Complete order
    // 7. Process payment
}

// internal/workflow/activities/rider_activities.go
func FindRiderActivity(ctx context.Context, orderID string) (string, error)
func OfferJobActivity(ctx context.Context, riderID, orderID string) error
func NotifyRiderActivity(ctx context.Context, riderID, message string) error
```

**Tracking Service**

```go
// internal/controller/tracking_controller.go
- GET /api/v1/tracking/:orderID (public tracking)
- POST /api/v1/tracking/:orderID/location (rider updates location)
- GET /api/v1/tracking/:orderID/timeline

// Store in Redis for realtime
// Persist to Postgres for history
```

#### 3. Realtime Gateway

**WebSocket Handler**

```go
// internal/websocket/handler.go
- WS /ws (connect with JWT)
- Subscribe to channels: order:{orderID}, rider:{riderID}
- Publish events: location_update, status_change

// internal/pubsub/redis_pubsub.go
- Subscribe to Redis channels
- Broadcast to connected WebSocket clients
```

### Frontend Tasks

#### 1. Customer Web (React TS)

**Pages**

```
/                    # Home (create order)
/orders              # Order list
/orders/:id          # Order detail + tracking
/profile             # User profile
/wallet              # Wallet management
```

**Key Components**

```typescript
// src/components/OrderForm.tsx
- Address input with autocomplete
- Parcel details
- Service type selection
- Price calculation (realtime)
- Payment method

// src/components/OrderTracking.tsx
- Map with rider location
- Order timeline
- Chat/Call buttons
- Proof of delivery display

// src/hooks/useWebSocket.ts
- Connect to realtime gateway
- Subscribe to order updates
- Handle reconnection
```

#### 2. Rider App (Flutter)

**Screens**

```dart
// lib/screens/home_screen.dart
- Online/Offline toggle
- Job offers (with countdown)
- Active job display

// lib/screens/job_detail_screen.dart
- Pickup/Delivery details
- Navigation button
- Contact customer
- Update status
- Proof of delivery (OTP/Photo)

// lib/services/location_service.dart
- Background location tracking
- Send location to server every 10s
```

**State Management**

```dart
// lib/providers/job_provider.dart
- Current job state
- Job history
- Earnings

// lib/providers/location_provider.dart
- Current location
- Location permission
- Background tracking status
```

#### 3. Merchant Web (React TS)

**Pages**

```
/dashboard           # Overview (orders, stats)
/orders/create       # Create order
/orders              # Order list
/orders/:id          # Order detail
/address-book        # Saved addresses
```

### Database Migrations

```sql
-- Already covered in init-db.sql
-- Run migrations in order:
1. Create users table
2. Create merchant_orgs table
3. Create rider_profiles table
4. Create wallets & ledger tables
5. Create delivery_orders table
6. Create delivery_stops table
7. Create parcels table
```

### Testing Strategy

**Unit Tests**

- Service layer logic
- Pricing calculations
- Matching algorithm

**Integration Tests**

- API endpoints
- Database operations
- Temporal workflows

**E2E Tests**

- Complete order flow (customer → rider → delivery)
- Payment flow
- Cancellation flow

### Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Temporal server running
- [ ] Redis configured
- [ ] Payment gateway credentials
- [ ] Google Maps API key
- [ ] SSL certificates
- [ ] Monitoring setup (logs, metrics)

---

## 🚀 Phase 2: Competitive Edge

### New Features

#### Multi-stop Delivery

```go
// Modify CreateOrderRequest
type CreateOrderRequest struct {
    // ... existing fields
    Stops []StopInput `json:"stops"` // Multiple pickup/delivery points
}

// Update pricing to calculate route optimization
func (s *PricingService) CalculateMultiStopPrice(stops []Stop) (*PricingResponse, error)
```

#### Add-on Services

```go
// internal/model/addon.go
const (
    AddonWaitPickup   = "wait_pickup"
    AddonLiftHelp     = "lift_help"
    AddonPacking      = "packing"
    AddonHandToHand   = "hand_to_hand"
)

// Add to order creation
type CreateOrderRequest struct {
    // ... existing
    Addons []string `json:"addons"`
}
```

#### SLA Management

```go
// internal/service/interface/sla_service.go
type SLAService interface {
    CalculateSLA(serviceType string, distance float64) (*SLA, error)
    CheckSLAViolation(orderID string) (bool, error)
    ProcessCompensation(orderID string) error
}
```

#### Admin Console

```typescript
// express-admin-web/src/pages/OrderConsole.tsx
- Realtime order map
- Filter by status
- Assign/Reassign rider
- Manual intervention

// express-admin-web/src/pages/RiderConsole.tsx
- Rider heatmap
- Online/Offline status
- Performance metrics
```

---

## 🏢 Phase 3: Enterprise Grade

### Features

#### Fraud Detection

```go
// internal/service/interface/fraud_service.go
type FraudService interface {
    DetectGPSSpoofing(riderID string, locations []Location) (bool, error)
    DetectAbnormalRoute(orderID string) (bool, error)
    FlagSuspiciousActivity(userID, reason string) error
}
```

#### Insurance Integration

```go
// internal/service/interface/insurance_service.go
type InsuranceService interface {
    CreatePolicy(orderID string, declaredValue float64) (*Policy, error)
    FileClaim(orderID, reason string, evidence []string) (*Claim, error)
}
```

#### Cross-Province Hub

```go
// internal/model/hub.go
type Hub struct {
    ID       string
    Name     string
    Location Location
    Coverage []string // province codes
}

// Workflow for hub-to-hub delivery
func CrossProvinceWorkflow(ctx workflow.Context, orderID string) error {
    // 1. Pickup → Origin Hub
    // 2. Hub scan
    // 3. Inter-hub transport
    // 4. Destination Hub scan
    // 5. Last-mile delivery
}
```

---

## 🛍️ Phase 4: Shopping Platform

### Architecture

**Shopping Service** (new)

```
shopping-service/
├── internal/
│   ├── controller/
│   │   ├── product_controller.go
│   │   ├── cart_controller.go
│   │   └── checkout_controller.go
│   ├── service/
│   │   ├── catalog_service.go
│   │   ├── cart_service.go
│   │   └── fulfillment_service.go
```

**Integration with Express**

```go
// shopping-service/internal/service/fulfillment_service.go
func (s *FulfillmentService) CreateDelivery(orderID string) error {
    // Call express-service API to create delivery order
    req := express.CreateOrderRequest{
        ServiceType: "same_day",
        PickupAddress: order.MerchantAddress,
        DeliveryAddress: order.CustomerAddress,
        // ...
    }

    return s.expressClient.CreateOrder(req)
}
```

### Shared Components

- **Users** - Same user table, add `merchant_type` (express_only, shopping_only, both)
- **Payment** - Same payment & ledger system
- **Wallet** - Same wallet for all transactions
- **Promotion** - Extend to support shopping coupons
- **Notification** - Reuse for order updates

---

## 📊 Success Metrics

### Phase 1 (MVP)

- [ ] Order creation success rate > 95%
- [ ] Average matching time < 2 minutes
- [ ] Delivery completion rate > 90%
- [ ] Payment success rate > 98%

### Phase 2 (Competitive)

- [ ] SLA compliance > 95%
- [ ] Customer satisfaction > 4.5/5
- [ ] Rider acceptance rate > 80%
- [ ] Multi-stop adoption > 20%

### Phase 3 (Enterprise)

- [ ] Fraud detection accuracy > 90%
- [ ] Cross-province delivery success > 95%
- [ ] Insurance claim resolution < 48h
- [ ] System uptime > 99.9%

### Phase 4 (Shopping)

- [ ] Shopping order conversion > 3%
- [ ] Express fulfillment integration success > 99%
- [ ] Cross-platform user adoption > 30%

---

## 🔧 Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/order-creation

# Develop
# - Write tests first (TDD)
# - Implement feature
# - Update documentation

# Test
go test ./...
npm test

# Commit
git commit -m "feat: implement order creation API"

# Push & PR
git push origin feature/order-creation
```

### 2. Code Review Checklist

- [ ] Tests written and passing
- [ ] Error handling implemented
- [ ] Logging added
- [ ] Documentation updated
- [ ] Performance considered
- [ ] Security reviewed

### 3. Deployment

```bash
# Build
docker-compose build

# Run migrations
docker-compose run platform-core migrate

# Deploy
docker-compose up -d

# Health check
curl http://localhost:8081/health
```

---

## 📚 Additional Resources

- [API Documentation](./api-docs.md)
- [Database Schema](./database-schema.md)
- [Temporal Workflows](./temporal-workflows.md)
- [Frontend Architecture](./frontend-architecture.md)
- [Security Guidelines](./security.md)
- [Performance Optimization](./performance.md)

---

**Happy Coding! 🚀**
