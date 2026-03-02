package controller

import (
	"fmt"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type UploadController struct{}

func NewUploadController() *UploadController {
	return &UploadController{}
}

func (c *UploadController) UploadImage(ctx *fiber.Ctx) error {
	// Get file from request
	file, err := ctx.FormFile("image")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Image file is required"})
	}

	// Validate extension (simple)
	ext := filepath.Ext(file.Filename)
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Only jpg/png allowed"})
	}

	// Generate unique filename
	filename := fmt.Sprintf("%s_%d%s", uuid.New().String(), time.Now().Unix(), ext)
	savePath := fmt.Sprintf("./uploads/%s", filename)

	// Save to disk
	if err := ctx.SaveFile(file, savePath); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save file"})
	}

	// Return public URL (assuming server runs on localhost:8082)
	// In production this would be S3 URL
	publicURL := fmt.Sprintf("http://localhost:8082/uploads/%s", filename)

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Upload successful",
		"url":     publicURL,
	})
}
