package controller

import "github.com/gofiber/fiber/v2"

// SetupRoutes configures all routes for the application
func SetupRoutes(router fiber.Router, cfg interface{}) {
	router.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Welcome to Realtime Gateway",
			"version": "v1.0.0",
		})
	})

	// WebSocket upgrade route usually handled separately, but standard endpoints here
	router.Get("/status", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"connections": 0})
	})
}
