-- +goose Up
-- Add proof of delivery columns to delivery_orders table
ALTER TABLE delivery_orders 
ADD COLUMN IF NOT EXISTS pickup_photo_url TEXT,
ADD COLUMN IF NOT EXISTS delivery_photo_url TEXT,
ADD COLUMN IF NOT EXISTS matched_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS arrived_pickup_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS arrived_dropoff_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;

-- +goose Down
-- Remove proof of delivery columns
ALTER TABLE delivery_orders 
DROP COLUMN IF EXISTS pickup_photo_url,
DROP COLUMN IF EXISTS delivery_photo_url,
DROP COLUMN IF EXISTS matched_at,
DROP COLUMN IF EXISTS arrived_pickup_at,
DROP COLUMN IF EXISTS picked_up_at,
DROP COLUMN IF EXISTS arrived_dropoff_at,
DROP COLUMN IF EXISTS delivered_at;
