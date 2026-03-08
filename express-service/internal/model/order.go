package model

import (
	"time"

	"github.com/google/uuid"
)

type CreateOrderRequest struct {
	ServiceType     string        `json:"service_type" validate:"required,oneof=express same_day next_day"`
	PickupAddress   AddressInput  `json:"pickup_address" validate:"required"`
	DeliveryAddress AddressInput  `json:"delivery_address" validate:"required"`
	PickupContact   ContactInput  `json:"pickup_contact" validate:"required"`
	DeliveryContact ContactInput  `json:"delivery_contact" validate:"required"`
	Parcels         []ParcelInput `json:"parcels" validate:"required,min=1"`
	ScheduledAt     *time.Time    `json:"scheduled_at,omitempty"`
	Addons          []string      `json:"addons,omitempty"`
}

type UpdateOrderRequest struct {
	Status string `json:"status" validate:"required,oneof=cancelled"`
	Reason string `json:"reason,omitempty"`
}

type OrderResponse struct {
	ID              uuid.UUID     `json:"id"`
	OrderNumber     string        `json:"order_number"`
	CustomerID      uuid.UUID     `json:"customer_id"`
	RiderID         *uuid.UUID    `json:"rider_id,omitempty"`
	Status          string        `json:"status"`
	ServiceType     string        `json:"service_type"`
	PickupAddress   AddressOutput `json:"pickup_address"`
	DeliveryAddress AddressOutput `json:"delivery_address"`
	TotalPrice      float64       `json:"total_price"` // Final price
	ETA             int           `json:"eta_minutes"` // Estimated time arrival
	CreatedAt       time.Time     `json:"created_at"`
	UpdatedAt       time.Time     `json:"updated_at"`
}

type AddressInput struct {
	Address string  `json:"address" validate:"required"`
	PlaceID string  `json:"place_id"`
	Lat     float64 `json:"lat" validate:"required"`
	Lng     float64 `json:"lng" validate:"required"`
	Room    string  `json:"room,omitempty"`
	Floor   string  `json:"floor,omitempty"`
	Note    string  `json:"note,omitempty"`
}

type ContactInput struct {
	Name  string `json:"name" validate:"required"`
	Phone string `json:"phone" validate:"required"`
	Note  string `json:"note,omitempty"`
}

type ParcelInput struct {
	Description string  `json:"description" validate:"required"`
	Weight      float64 `json:"weight" validate:"required,gt=0"`
	Width       float64 `json:"width" validate:"required,gt=0"`
	Length      float64 `json:"length" validate:"required,gt=0"`
	Height      float64 `json:"height" validate:"required,gt=0"`
	Quantity    int     `json:"quantity" validate:"required,gt=0"`
}

type AddressOutput struct {
	Address string  `json:"address"`
	Lat     float64 `json:"lat"`
	Lng     float64 `json:"lng"`
	Room    string  `json:"room,omitempty"`
	Floor   string  `json:"floor,omitempty"`
	Note    string  `json:"note,omitempty"`
}

type CalculatePriceRequest struct {
	PickupAddress   AddressInput   `json:"pickup_address" validate:"required"`
	DeliveryAddress AddressInput   `json:"delivery_address" validate:"required"`
	Stops           []AddressInput `json:"stops,omitempty"`
	Parcels         []ParcelInput  `json:"parcels,omitempty"`
	Addons          []string       `json:"addons,omitempty"`
	PromoCode       string         `json:"promo_code,omitempty"`
	Distance        *float64       `json:"distance,omitempty"`
	DurationMins    *float64       `json:"duration_mins,omitempty"`
}

type CalculatePriceResponse struct {
	Distance      float64        `json:"distance"`       // Total distance in km
	DistancePrice float64        `json:"distance_price"` // Price based on distance
	BasePrice     float64        `json:"base_price"`
	WeightPrice   float64        `json:"weight_price"`
	PromoDiscount float64        `json:"promo_discount"`
	TotalPrice    float64        `json:"total_price"` // Final calculated price for default service
	ETA           string         `json:"eta"`         // E.g., "14:20 - 14:50"
	Services      []ServicePrice `json:"services"`
}

type ServicePrice struct {
	ServiceType string  `json:"service_type"`
	TotalPrice  float64 `json:"total_price"`
	ETA         string  `json:"eta"`
}
