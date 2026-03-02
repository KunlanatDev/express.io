package controller

import (
	"github.com/express-platform/platform-core/internal/config"
	"github.com/express-platform/platform-core/internal/repo"
	"github.com/express-platform/platform-core/internal/service"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// SetupRoutes configures all routes for the application
func SetupRoutes(router fiber.Router, cfg *config.Config, db *gorm.DB) {
	// Initialize Dependencies
	userRepo := repo.NewUserRepository(db)
	authService := service.NewAuthService(userRepo, cfg)
	authController := NewAuthController(authService)

	// Health Check (API level)
	router.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Welcome to Platform Core API",
			"version": "v1.0.0",
		})
	})

	// Auth Routes
	auth := router.Group("/auth")
	auth.Post("/register", authController.Register)
	auth.Post("/login", authController.Login)

	// Protected Routes (TODO: Add JWT Middleware)
	// auth.Get("/me", authController.GetMe)
}
