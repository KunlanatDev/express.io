-- +goose Up
-- Add cancellation fields to delivery_orders table
ALTER TABLE delivery_orders 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancellation_fee DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;

-- +goose Down
-- Remove cancellation fields
ALTER TABLE delivery_orders 
DROP COLUMN IF EXISTS cancellation_reason,
DROP COLUMN IF EXISTS cancellation_fee,
DROP COLUMN IF EXISTS cancelled_at;
