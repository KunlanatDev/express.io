package repo

import (
	"context"
	"errors"
	"time"

	"github.com/express-platform/express-service/internal/entity"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrderRepository interface {
	Create(ctx context.Context, order *entity.DeliveryOrder) error
	GetOrder(ctx context.Context, id uuid.UUID) (*entity.DeliveryOrder, error)
	GetByCustomer(ctx context.Context, customerID string) ([]entity.DeliveryOrder, error)
	GetAll(ctx context.Context) ([]entity.DeliveryOrder, error)
	AssignRider(ctx context.Context, orderID, riderID uuid.UUID) (*entity.DeliveryOrder, error)
	UpdateStatus(ctx context.Context, orderID uuid.UUID, status string) error
	UpdateOrder(ctx context.Context, order *entity.DeliveryOrder) error
}

type orderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) OrderRepository {
	return &orderRepository{db: db}
}

func (r *orderRepository) Create(ctx context.Context, order *entity.DeliveryOrder) error {
	return r.db.WithContext(ctx).Create(order).Error
}

func (r *orderRepository) GetOrder(ctx context.Context, id uuid.UUID) (*entity.DeliveryOrder, error) {
	var order entity.DeliveryOrder
	if err := r.db.WithContext(ctx).First(&order, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &order, nil
}

func (r *orderRepository) GetByCustomer(ctx context.Context, customerID string) ([]entity.DeliveryOrder, error) {
	var orders []entity.DeliveryOrder
	if err := r.db.WithContext(ctx).Where("customer_id = ?", customerID).Order("created_at desc").Find(&orders).Error; err != nil {
		return nil, err
	}
	return orders, nil
}

func (r *orderRepository) GetAll(ctx context.Context) ([]entity.DeliveryOrder, error) {
	var orders []entity.DeliveryOrder
	// Get all orders ordered by created_at desc
	if err := r.db.WithContext(ctx).Order("created_at desc").Limit(100).Find(&orders).Error; err != nil {
		return nil, err
	}
	return orders, nil
}

func (r *orderRepository) AssignRider(ctx context.Context, orderID uuid.UUID, riderID uuid.UUID) (*entity.DeliveryOrder, error) {
	var order entity.DeliveryOrder
	// First check if order exists and is pending
	if err := r.db.WithContext(ctx).First(&order, "id = ?", orderID).Error; err != nil {
		return nil, err
	}

	if order.Status != "pending" {
		return nil, errors.New("order is not pending")
	}

	// Update updates the fields
	now := time.Now()
	updates := map[string]interface{}{
		"rider_id":   riderID,
		"status":     "matched",
		"matched_at": now,
		"updated_at": now,
	}

	if err := r.db.WithContext(ctx).Model(&order).Updates(updates).Error; err != nil {
		return nil, err
	}

	return &order, nil
}

func (r *orderRepository) UpdateStatus(ctx context.Context, orderID uuid.UUID, status string) error {
	updates := map[string]interface{}{
		"status":     status,
		"updated_at": time.Now(),
	}

	// Set specific timestamps based on status
	now := time.Now()
	switch status {
	case "arrived_pickup":
		updates["arrived_pickup_at"] = now
	case "picked_up":
		updates["picked_up_at"] = now
	case "arrived_dropoff":
		updates["arrived_dropoff_at"] = now
	case "delivered":
		updates["delivered_at"] = now
	}

	return r.db.WithContext(ctx).Model(&entity.DeliveryOrder{}).Where("id = ?", orderID).Updates(updates).Error
}

func (r *orderRepository) UpdateOrder(ctx context.Context, order *entity.DeliveryOrder) error {
	return r.db.WithContext(ctx).Save(order).Error
}
