package main

import (
	"log"
	"os"

	"github.com/express-platform/realtime-gateway/internal/config"
	"github.com/express-platform/realtime-gateway/internal/pubsub"
	"github.com/express-platform/realtime-gateway/internal/websocket"

	wsApp "github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Initialize Services
	wsHandler := websocket.NewHandler()

	pubSubService := pubsub.NewPubSubService(cfg, wsHandler)

	// Start listening to Redis events in background
	go pubSubService.SubscribeToOrderEvents()

	// Create Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return c.Status(500).SendString(err.Error())
		},
		AppName: "Realtime Gateway",
	})

	// Global middleware
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Upgrade",
	}))
	app.Use("/ws", websocket.UpgradeMiddleware)

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"service": "realtime-gateway",
		})
	})

	// WebSocket Route
	app.Get("/ws", wsApp.New(func(c *wsApp.Conn) {
		// Wait... the library uses its own Conn type, not the one from my handler package?
		// My handler package imports "github.com/gofiber/contrib/websocket" same as here.
		// Let's pass the connection to our handler logic.
		wsHandler.ManageConnection(c)
	}))

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8083"
	}

	log.Println("Starting Realtime Gateway on port " + port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatal("Failed to start server: " + err.Error())
	}
}
