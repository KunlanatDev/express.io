-- +goose Up
-- Add rating fields to delivery_orders table
ALTER TABLE delivery_orders 
ADD COLUMN IF NOT EXISTS rating INT,
ADD COLUMN IF NOT EXISTS review_comment TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;

-- +goose Down
-- Remove rating fields
ALTER TABLE delivery_orders 
DROP COLUMN IF EXISTS rating,
DROP COLUMN IF EXISTS review_comment,
DROP COLUMN IF EXISTS reviewed_at;
