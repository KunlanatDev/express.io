package entity

import (
	"time"

	"github.com/google/uuid"
)

type Promo struct {
	ID          uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Code        string     `gorm:"uniqueIndex;not null;type:varchar(50)" json:"code"`
	Discount    float64    `gorm:"type:decimal(15,2)" json:"discount"`
	Description string     `gorm:"type:text" json:"description"`
	ValidFrom   *time.Time `json:"valid_from"`
	ValidUntil  *time.Time `json:"valid_until"`
	IsActive    bool       `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}
