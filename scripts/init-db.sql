-- Express Platform Database Initialization

-- Create databases
-- Note: IF NOT EXISTS is not supported in PostgreSQL CREATE DATABASE directly in earlier versions or requires PL/pgSQL
-- Since we are running with -v (clean volume), we can just CREATE.

-- Create databases (will fail if exists, but we want that for clean slate)
CREATE DATABASE platform_core;
CREATE DATABASE express_service;
CREATE DATABASE shopping_service;

-- Connect to platform_core
\c platform_core;

-- Users table (shared across all domains)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL, -- customer, merchant, rider, admin
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, deleted
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Merchant Organizations
CREATE TABLE merchant_orgs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    business_type VARCHAR(50), -- individual, business
    tax_id VARCHAR(50),
    address TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, suspended
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Merchant Org Members (Role-based access)
CREATE TABLE merchant_org_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES merchant_orgs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- owner, admin, staff, finance
    permissions JSONB, -- custom permissions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(org_id, user_id)
);

-- Rider Profiles
CREATE TABLE rider_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    vehicle_type VARCHAR(50), -- motorcycle, car, truck
    vehicle_registration VARCHAR(50),
    license_number VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, active, inactive, suspended
    rating DECIMAL(3,2) DEFAULT 5.00,
    total_deliveries INT DEFAULT 0,
    acceptance_rate DECIMAL(5,2) DEFAULT 100.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallets (for riders, customers, merchants)
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'THB',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ledger (all money movements)
CREATE TABLE ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES wallets(id),
    transaction_type VARCHAR(50) NOT NULL, -- credit, debit
    amount DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    reference_type VARCHAR(50), -- order, refund, withdrawal, topup
    reference_id UUID,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Promotions/Coupons
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- percentage, fixed, free_delivery
    value DECIMAL(15,2) NOT NULL,
    min_order_value DECIMAL(15,2),
    max_discount DECIMAL(15,2),
    usage_limit INT,
    usage_count INT DEFAULT 0,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Create indexes for platform_core
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_ledger_wallet ON ledger(wallet_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);


-- Connect to express_service
\c express_service;

-- Delivery Orders
CREATE TABLE delivery_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL,
    merchant_id UUID,
    rider_id UUID,
    
    -- Service details
    service_type VARCHAR(50) NOT NULL, -- express_1_2h, same_day, cross_province
    
    -- Addresses & Contacts (JSONB for flexibility & performance)
    pickup_address JSONB,
    delivery_address JSONB,
    pickup_contact JSONB,
    delivery_contact JSONB,
    parcels JSONB,

    -- Workflow (Temporal)
    workflow_id VARCHAR(255),
    run_id VARCHAR(255),

    delivery_type VARCHAR(50), -- single, multi_stop
    scheduled_at TIMESTAMP,
    
    -- Pricing
    base_price DECIMAL(15,2),
    distance_price DECIMAL(15,2),
    time_price DECIMAL(15,2),
    surge_price DECIMAL(15,2),
    addon_price DECIMAL(15,2),
    total_price DECIMAL(15,2) NOT NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, matched, picked_up, in_transit, delivered, cancelled
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    matched_at TIMESTAMP,
    picked_up_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB
);

-- Delivery Stops (for multi-stop orders)
CREATE TABLE delivery_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES delivery_orders(id) ON DELETE CASCADE,
    stop_order INT NOT NULL,
    stop_type VARCHAR(20) NOT NULL, -- pickup, delivery
    
    -- Location
    address TEXT NOT NULL,
    lat DECIMAL(10,8),
    lng DECIMAL(11,8),
    
    -- Contact
    contact_name VARCHAR(100),
    contact_phone VARCHAR(20),
    
    -- Proof
    proof_type VARCHAR(50), -- otp, photo, signature
    proof_data JSONB,
    completed_at TIMESTAMP,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parcels
CREATE TABLE parcels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES delivery_orders(id) ON DELETE CASCADE,
    parcel_type VARCHAR(50) NOT NULL, -- document, box, food, fragile, cold, valuable
    quantity INT DEFAULT 1,
    weight DECIMAL(10,2),
    dimensions JSONB, -- {width, height, depth}
    declared_value DECIMAL(15,2),
    insurance BOOLEAN DEFAULT FALSE,
    barcode VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add-on Services
CREATE TABLE order_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES delivery_orders(id) ON DELETE CASCADE,
    addon_type VARCHAR(50) NOT NULL, -- wait_pickup, lift_help, packing, hand_to_hand
    price DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rider Jobs (Temporal workflow tracking)
CREATE TABLE rider_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES delivery_orders(id) ON DELETE CASCADE,
    rider_id UUID NOT NULL,
    workflow_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'offered', -- offered, accepted, rejected, in_progress, completed, failed
    offered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    timeout_at TIMESTAMP
);

-- Disputes
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES delivery_orders(id),
    raised_by UUID NOT NULL,
    dispute_type VARCHAR(50) NOT NULL, -- damaged, lost, wrong_address, late
    description TEXT,
    evidence JSONB, -- photos, documents
    status VARCHAR(50) DEFAULT 'open', -- open, investigating, resolved, rejected
    resolution TEXT,
    refund_amount DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Create indexes for express_service
CREATE INDEX idx_delivery_orders_customer ON delivery_orders(customer_id);
CREATE INDEX idx_delivery_orders_rider ON delivery_orders(rider_id);
CREATE INDEX idx_delivery_orders_status ON delivery_orders(status);
CREATE INDEX idx_delivery_orders_created ON delivery_orders(created_at);
CREATE INDEX idx_rider_jobs_workflow ON rider_jobs(workflow_id);
