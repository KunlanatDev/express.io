-- +goose Up
-- Add scheduled_at and other missing columns to delivery_orders table
ALTER TABLE delivery_orders 
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS pickup_address JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS delivery_address JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS pickup_contact JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS delivery_contact JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS parcels JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS workflow_id VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS run_id VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS service_type VARCHAR(50) DEFAULT 'express',
ADD COLUMN IF NOT EXISTS base_price DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS distance_price DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_price DECIMAL(15,2) DEFAULT 0;

-- +goose Down
-- Remove added columns
ALTER TABLE delivery_orders 
DROP COLUMN IF EXISTS scheduled_at,
DROP COLUMN IF EXISTS pickup_address,
DROP COLUMN IF EXISTS delivery_address,
DROP COLUMN IF EXISTS pickup_contact,
DROP COLUMN IF EXISTS delivery_contact,
DROP COLUMN IF EXISTS parcels,
DROP COLUMN IF EXISTS workflow_id,
DROP COLUMN IF EXISTS run_id,
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS service_type,
DROP COLUMN IF EXISTS base_price,
DROP COLUMN IF EXISTS distance_price,
DROP COLUMN IF EXISTS total_price;
