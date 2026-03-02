package main

import (
	"fmt"
	"log"
	"os"

	"github.com/express-platform/platform-core/internal/config"
	"github.com/express-platform/platform-core/internal/controller"
	"github.com/express-platform/platform-core/internal/middleware"
	"github.com/express-platform/platform-core/pkg/logger"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Initialize logger
	logger.Init(cfg.Environment)
	defer logger.Sync()

	// Connect to Database
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=UTC",
		cfg.Database.Host,
		cfg.Database.User,
		cfg.Database.Password, // Make sure password is URL encoded if special chars
		cfg.Database.Name,
		cfg.Database.Port,
		cfg.Database.SSLMode,
	)

	fmt.Printf("Connecting to DB: %s (password hidden)\n", "postgres://"+cfg.Database.User+":***@"+cfg.Database.Host+":"+cfg.Database.Port+"/"+cfg.Database.Name)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		logger.Fatal("Failed to connect to database: " + err.Error())
	}

	// Auto Migration (create tables if not exist)
	// if err := db.AutoMigrate(&entity.User{}); err != nil {
	// 	logger.Fatal("Failed to migrate database: " + err.Error())
	// }

	logger.Info("Database connected successfully")

	// Create Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: middleware.ErrorHandler,
		AppName:      "Platform Core API",
	})

	// Global middleware
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: cfg.CORS.AllowedOrigins,
		AllowMethods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
		AllowHeaders: "Origin,Content-Type,Accept,Authorization",
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
			"service": "platform-core",
			"db":      "connected",
		})
	})

	// API routes
	api := app.Group("/api/v1")
	controller.SetupRoutes(api, cfg, db)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	logger.Info("Starting Platform Core API on port " + port)
	if err := app.Listen(":" + port); err != nil {
		logger.Fatal("Failed to start server: " + err.Error())
	}
}
