package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/express-platform/express-service/internal/entity"
	"github.com/redis/go-redis/v9"
)

type DispatchService interface {
	DispatchOrder(ctx context.Context, order *entity.DeliveryOrder) error
	FindNearestRiders(ctx context.Context, lat, lng float64, radiusKm float64, limit int) ([]string, error)
}

type dispatchService struct {
	redisClient *redis.Client
}

func NewDispatchService(redisClient *redis.Client) DispatchService {
	return &dispatchService{
		redisClient: redisClient,
	}
}

// DispatchOrder orchestrates the assignment of an order to the best available rider
func (s *dispatchService) DispatchOrder(ctx context.Context, order *entity.DeliveryOrder) error {
	// 1. Define search parameters
	searchRadiusKm := 5.0
	maxRidersToNotify := 3

	// 2. Perform Geo-spatial query via Redis to find closest active riders
	riderIDs, err := s.FindNearestRiders(ctx, order.PickupAddress.Lat, order.PickupAddress.Lng, searchRadiusKm, maxRidersToNotify)
	if err != nil {
		log.Printf("[DispatchService] Error finding riders for Order %s: %v", order.ID, err)
		return err
	}

	if len(riderIDs) == 0 {
		log.Printf("[DispatchService] No riders found in %.1f km radius for Order %s", searchRadiusKm, order.ID)
		// TODO: Implement fallback (e.g., expand radius, queue for retry, surge pricing trigger)
		return fmt.Errorf("no riders available nearby")
	}

	log.Printf("[DispatchService] Found %d potential riders for Order %s", len(riderIDs), order.ID)

	// 3. Notify the nearest rider (or broadcast to top N riders)
	// For this enterprise implementation, we'll notify the absolute closest one first.
	// We use Redis Pub/Sub to trigger the Realtime Gateway to push a WebSocket/FCM message.
	
	bestRiderID := riderIDs[0]
	
	event := map[string]interface{}{
		"type":     "NEW_JOB_OFFER",
		"order_id": order.ID,
		"rider_id": bestRiderID,
		"pickup":   order.PickupAddress,
		"dropoff":  order.DeliveryAddress,
		"price":    order.TotalPrice,
		"distance": order.EstimatedDuration, // Using ETA field as distance/duration meta
		"timeout":  30, // Rider has 30 seconds to accept
	}

	payload, _ := json.Marshal(event)
	
	// Publish to a specific channel listened to by the Realtime Gateway
	err = s.redisClient.Publish(ctx, "dispatch:rider_notif", payload).Err()
	if err != nil {
		log.Printf("[DispatchService] Failed to notify chosen rider %s: %v", bestRiderID, err)
		return err
	}

	log.Printf("[DispatchService] Successfully dispatched Order %s to Rider %s", order.ID, bestRiderID)
	
	// NOTE: If the rider doesn't acknowledge within timeout, a Temporal Workflow 
	// would typically handle state rollback and retrying the next rider in the list.
	return nil
}

// FindNearestRiders queries Redis for riders within the specified radius
func (s *dispatchService) FindNearestRiders(ctx context.Context, lat, lng float64, radiusKm float64, limit int) ([]string, error) {
	// Query the "riders:online" Geo set
	res, err := s.redisClient.GeoRadius(ctx, "riders:online", lng, lat, &redis.GeoRadiusQuery{
		Radius:      radiusKm,
		Unit:        "km",
		WithDist:    true,
		WithCoord:   false,
		WithGeoHash: false,
		Count:       limit,
		Sort:        "ASC", // Nearest first
	}).Result()

	if err != nil {
		return nil, err
	}

	var riderIDs []string
	for _, location := range res {
		riderIDs = append(riderIDs, location.Name)
	}

	return riderIDs, nil
}
