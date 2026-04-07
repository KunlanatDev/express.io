package controller

import (
	"context"

	"github.com/gofiber/fiber/v2"
	"github.com/redis/go-redis/v9"
)

type RiderController struct {
	redisClient *redis.Client
}

func NewRiderController(redisClient *redis.Client) *RiderController {
	return &RiderController{
		redisClient: redisClient,
	}
}

// UpdateLocation handles rider location updates
func (c *RiderController) UpdateLocation(ctx *fiber.Ctx) error {
	var body struct {
		RiderID string  `json:"rider_id"`
		Lat     float64 `json:"lat"`
		Lng     float64 `json:"lng"`
	}

	if err := ctx.BodyParser(&body); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	if body.RiderID == "" || body.Lat == 0 || body.Lng == 0 {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Missing rider_id, lat, or lng"})
	}

	// Store location in Redis GEO cache
	err := c.redisClient.GeoAdd(context.Background(), "riders:online", &redis.GeoLocation{
		Name:      body.RiderID,
		Longitude: body.Lng,
		Latitude:  body.Lat,
	}).Err()

	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Location updated successfully"})
}

// ToggleOnline toggles rider online status
func (c *RiderController) ToggleOnline(ctx *fiber.Ctx) error {
	var body struct {
		RiderID string `json:"rider_id"`
		IsOnline bool  `json:"is_online"`
	}

	if err := ctx.BodyParser(&body); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	if body.RiderID == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Missing rider_id"})
	}

	if !body.IsOnline {
		// Remove from active riders if they go offline
		c.redisClient.ZRem(context.Background(), "riders:online", body.RiderID)
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Status updated successfully",
		"is_online": body.IsOnline,
	})
}
