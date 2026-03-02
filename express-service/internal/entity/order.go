package entity

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
)

type DeliveryOrder struct {
	ID          uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	OrderNumber string     `gorm:"uniqueIndex;not null" json:"order_number"`
	CustomerID  uuid.UUID  `gorm:"type:uuid;index" json:"customer_id"`
	RiderID     *uuid.UUID `gorm:"type:uuid;index" json:"rider_id"`

	// JSON fields
	PickupAddress   AddressInfo `gorm:"type:jsonb" json:"pickup_address"`
	DeliveryAddress AddressInfo `gorm:"type:jsonb" json:"delivery_address"`
	PickupContact   ContactInfo `gorm:"type:jsonb" json:"pickup_contact"`
	DeliveryContact ContactInfo `gorm:"type:jsonb" json:"delivery_contact"`
	Parcels         ParcelList  `gorm:"type:jsonb" json:"parcels"`

	Status      string `gorm:"index;default:'pending'" json:"status"`
	ServiceType string `gorm:"type:varchar(50)" json:"service_type"`
	WorkflowID  string `gorm:"type:varchar(255)" json:"workflow_id"`
	RunID       string `gorm:"type:varchar(255)" json:"run_id"`

	// Pricing
	BasePrice         float64 `gorm:"type:decimal(15,2)" json:"base_price"`
	DistancePrice     float64 `gorm:"type:decimal(15,2)" json:"distance_price"`
	TotalPrice        float64 `gorm:"type:decimal(15,2)" json:"total_price"` // Final price to pay
	EstimatedDuration int     `gorm:"type:int" json:"estimated_duration"`    // ETA in minutes

	// Add-ons & Scheduling
	AddOns      AddOnList  `gorm:"type:jsonb" json:"add_ons,omitempty"`
	AddOnsPrice float64    `gorm:"type:decimal(15,2)" json:"add_ons_price,omitempty"`
	ScheduledAt *time.Time `json:"scheduled_at,omitempty"`

	// Proof of Delivery
	PickupPhotoURL   string `gorm:"type:text" json:"pickup_photo_url"`
	DeliveryPhotoURL string `gorm:"type:text" json:"delivery_photo_url"`

	// Timestamps
	MatchedAt   *time.Time `json:"matched_at"`
	PickedUpAt  *time.Time `json:"picked_up_at"`
	DeliveredAt *time.Time `json:"delivered_at"`

	// Cancellation
	CancellationReason *string    `gorm:"type:text" json:"cancellation_reason,omitempty"`
	CancellationFee    *float64   `gorm:"type:decimal(15,2)" json:"cancellation_fee,omitempty"`
	CancelledAt        *time.Time `json:"cancelled_at,omitempty"`

	// Rating & Review
	Rating        *int       `gorm:"type:int" json:"rating,omitempty"` // 1-5 stars
	ReviewComment *string    `gorm:"type:text" json:"review_comment,omitempty"`
	ReviewedAt    *time.Time `json:"reviewed_at,omitempty"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// Structs for JSONB columns

type AddressInfo struct {
	Address string  `json:"address"`
	PlaceID string  `json:"place_id"`
	Lat     float64 `json:"lat"`
	Lng     float64 `json:"lng"`
	Room    string  `json:"room,omitempty"`
	Floor   string  `json:"floor,omitempty"`
	Note    string  `json:"note,omitempty"`
}

// Implement sql.Scanner and driver.Valuer for AddressInfo
func (a *AddressInfo) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(bytes, &a)
}

func (a AddressInfo) Value() (driver.Value, error) {
	return json.Marshal(a)
}

type ContactInfo struct {
	Name  string `json:"name"`
	Phone string `json:"phone"`
	Note  string `json:"note,omitempty"` // Special instruction e.g. "Leave at door"
}

func (c *ContactInfo) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(bytes, &c)
}

func (c ContactInfo) Value() (driver.Value, error) {
	return json.Marshal(c)
}

type ParcelList []ParcelItem

type ParcelItem struct {
	Description string  `json:"description"`
	Weight      float64 `json:"weight"` // kg
	Width       float64 `json:"width"`  // cm
	Length      float64 `json:"length"` // cm
	Height      float64 `json:"height"` // cm
	Quantity    int     `json:"quantity"`
}

func (p *ParcelList) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(bytes, &p)
}

func (p ParcelList) Value() (driver.Value, error) {
	return json.Marshal(p)
}

type AddOnList []string

func (a *AddOnList) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(bytes, &a)
}

func (a AddOnList) Value() (driver.Value, error) {
	return json.Marshal(a)
}
