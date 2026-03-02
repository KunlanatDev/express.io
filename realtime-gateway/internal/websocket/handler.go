package websocket

import (
	"log"
	"sync"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	// A map of active clients.
	// In production, split by role (rider, customer) and location (geohash)
	clients map[*websocket.Conn]bool
	mu      sync.Mutex
}

func NewHandler() *Handler {
	return &Handler{
		clients: make(map[*websocket.Conn]bool),
	}
}

// ManageConnection handles the WebSocket lifecycle
func (h *Handler) ManageConnection(c *websocket.Conn) {
	h.mu.Lock()
	h.clients[c] = true
	h.mu.Unlock()

	log.Println("New WebSocket client connected:", c.RemoteAddr())

	defer func() {
		h.mu.Lock()
		delete(h.clients, c)
		h.mu.Unlock()
		c.Close()
		log.Println("WebSocket client disconnected:", c.RemoteAddr())
	}()

	for {
		// Read messages from client (e.g. location updates)
		// For now, we just echo or ignore, as most flow is server -> client
		mt, msg, err := c.ReadMessage()
		if err != nil {
			log.Println("ws read error:", err)
			break
		}
		log.Printf("recv: %s", msg)

		// Broadcast received message to all other clients if it's text
		// This enables Rider App -> Gateway -> Customer Web communication (Location Updates)
		if mt == websocket.TextMessage {
			// In production check type before broadcasting blindly
			h.Broadcast(string(msg))
		}
	}
}

// Broadcast sends a message to all connected clients
func (h *Handler) Broadcast(message string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	for client := range h.clients {
		if err := client.WriteMessage(websocket.TextMessage, []byte(message)); err != nil {
			log.Printf("ws write error: %v", err)
			client.Close()
			delete(h.clients, client)
		}
	}
}

// Upgrade middleware required by Fiber
func UpgradeMiddleware(c *fiber.Ctx) error {
	if websocket.IsWebSocketUpgrade(c) {
		c.Locals("allowed", true)
		return c.Next()
	}
	return c.Status(fiber.StatusUpgradeRequired).SendString("WebSocket upgrade required")
}
