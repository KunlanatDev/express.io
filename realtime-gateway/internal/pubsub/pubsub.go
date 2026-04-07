package pubsub

import (
	"context"
	"log"

	"github.com/express-platform/realtime-gateway/internal/config"
	"github.com/express-platform/realtime-gateway/internal/websocket"
	"github.com/redis/go-redis/v9"
)

type PubSubService struct {
	client    *redis.Client
	wsHandler *websocket.Handler
}

func NewPubSubService(cfg *config.Config, wsHandler *websocket.Handler) *PubSubService {
	client := redis.NewClient(&redis.Options{
		Addr:     cfg.Redis.Host + ":" + cfg.Redis.Port,
		Password: cfg.Redis.Password,
		DB:       0,
	})

	return &PubSubService{
		client:    client,
		wsHandler: wsHandler,
	}
}

func (s *PubSubService) SubscribeToOrderEvents() {
	ctx := context.Background()
	pubsub := s.client.Subscribe(ctx, "orders:created", "orders:updated", "dispatch:rider_notif")

	// Wait for confirmation that we are subscribed
	_, err := pubsub.Receive(ctx)
	if err != nil {
		log.Fatalf("Failed to subscribe to Redis: %v", err)
	}

	log.Println("Subscribed to Redis channels: orders:created, orders:updated, dispatch:rider_notif")

	ch := pubsub.Channel()

	go func() {
		for msg := range ch {
			log.Printf("Received message from %s: %s", msg.Channel, msg.Payload)

			// Broadcast to all connected clients (Simple implementation for MVP)
			// In production, we would filter by rider location or user ID
			s.wsHandler.Broadcast(msg.Payload)
		}
	}()
}
