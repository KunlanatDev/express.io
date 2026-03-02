package controller

import (
	"github.com/express-platform/express-service/internal/config"
	"github.com/express-platform/express-service/internal/repo"
	"github.com/express-platform/express-service/internal/service"
	"github.com/gofiber/fiber/v2"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

// SetupRoutes configures all routes for the application
func SetupRoutes(router fiber.Router, cfg *config.Config, db *gorm.DB, redisClient *redis.Client) {
	// Initialize Dependencies
	orderRepo := repo.NewOrderRepository(db)

	pricingService := service.NewPricingService()
	orderService := service.NewOrderService(orderRepo, pricingService, redisClient)

	orderController := NewOrderController(orderService)

	// Health Check
	router.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Welcome to Express Service API",
			"version": "v1.0.0",
		})
	})

	// Order Routes
	orders := router.Group("/orders")
	orders.Post("/", orderController.CreateOrder)
	orders.Get("/:id", orderController.GetOrder)
	orders.Post("/:id/accept", orderController.AcceptOrder)
	orders.Post("/:id/cancel", orderController.CancelOrder)
	orders.Post("/:id/arrived-pickup", orderController.ArrivedAtPickup)
	orders.Post("/:id/pickup", orderController.PickupOrder)
	orders.Post("/:id/arrived-dropoff", orderController.ArrivedAtDropoff)
	orders.Post("/:id/deliver", orderController.DeliverOrder)
	orders.Post("/:id/confirm-payment", orderController.ConfirmPayment)
	orders.Post("/:id/rate", orderController.RateOrder)

	// Upload Routes
	uploadController := NewUploadController()
	router.Post("/upload", uploadController.UploadImage)
	router.Static("/uploads", "./uploads")

	// Tracking routes (Placeholder)
	tracking := router.Group("/tracking")
	tracking.Get("/:id", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "Track order placeholder"})
	})
}
