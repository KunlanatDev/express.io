package controller

import (
	"context"

	"github.com/express-platform/express-service/internal/model"
	"github.com/express-platform/express-service/internal/service"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type OrderController struct {
	orderService   service.OrderService
	pricingService service.PricingService
}

func NewOrderController(orderService service.OrderService, pricingService service.PricingService) *OrderController {
	return &OrderController{
		orderService:   orderService,
		pricingService: pricingService,
	}
}

func (c *OrderController) CalculatePrice(ctx *fiber.Ctx) error {
	var req model.CalculatePriceRequest
	if err := ctx.BodyParser(&req); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.PickupAddress.Address == "" || req.DeliveryAddress.Address == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Missing pickup or delivery address",
		})
	}

	res, err := c.pricingService.CalculateAllPrices(&req)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to calculate price: " + err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(res)
}

func (c *OrderController) CreateOrder(ctx *fiber.Ctx) error {
	var req model.CreateOrderRequest
	if err := ctx.BodyParser(&req); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate (simple)
	if req.ServiceType == "" || req.PickupAddress.Address == "" || req.DeliveryAddress.Address == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Missing required fields",
		})
	}

	// Get Customer ID from JWT (Middleware)
	// TODO: Replace with real middleware extraction
	customerID := "0407f38c-8c1d-4444-9999-555555555555" // Mock

	order, err := c.orderService.CreateOrder(context.Background(), &req, customerID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create order: " + err.Error(),
		})
	}

	return ctx.Status(fiber.StatusCreated).JSON(order)
}

func (c *OrderController) GetOrder(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	if id == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Order ID is required"})
	}

	order, err := c.orderService.GetOrder(context.Background(), id)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Order not found"})
	}

	return ctx.Status(fiber.StatusOK).JSON(order)
}

func (c *OrderController) AcceptOrder(ctx *fiber.Ctx) error {
	orderID := ctx.Params("id")
	if orderID == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Order ID is required"})
	}

	// For POC, we might not have authentication middleware extracting rider ID yet.
	// We'll mock it or pass it in body. For now, let's use a hardcoded valid UUID.
	riderID := uuid.MustParse("00000000-0000-0000-0000-000000000001") // Using a valid nil UUID or specific one

	order, err := c.orderService.AcceptOrder(context.Background(), orderID, riderID.String())
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Order accepted", "order": order})
}

func (c *OrderController) CancelOrder(ctx *fiber.Ctx) error {
	orderID := ctx.Params("id")
	if orderID == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Order ID is required"})
	}

	var body struct {
		Reason string `json:"reason"`
	}
	if err := ctx.BodyParser(&body); err != nil {
		body.Reason = "Customer cancelled" // Default reason
	}

	order, err := c.orderService.CancelOrder(ctx.Context(), orderID, body.Reason)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Order cancelled", "order": order})
}

func (c *OrderController) PickupOrder(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	if id == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Order ID is required"})
	}

	var body struct {
		PhotoURL string `json:"photo_url"`
	}
	if err := ctx.BodyParser(&body); err != nil {
		// keeping it optional or error? Let's say optional for now but ideally required.
		// return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	order, err := c.orderService.PickupOrder(ctx.Context(), id, body.PhotoURL)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Order picked up", "order": order})
}

func (c *OrderController) DeliverOrder(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	if id == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Order ID is required"})
	}

	var body struct {
		PhotoURL string `json:"photo_url"`
	}
	if err := ctx.BodyParser(&body); err != nil {
		// optional
	}

	order, err := c.orderService.DeliverOrder(ctx.Context(), id, body.PhotoURL)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Order delivered", "order": order})
}

func (c *OrderController) ArrivedAtPickup(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	if id == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Order ID is required"})
	}

	order, err := c.orderService.ArrivedAtPickup(ctx.Context(), id)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Arrived at pickup", "order": order})
}

func (c *OrderController) ArrivedAtDropoff(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	if id == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Order ID is required"})
	}

	order, err := c.orderService.ArrivedAtDropoff(ctx.Context(), id)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Arrived at dropoff", "order": order})
}

func (c *OrderController) ConfirmPayment(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	if id == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Order ID is required"})
	}

	order, err := c.orderService.ConfirmPayment(ctx.Context(), id)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Payment confirmed", "order": order})
}

func (c *OrderController) RateOrder(ctx *fiber.Ctx) error {
	orderID := ctx.Params("id")
	if orderID == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Order ID is required"})
	}

	var body struct {
		Rating  int    `json:"rating"`
		Comment string `json:"comment"`
	}
	if err := ctx.BodyParser(&body); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	order, err := c.orderService.RateOrder(ctx.Context(), orderID, body.Rating, body.Comment)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Rating submitted", "order": order})
}
