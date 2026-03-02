# Express Platform - API Documentation

## Base URLs

- **Platform Core**: `http://localhost:8080/api/v1`
- **Express Service**: `http://localhost:8082/api/v1`
- **Realtime Gateway**: `ws://localhost:8083/ws`

---

## Authentication

### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "phone": "+66812345678",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "customer" // customer, merchant, rider, admin
}
```

**Response 201**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "phone": "+66812345678",
  "first_name": "John",
  "last_name": "Doe",
  "role": "customer",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

### Get Current User

```http
GET /auth/me
Authorization: Bearer {access_token}
```

**Response 200**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "phone": "+66812345678",
  "first_name": "John",
  "last_name": "Doe",
  "role": "customer",
  "email_verified": true,
  "phone_verified": true
}
```

---

## Orders (Express Service)

### Create Order

```http
POST /orders
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "service_type": "express_1_2h", // express_1_2h, same_day, cross_province
  "pickup_address": {
    "address": "123 Sukhumvit Rd, Bangkok",
    "lat": 13.7563,
    "lng": 100.5018,
    "notes": "Gate 2, Building A"
  },
  "delivery_address": {
    "address": "456 Silom Rd, Bangkok",
    "lat": 13.7248,
    "lng": 100.5310,
    "notes": "Reception desk"
  },
  "pickup_contact": {
    "name": "Sender Name",
    "phone": "+66812345678"
  },
  "delivery_contact": {
    "name": "Receiver Name",
    "phone": "+66887654321"
  },
  "parcels": [
    {
      "type": "box", // document, box, food, fragile, cold, valuable
      "quantity": 1,
      "weight": 2.5,
      "dimensions": {
        "width": 30,
        "height": 20,
        "depth": 15
      },
      "declared_value": 1000,
      "insurance": false
    }
  ],
  "addons": ["wait_pickup"], // wait_pickup, lift_help, packing, hand_to_hand
  "scheduled_at": "2024-01-01T14:00:00Z", // optional
  "payment_method": "credit_card" // credit_card, wallet, cod
}
```

**Response 201**

```json
{
  "id": "uuid",
  "order_number": "EXP20240101001",
  "status": "pending",
  "pricing": {
    "base_price": 50.0,
    "distance_price": 30.0,
    "time_price": 0.0,
    "surge_price": 0.0,
    "addon_price": 20.0,
    "total_price": 100.0
  },
  "eta_minutes": 90,
  "created_at": "2024-01-01T12:00:00Z"
}
```

### Get Order

```http
GET /orders/{order_id}
Authorization: Bearer {access_token}
```

**Response 200**

```json
{
  "id": "uuid",
  "order_number": "EXP20240101001",
  "customer_id": "uuid",
  "rider_id": "uuid",
  "service_type": "express_1_2h",
  "status": "in_transit",
  "pickup_address": { ... },
  "delivery_address": { ... },
  "parcels": [ ... ],
  "pricing": { ... },
  "timeline": [
    {
      "status": "created",
      "timestamp": "2024-01-01T12:00:00Z"
    },
    {
      "status": "matched",
      "timestamp": "2024-01-01T12:05:00Z",
      "rider_id": "uuid"
    },
    {
      "status": "picked_up",
      "timestamp": "2024-01-01T12:30:00Z",
      "proof": {
        "type": "photo",
        "url": "https://..."
      }
    }
  ],
  "created_at": "2024-01-01T12:00:00Z"
}
```

### List Orders

```http
GET /orders?status=in_transit&page=1&limit=20
Authorization: Bearer {access_token}
```

**Query Parameters:**

- `status` - Filter by status (pending, matched, picked_up, in_transit, delivered, cancelled)
- `service_type` - Filter by service type
- `from_date` - Start date (ISO 8601)
- `to_date` - End date (ISO 8601)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response 200**

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

### Cancel Order

```http
PATCH /orders/{order_id}/cancel
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "reason": "Changed my mind"
}
```

**Response 200**

```json
{
  "id": "uuid",
  "status": "cancelled",
  "cancellation_fee": 25.0,
  "refund_amount": 75.0,
  "cancelled_at": "2024-01-01T12:15:00Z"
}
```

---

## Tracking

### Get Order Tracking (Public)

```http
GET /tracking/{order_id}
```

**Response 200**

```json
{
  "order_id": "uuid",
  "order_number": "EXP20240101001",
  "status": "in_transit",
  "rider": {
    "name": "Rider Name",
    "phone": "masked", // +66*****5678
    "vehicle_type": "motorcycle",
    "rating": 4.8
  },
  "current_location": {
    "lat": 13.7400,
    "lng": 100.5200,
    "updated_at": "2024-01-01T12:45:00Z"
  },
  "eta_minutes": 25,
  "timeline": [ ... ]
}
```

### Update Location (Rider)

```http
POST /tracking/{order_id}/location
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "lat": 13.7400,
  "lng": 100.5200,
  "accuracy": 10.5,
  "speed": 45.0,
  "heading": 180.0
}
```

**Response 200**

```json
{
  "success": true
}
```

---

## Wallet

### Get Wallet

```http
GET /wallets/me
Authorization: Bearer {access_token}
```

**Response 200**

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "balance": 1500.0,
  "currency": "THB"
}
```

### Top Up

```http
POST /wallets/topup
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "amount": 500.00,
  "payment_method": "credit_card",
  "payment_token": "tok_..."
}
```

**Response 200**

```json
{
  "transaction_id": "uuid",
  "amount": 500.0,
  "balance_after": 2000.0,
  "status": "completed"
}
```

### Get Transactions

```http
GET /wallets/transactions?page=1&limit=20
Authorization: Bearer {access_token}
```

**Response 200**

```json
{
  "data": [
    {
      "id": "uuid",
      "type": "credit",
      "amount": 500.00,
      "balance_after": 2000.00,
      "reference_type": "topup",
      "description": "Wallet top-up",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

## Rider (Rider App)

### Update Online Status

```http
PATCH /riders/me/status
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "status": "online" // online, offline
}
```

### Get Job Offers

```http
GET /riders/me/job-offers
Authorization: Bearer {access_token}
```

**Response 200**

```json
{
  "data": [
    {
      "job_id": "uuid",
      "order_id": "uuid",
      "order_number": "EXP20240101001",
      "pickup_address": { ... },
      "delivery_address": { ... },
      "distance_km": 5.2,
      "estimated_duration_minutes": 25,
      "earnings": 80.00,
      "expires_at": "2024-01-01T12:05:00Z"
    }
  ]
}
```

### Accept Job

```http
POST /riders/me/jobs/{job_id}/accept
Authorization: Bearer {access_token}
```

**Response 200**

```json
{
  "job_id": "uuid",
  "order_id": "uuid",
  "status": "accepted",
  "accepted_at": "2024-01-01T12:03:00Z"
}
```

### Update Job Status

```http
PATCH /riders/me/jobs/{job_id}/status
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "status": "picked_up", // arrived_pickup, picked_up, arrived_delivery, delivered
  "proof": {
    "type": "photo", // otp, photo, signature
    "data": "base64_encoded_image" // or OTP code
  }
}
```

---

## WebSocket (Realtime)

### Connect

```javascript
const ws = new WebSocket("ws://localhost:8083/ws?token={access_token}");

ws.onopen = () => {
  console.log("Connected");

  // Subscribe to order updates
  ws.send(
    JSON.stringify({
      type: "subscribe",
      channel: "order:uuid",
    }),
  );
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Event:", data);
};
```

### Events

**Location Update**

```json
{
  "type": "location_update",
  "order_id": "uuid",
  "rider_id": "uuid",
  "location": {
    "lat": 13.74,
    "lng": 100.52
  },
  "timestamp": "2024-01-01T12:45:00Z"
}
```

**Status Change**

```json
{
  "type": "status_change",
  "order_id": "uuid",
  "old_status": "matched",
  "new_status": "picked_up",
  "timestamp": "2024-01-01T12:30:00Z"
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "validation_error",
  "message": "Invalid input data",
  "details": {
    "email": "Invalid email format"
  }
}
```

### 401 Unauthorized

```json
{
  "error": "unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden

```json
{
  "error": "forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found

```json
{
  "error": "not_found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "internal_error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

- **Rate Limit**: 100 requests per minute per user
- **Headers**:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 95
  - `X-RateLimit-Reset`: 1704110400

### 429 Too Many Requests

```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please try again later.",
  "retry_after": 60
}
```

---

## Webhooks (For Merchants)

### Order Status Update

```http
POST {merchant_webhook_url}
Content-Type: application/json
X-Signature: {hmac_signature}

{
  "event": "order.status_changed",
  "order_id": "uuid",
  "order_number": "EXP20240101001",
  "old_status": "in_transit",
  "new_status": "delivered",
  "timestamp": "2024-01-01T13:30:00Z"
}
```

---

**API Version**: v1  
**Last Updated**: 2024-01-01
