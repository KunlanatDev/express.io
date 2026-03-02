package controller

import (
	"strings"

	"github.com/express-platform/platform-core/internal/model"
	"github.com/express-platform/platform-core/internal/service"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type AuthController struct {
	authService service.AuthService
}

func NewAuthController(authService service.AuthService) *AuthController {
	return &AuthController{
		authService: authService,
	}
}

func (c *AuthController) Register(ctx *fiber.Ctx) error {
	var req model.RegisterRequest
	if err := ctx.BodyParser(&req); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate (simple check)
	if req.Email == "" || req.Password == "" || req.Role == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Missing required fields",
		})
	}

	user, err := c.authService.Register(&req)
	if err != nil {
		if strings.Contains(err.Error(), "exists") {
			return ctx.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create user",
		})
	}

	return ctx.Status(fiber.StatusCreated).JSON(user)
}

func (c *AuthController) Login(ctx *fiber.Ctx) error {
	var req model.LoginRequest
	if err := ctx.BodyParser(&req); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	resp, err := c.authService.Login(&req)
	if err != nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(resp)
}

func (c *AuthController) GetMe(ctx *fiber.Ctx) error {
	// Extract user ID from JWT claims (set by middleware)
	user := ctx.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	userID := claims["sub"].(string)

	return ctx.JSON(fiber.Map{
		"user_id": userID,
		"role":    claims["role"],
	})
}
