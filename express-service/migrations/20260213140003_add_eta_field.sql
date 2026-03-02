-- +goose Up
-- Add estimated_duration to delivery_orders table
ALTER TABLE delivery_orders 
ADD COLUMN IF NOT EXISTS estimated_duration INT;

-- +goose Down
-- Remove estimated_duration
ALTER TABLE delivery_orders 
DROP COLUMN IF EXISTS estimated_duration;
