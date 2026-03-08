package controller

import (
	"github.com/express-platform/express-service/internal/entity"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type PromoController struct {
	db *gorm.DB
}

func NewPromoController(db *gorm.DB) *PromoController {
	return &PromoController{db: db}
}

// Get Promos
func (c *PromoController) GetPromos(ctx *fiber.Ctx) error {
	var promos []entity.Promo
	if err := c.db.Find(&promos).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return ctx.JSON(promos)
}

// Create Promo
func (c *PromoController) CreatePromo(ctx *fiber.Ctx) error {
	var body entity.Promo
	if err := ctx.BodyParser(&body); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "invalid payload"})
	}

	if err := c.db.Create(&body).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return ctx.Status(201).JSON(body)
}

// Check Promo
func (c *PromoController) CheckPromo(ctx *fiber.Ctx) error {
	code := ctx.Params("code")
	var promo entity.Promo
	if err := c.db.Where("code = ? AND is_active = ?", code, true).First(&promo).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return ctx.Status(404).JSON(fiber.Map{"error": "Promo code not found or inactive"})
		}
		return ctx.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return ctx.JSON(promo)
}

// Update Promo
func (c *PromoController) UpdatePromo(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	var promo entity.Promo
	if err := c.db.First(&promo, "id = ?", id).Error; err != nil {
		return ctx.Status(404).JSON(fiber.Map{"error": "not found"})
	}

	if err := ctx.BodyParser(&promo); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "invalid payload"})
	}

	if err := c.db.Save(&promo).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return ctx.JSON(promo)
}
