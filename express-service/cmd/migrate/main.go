package main

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := "host=localhost user=postgres password=postgres dbname=express_service port=5434 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Add missing columns
	sqls := []string{
		"ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS pickup_photo_url TEXT",
		"ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS delivery_photo_url TEXT",
		"ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS matched_at TIMESTAMP",
		"ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMP",
		"ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP",
	}

	for _, sql := range sqls {
		if err := db.Exec(sql).Error; err != nil {
			log.Printf("Warning: %v", err)
		} else {
			fmt.Println("✅", sql)
		}
	}

	fmt.Println("\n✅ Migration completed!")
}
