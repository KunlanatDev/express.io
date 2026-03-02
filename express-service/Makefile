.PHONY: migrate-up migrate-down migrate-status migrate-create

DB_URL := "postgres://postgres:postgres@localhost:5434/express_service?sslmode=disable"

# Install goose if not installed
install-goose:
	@which goose > /dev/null || go install github.com/pressly/goose/v3/cmd/goose@latest

# Run all pending migrations
migrate-up: install-goose
	@echo "Running migrations..."
	@goose -dir migrations postgres $(DB_URL) up

# Rollback last migration
migrate-down: install-goose
	@echo "Rolling back last migration..."
	@goose -dir migrations postgres $(DB_URL) down

# Show migration status
migrate-status: install-goose
	@goose -dir migrations postgres $(DB_URL) status

# Create new migration file
# Usage: make migrate-create NAME=add_new_column
migrate-create: install-goose
	@goose -dir migrations create $(NAME) sql

# Reset database (down all, then up all)
migrate-reset: install-goose
	@echo "Resetting database..."
	@goose -dir migrations postgres $(DB_URL) reset
	@goose -dir migrations postgres $(DB_URL) up

# Run the API server
run:
	@go run cmd/api/main.go

# Run tests
test:
	@go test -v ./...

# Build binary
build:
	@go build -o bin/express-service cmd/api/main.go

help:
	@echo "Available commands:"
	@echo "  make migrate-up      - Run all pending migrations"
	@echo "  make migrate-down    - Rollback last migration"
	@echo "  make migrate-status  - Show migration status"
	@echo "  make migrate-create NAME=<name> - Create new migration"
	@echo "  make migrate-reset   - Reset and re-run all migrations"
	@echo "  make run            - Run the API server"
	@echo "  make build          - Build binary"
	@echo "  make test           - Run tests"
