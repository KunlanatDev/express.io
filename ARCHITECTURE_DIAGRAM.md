# Express Platform - System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLIENT APPLICATIONS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Customer    │  │  Merchant    │  │   Admin      │  │   Rider      │   │
│  │  Web (React) │  │  Web (React) │  │  Web (React) │  │ App (Flutter)│   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                 │                 │            │
│  ┌──────▼───────┐  ┌──────▼───────┐                    ┌──────▼───────┐   │
│  │  Customer    │  │  Merchant    │                    │              │   │
│  │ App (Flutter)│  │ App (Flutter)│                    │              │   │
│  └──────┬───────┘  └──────┬───────┘                    │              │   │
│         │                 │                             │              │   │
└─────────┼─────────────────┼─────────────────────────────┼──────────────┘
          │                 │                             │
          │                 │                             │
          ▼                 ▼                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY / BFF                                   │
│                     (Load Balancer + Rate Limiting)                          │
└─────────────────────────────────────────────────────────────────────────────┘
          │                 │                             │
          │                 │                             │
┌─────────▼─────────────────▼─────────────────────────────▼───────────────────┐
│                          BACKEND SERVICES (Go)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                    PLATFORM CORE SERVICE                            │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │    │
│  │  │     Auth     │  │    User      │  │   Payment    │             │    │
│  │  │   & RBAC     │  │  Management  │  │   Gateway    │             │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │    │
│  │  │   Wallet     │  │    Ledger    │  │  Promotion   │             │    │
│  │  │   Service    │  │   Service    │  │   Engine     │             │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │    │
│  │  │     Geo      │  │ Notification │  │    Media     │             │    │
│  │  │   Service    │  │   Service    │  │   Service    │             │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                    EXPRESS SERVICE                                  │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │    │
│  │  │    Order     │  │   Pricing    │  │   Matching   │             │    │
│  │  │  Management  │  │   Engine     │  │   Service    │             │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │    │
│  │  │   Tracking   │  │     SLA      │  │   Dispute    │             │    │
│  │  │   Service    │  │  Management  │  │   Service    │             │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                  REALTIME GATEWAY                                   │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │    │
│  │  │  WebSocket   │  │   Pub/Sub    │  │   Presence   │             │    │
│  │  │   Handler    │  │   Manager    │  │   Service    │             │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└──────────────────────────────┬───────────────────────────────────────────────┘
                               │
                               │
┌──────────────────────────────▼───────────────────────────────────────────────┐
│                      WORKFLOW ORCHESTRATION                                   │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    TEMPORAL SERVER                                   │    │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │    │
│  │  │  Order Workflow  │  │  Matching Flow   │  │  Payment Flow    │  │    │
│  │  │  (Lifecycle)     │  │  (Find Rider)    │  │  (Settlement)    │  │    │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘  │    │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │    │
│  │  │  SLA Monitoring  │  │  Notification    │  │  Retry Logic     │  │    │
│  │  │  (Timeout)       │  │  (Async)         │  │  (Resilience)    │  │    │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
                               │
                               │
┌──────────────────────────────▼───────────────────────────────────────────────┐
│                          DATA LAYER                                           │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌────────────────────────────┐  ┌────────────────────────────┐             │
│  │      PostgreSQL 15         │  │         Redis 7            │             │
│  ├────────────────────────────┤  ├────────────────────────────┤             │
│  │ • platform_core DB         │  │ • Session Store            │             │
│  │   - users                  │  │ • Cache Layer              │             │
│  │   - merchant_orgs          │  │ • Rate Limiting            │             │
│  │   - rider_profiles         │  │ • Pub/Sub (Realtime)       │             │
│  │   - wallets                │  │ • Geo Index (Rider Loc)    │             │
│  │   - ledger                 │  │ • Job Queue                │             │
│  │   - promotions             │  │ • Presence (Online/Offline)│             │
│  │   - audit_logs             │  │                            │             │
│  │                            │  │                            │             │
│  │ • express_service DB       │  │                            │             │
│  │   - delivery_orders        │  │                            │             │
│  │   - delivery_stops         │  │                            │             │
│  │   - parcels                │  │                            │             │
│  │   - order_addons           │  │                            │             │
│  │   - rider_jobs             │  │                            │             │
│  │   - disputes               │  │                            │             │
│  └────────────────────────────┘  └────────────────────────────┘             │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
                               │
                               │
┌──────────────────────────────▼───────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                                        │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Google Maps │  │   Payment    │  │     SMS      │  │    Email     │    │
│  │     API      │  │   Gateway    │  │   Provider   │  │   Provider   │    │
│  │  (Geocoding, │  │  (Stripe,    │  │   (Twilio)   │  │  (SendGrid)  │    │
│  │   Distance,  │  │   Omise)     │  │              │  │              │    │
│  │   Routing)   │  │              │  │              │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘


┌───────────────────────────────────────────────────────────────────────────────┐
│                          EVENT FLOW (Example)                                 │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  1. Customer creates order (Customer Web/App)                                │
│     └─> POST /api/v1/orders → Express Service                                │
│                                                                               │
│  2. Express Service starts Temporal workflow                                 │
│     └─> OrderWorkflow.Execute(orderID)                                       │
│                                                                               │
│  3. Temporal executes activities:                                            │
│     ├─> FindRiderActivity (Matching Service)                                 │
│     ├─> OfferJobActivity (Notification Service)                              │
│     └─> WaitForAcceptanceActivity (with timeout)                             │
│                                                                               │
│  4. Rider accepts job (Rider App)                                            │
│     └─> POST /api/v1/riders/me/jobs/{id}/accept                              │
│         └─> Signal to Temporal workflow                                      │
│                                                                               │
│  5. Rider updates location (background)                                      │
│     └─> POST /api/v1/tracking/{orderID}/location                             │
│         └─> Redis Pub/Sub → WebSocket → Customer sees realtime update        │
│                                                                               │
│  6. Rider completes delivery                                                 │
│     └─> PATCH /api/v1/riders/me/jobs/{id}/status (with proof)                │
│         ├─> Update order status                                              │
│         ├─> Process payment (Ledger Service)                                 │
│         ├─> Update rider earnings (Wallet Service)                           │
│         └─> Send notification (Customer + Merchant)                          │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘


┌───────────────────────────────────────────────────────────────────────────────┐
│                      FUTURE: SHOPPING INTEGRATION                             │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                    SHOPPING SERVICE (New)                           │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │     │
│  │  │   Catalog    │  │     Cart     │  │   Checkout   │             │     │
│  │  │   Service    │  │   Service    │  │   Service    │             │     │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │     │
│  │  ┌──────────────┐  ┌──────────────┐                               │     │
│  │  │    Order     │  │ Fulfillment  │──────┐                         │     │
│  │  │  Management  │  │   Service    │      │                         │     │
│  │  └──────────────┘  └──────────────┘      │                         │     │
│  └────────────────────────────────────────────┼─────────────────────────┘     │
│                                               │                               │
│                                               │ Call Express API              │
│                                               ▼                               │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │              EXPRESS SERVICE (Reused)                               │     │
│  │              Creates delivery from shopping order                   │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                               │
│  SHARED:                                                                      │
│  • Users (same account for Express + Shopping)                               │
│  • Payment & Wallet (same balance)                                           │
│  • Promotion (cross-platform coupons)                                        │
│  • Notification (unified messaging)                                          │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Key Architecture Principles

### 1. **Separation of Concerns**

- Platform Core: Shared services (Auth, Payment, Wallet)
- Express Service: Domain-specific logic (Orders, Matching, Tracking)
- Realtime Gateway: WebSocket handling (isolated for scaling)

### 2. **Event-Driven**

- Services communicate via events (Redis Pub/Sub)
- Temporal workflows for complex state machines
- Async processing for non-critical operations

### 3. **Scalability**

- Stateless services (horizontal scaling)
- Redis for distributed cache & session
- PostgreSQL with read replicas (future)
- WebSocket gateway can scale independently

### 4. **Reliability**

- Temporal for workflow resilience (auto-retry, state persistence)
- Database transactions for consistency
- Audit log for all critical operations
- Health checks & monitoring

### 5. **Security**

- JWT authentication
- RBAC for authorization
- API rate limiting
- Input validation
- Encrypted sensitive data

### 6. **Future-Proof**

- Shared core for Express + Shopping
- Clean architecture (easy to extend)
- Feature flags for gradual rollout
- Multi-tenant ready
