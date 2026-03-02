package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/express-platform/express-service/internal/entity"
	"github.com/express-platform/express-service/internal/model"
	"github.com/express-platform/express-service/internal/repo"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type OrderService interface {
	CreateOrder(ctx context.Context, req *model.CreateOrderRequest, customerID string) (*entity.DeliveryOrder, error)
	GetOrder(ctx context.Context, id string) (*entity.DeliveryOrder, error)
	AcceptOrder(ctx context.Context, orderID, riderID string) (*entity.DeliveryOrder, error)
	CancelOrder(ctx context.Context, orderID, reason string) (*entity.DeliveryOrder, error)
	ArrivedAtPickup(ctx context.Context, orderID string) (*entity.DeliveryOrder, error)
	PickupOrder(ctx context.Context, orderID string, photoURL string) (*entity.DeliveryOrder, error)
	ArrivedAtDropoff(ctx context.Context, orderID string) (*entity.DeliveryOrder, error)
	DeliverOrder(ctx context.Context, orderID string, photoURL string) (*entity.DeliveryOrder, error)
	ConfirmPayment(ctx context.Context, orderID string) (*entity.DeliveryOrder, error)
	RateOrder(ctx context.Context, orderID string, rating int, comment string) (*entity.DeliveryOrder, error)
}

type orderService struct {
	orderRepo      repo.OrderRepository
	pricingService PricingService
	redis          *redis.Client
}

func NewOrderService(orderRepo repo.OrderRepository, pricingService PricingService, redisClient *redis.Client) OrderService {
	return &orderService{
		orderRepo:      orderRepo,
		pricingService: pricingService,
		redis:          redisClient,
	}
}

func (s *orderService) CreateOrder(ctx context.Context, req *model.CreateOrderRequest, customerID string) (*entity.DeliveryOrder, error) {
	// 1. Calculate Price & ETA
	totalPrice, addOnsPrice, eta, err := s.pricingService.CalculatePrice(req)
	if err != nil {
		return nil, err
	}

	// 2. Generate Order Logic (Order Number, etc.)
	orderNumber := fmt.Sprintf("ORD-%s-%s", time.Now().Format("060102"), uuid.NewString()[:6])

	custUUID, _ := uuid.Parse(customerID) // Assume valid UUID from middleware

	// 3. Map Request to Entity
	order := &entity.DeliveryOrder{
		ID:                uuid.New(),
		OrderNumber:       orderNumber,
		CustomerID:        custUUID,
		Status:            "pending",
		ServiceType:       req.ServiceType,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
		TotalPrice:        totalPrice,
		EstimatedDuration: eta,
		AddOns:            entity.AddOnList(req.Addons),
		AddOnsPrice:       addOnsPrice,
		ScheduledAt:       req.ScheduledAt,

		// Addresses (Convert to entity struct)
		PickupAddress: entity.AddressInfo{
			Address: req.PickupAddress.Address,
			Lat:     req.PickupAddress.Lat,
			Lng:     req.PickupAddress.Lng,
			Note:    req.PickupAddress.Note,
		},
		DeliveryAddress: entity.AddressInfo{
			Address: req.DeliveryAddress.Address,
			Lat:     req.DeliveryAddress.Lat,
			Lng:     req.DeliveryAddress.Lng,
			Note:    req.DeliveryAddress.Note,
		},
		PickupContact: entity.ContactInfo{
			Name:  req.PickupContact.Name,
			Phone: req.PickupContact.Phone,
			Note:  req.PickupContact.Note,
		},
		DeliveryContact: entity.ContactInfo{
			Name:  req.DeliveryContact.Name,
			Phone: req.DeliveryContact.Phone,
			Note:  req.DeliveryContact.Note,
		},
	}

	// Convert parcels
	for _, p := range req.Parcels {
		order.Parcels = append(order.Parcels, entity.ParcelItem{
			Description: p.Description,
			Weight:      p.Weight,
			Width:       p.Width,
			Length:      p.Length,
			Height:      p.Height,
			Quantity:    p.Quantity,
		})
	}

	// 4. Save to Repo
	if err := s.orderRepo.Create(ctx, order); err != nil {
		return nil, err
	}

	// 5. Notify Realtime Gateway (Fire & Forget)
	go func() {
		event := map[string]interface{}{
			"type": "ORDER_CREATED",
			"data": order,
		}
		if jsonBytes, err := json.Marshal(event); err == nil {
			if err := s.redis.Publish(context.Background(), "orders:created", jsonBytes).Err(); err != nil {
				log.Printf("Failed to publish order event: %v", err)
			} else {
				log.Printf("Published ORDER_CREATED event for %s", order.ID)
			}
		}
	}()

	// 6. Start Workflow (TODO: Temporal)

	return order, nil
}

func (s *orderService) GetOrder(ctx context.Context, id string) (*entity.DeliveryOrder, error) {
	// Parse UUID
	orderID, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid order id")
	}
	return s.orderRepo.GetOrder(ctx, orderID)
}

func (s *orderService) AcceptOrder(ctx context.Context, orderID, riderID string) (*entity.DeliveryOrder, error) {
	// 1. Check existing order
	// We can skip explicit GetOrder check if AssignRider handles validation,
	// but AssignRider logic I wrote in Repo expects order to exist.

	// Parse UUIDs
	oID, err := uuid.Parse(orderID)
	if err != nil {
		return nil, errors.New("invalid order id")
	}
	rID, err := uuid.Parse(riderID)
	if err != nil {
		return nil, errors.New("invalid rider id")
	}

	// Call Repo
	order, err := s.orderRepo.AssignRider(ctx, oID, rID)
	if err != nil {
		return nil, err
	}

	// Publish Event
	event := map[string]interface{}{
		"type":     "ORDER_ACCEPTED",
		"order_id": order.ID,
		"rider_id": order.RiderID,
		"status":   order.Status,
	}
	val, _ := json.Marshal(event)
	// Publishing to 'orders:updated' channel so Frontend can listen
	s.redis.Publish(ctx, "orders:updated", val)

	return order, nil
}

func (s *orderService) CancelOrder(ctx context.Context, orderID, reason string) (*entity.DeliveryOrder, error) {
	oID, err := uuid.Parse(orderID)
	if err != nil {
		return nil, errors.New("invalid order id")
	}

	order, err := s.orderRepo.GetOrder(ctx, oID)
	if err != nil {
		return nil, err
	}

	// Check if cancellation is allowed
	if order.Status == "delivered" || order.Status == "completed" || order.Status == "cancelled" {
		return nil, errors.New("cannot cancel order in current status")
	}

	// Calculate cancellation fee
	var cancellationFee float64
	switch order.Status {
	case "pending":
		cancellationFee = 0 // Free cancellation before rider accepts
	case "matched":
		cancellationFee = order.TotalPrice * 0.2 // 20% fee after rider accepts
	case "arrived_pickup", "picked_up", "arrived_dropoff":
		cancellationFee = order.TotalPrice * 0.5 // 50% fee after rider started
	default:
		cancellationFee = 0
	}

	// Update order status
	order.Status = "cancelled"
	order.CancellationReason = &reason
	order.CancellationFee = &cancellationFee
	now := time.Now()
	order.CancelledAt = &now

	err = s.orderRepo.UpdateOrder(ctx, order)
	if err != nil {
		return nil, err
	}

	s.publishEvent(ctx, "ORDER_CANCELLED", order)
	return order, nil
}

func (s *orderService) ArrivedAtPickup(ctx context.Context, orderID string) (*entity.DeliveryOrder, error) {
	oID, err := uuid.Parse(orderID)
	if err != nil {
		return nil, errors.New("invalid order id")
	}

	if err := s.orderRepo.UpdateStatus(ctx, oID, "arrived_pickup"); err != nil {
		return nil, err
	}
	// Fetch updated
	order, err := s.orderRepo.GetOrder(ctx, oID)
	if err != nil {
		return nil, err
	}

	s.publishEvent(ctx, "ORDER_ARRIVED_PICKUP", order)
	return order, nil
}

func (s *orderService) PickupOrder(ctx context.Context, orderID string, photoURL string) (*entity.DeliveryOrder, error) {
	oID, err := uuid.Parse(orderID)
	if err != nil {
		return nil, errors.New("invalid order id")
	}

	order, err := s.orderRepo.GetOrder(ctx, oID)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("order not found")
	}

	order.Status = "picked_up"
	order.PickupPhotoURL = photoURL
	now := time.Now()
	order.PickedUpAt = &now

	if err := s.orderRepo.UpdateOrder(ctx, order); err != nil {
		return nil, err
	}

	// Redis Event
	s.publishEvent(ctx, "ORDER_PICKED_UP", order)
	return order, nil
}

func (s *orderService) ArrivedAtDropoff(ctx context.Context, orderID string) (*entity.DeliveryOrder, error) {
	oID, err := uuid.Parse(orderID)
	if err != nil {
		return nil, errors.New("invalid order id")
	}

	order, err := s.orderRepo.GetOrder(ctx, oID)
	if err != nil {
		return nil, err
	}

	// Update the status on the retrieved order object
	order.Status = "arrived_dropoff"
	// Then update the order in the repository.
	// Using UpdateOrder is generally safer if you've modified other fields on the order object.
	// If only status is changed, UpdateStatus is fine, but ensure the local 'order' reflects the change for event publishing.
	if err := s.orderRepo.UpdateOrder(ctx, order); err != nil { // Changed from UpdateStatus to UpdateOrder
		return nil, err
	}

	s.publishEvent(ctx, "ORDER_ARRIVED_DROPOFF", order)
	return order, nil
}

func (s *orderService) DeliverOrder(ctx context.Context, orderID string, photoURL string) (*entity.DeliveryOrder, error) {
	oID, err := uuid.Parse(orderID)
	if err != nil {
		return nil, errors.New("invalid order id")
	}

	order, err := s.orderRepo.GetOrder(ctx, oID)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("order not found")
	}

	order.Status = "delivered"
	order.DeliveryPhotoURL = photoURL
	now := time.Now()
	order.DeliveredAt = &now

	if err := s.orderRepo.UpdateOrder(ctx, order); err != nil {
		return nil, err
	}

	s.publishEvent(ctx, "ORDER_DELIVERED", order)
	return order, nil
}

func (s *orderService) ConfirmPayment(ctx context.Context, orderID string) (*entity.DeliveryOrder, error) {
	oID, err := uuid.Parse(orderID)
	if err != nil {
		return nil, errors.New("invalid order id")
	}

	if err := s.orderRepo.UpdateStatus(ctx, oID, "completed"); err != nil {
		return nil, err
	}
	order, err := s.orderRepo.GetOrder(ctx, oID)
	if err != nil {
		return nil, err
	}

	s.publishEvent(ctx, "ORDER_COMPLETED", order)
	return order, nil
}

func (s *orderService) RateOrder(ctx context.Context, orderID string, rating int, comment string) (*entity.DeliveryOrder, error) {
	oID, err := uuid.Parse(orderID)
	if err != nil {
		return nil, errors.New("invalid order id")
	}

	if rating < 1 || rating > 5 {
		return nil, errors.New("rating must be between 1 and 5")
	}

	order, err := s.orderRepo.GetOrder(ctx, oID)
	if err != nil {
		return nil, err
	}

	if order.Status != "completed" {
		return nil, errors.New("can only rate completed orders")
	}

	order.Rating = &rating
	order.ReviewComment = &comment
	now := time.Now()
	order.ReviewedAt = &now

	err = s.orderRepo.UpdateOrder(ctx, order)
	if err != nil {
		return nil, err
	}

	return order, nil
}

func (s *orderService) publishEvent(ctx context.Context, eventType string, order *entity.DeliveryOrder) {
	event := map[string]interface{}{
		"type":     eventType,
		"order_id": order.ID,
		"status":   order.Status,
	}
	val, _ := json.Marshal(event)
	s.redis.Publish(ctx, "orders:updated", val)
}
