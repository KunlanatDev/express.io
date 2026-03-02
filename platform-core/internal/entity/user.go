package entity

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID            uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Email         string    `gorm:"uniqueIndex;not null" json:"email"`
	Phone         string    `gorm:"uniqueIndex" json:"phone"`
	PasswordHash  string    `gorm:"not null" json:"-"` // Don't return password in JSON
	FirstName     string    `json:"first_name"`
	LastName      string    `json:"last_name"`
	Role          string    `gorm:"not null" json:"role"` // customer, merchant, rider, admin
	Status        string    `gorm:"default:'active'" json:"status"`
	EmailVerified bool      `gorm:"default:false" json:"email_verified"`
	PhoneVerified bool      `gorm:"default:false" json:"phone_verified"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
