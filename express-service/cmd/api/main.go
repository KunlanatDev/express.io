package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/express-platform/express-service/internal/config"
	"github.com/express-platform/express-service/internal/controller"
	"github.com/express-platform/express-service/internal/entity"
	"github.com/express-platform/express-service/internal/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/redis/go-redis/v9"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Connect to Database
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Bangkok",
		cfg.Database.Host,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.Name,
		cfg.Database.Port,
		cfg.Database.SSLMode,
	)

	fmt.Printf("Connecting to DB: %s (password hidden)\n", "postgres://"+cfg.Database.User+":***@"+cfg.Database.Host+":"+cfg.Database.Port+"/"+cfg.Database.Name)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database: " + err.Error())
	}

	// Auto Migration - migrate each entity separately to avoid one failure blocking others
	db.Exec("SET session_replication_role = 'replica';")

	entities := []interface{}{
		&entity.DeliveryOrder{},
		&entity.Promo{},
	}
	for _, e := range entities {
		if err := db.AutoMigrate(e); err != nil {
			log.Printf("Warning: AutoMigrate failed for %T: %v", e, err)
		} else {
			log.Printf("✅ Migrated: %T", e)
		}
	}

	// Re-enable foreign key constraints
	db.Exec("SET session_replication_role = 'origin';")

	log.Println("Database connected successfully")

	// Connect to Redis
	redisClient := redis.NewClient(&redis.Options{
		Addr:     cfg.Redis.Host + ":" + cfg.Redis.Port,
		Password: cfg.Redis.Password,
		DB:       0, // use default DB
	})

	// Check Redis connection
	if err := redisClient.Ping(context.Background()).Err(); err != nil {
		log.Printf("Warning: Failed to connect to Redis: %v", err)
	} else {
		log.Println("Redis connected successfully")
	}

	// Create Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: middleware.ErrorHandler,
		AppName:      "Express Service",
	})

	// Global middleware
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*", // Adjust in production
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))
	app.Use(middleware.RequestLogger())

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		sqlDB, err := db.DB()
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"status": "error", "message": "db connection error"})
		}
		if err := sqlDB.Ping(); err != nil {
			return c.Status(500).JSON(fiber.Map{"status": "error", "message": "db ping failed"})
		}
		return c.JSON(fiber.Map{
			"status":  "ok",
			"service": "express-service",
			"db":      "connected",
			"redis":   "connected",
		})
	})

	// API routes
	api := app.Group("/api/v1")
	controller.SetupRoutes(api, cfg, db, redisClient)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}

	log.Println("Starting Express Service API on port " + port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatal("Failed to start server: " + err.Error())
	}
}
