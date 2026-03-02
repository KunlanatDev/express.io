package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

// RequestLogger returns the logger middleware
func RequestLogger() fiber.Handler {
	return logger.New(logger.Config{
		Format: "[${time}] ${status} - ${method} ${path}\n",
	})
}

// ErrorHandler is a custom error handler
func ErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	message := "Internal Server Error"

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
		message = e.Message
	}

	return c.Status(code).JSON(fiber.Map{
		"error":   true,
		"message": message,
	})
}
