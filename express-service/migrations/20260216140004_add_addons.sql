-- +goose Up
-- Add add_ons and add_ons_price to delivery_orders table
ALTER TABLE delivery_orders 
ADD COLUMN IF NOT EXISTS add_ons JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS add_ons_price DECIMAL(15,2) DEFAULT 0;

-- +goose Down
-- Remove add_ons and add_ons_price
ALTER TABLE delivery_orders 
DROP COLUMN IF EXISTS add_ons,
DROP COLUMN IF EXISTS add_ons_price;
