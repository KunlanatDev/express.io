# Express Platform - Makefile

.PHONY: help install start stop clean test

help: ## Show this help message
	@echo "Express Platform - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Infrastructure
infra-up: ## Start infrastructure (PostgreSQL, Redis, Temporal)
	docker-compose up -d postgres redis temporal temporal-ui

infra-down: ## Stop infrastructure
	docker-compose down

infra-logs: ## View infrastructure logs
	docker-compose logs -f

infra-clean: ## Clean infrastructure volumes
	docker-compose down -v

# Database
db-init: ## Initialize database
	docker exec -it express-postgres psql -U postgres -f /docker-entrypoint-initdb.d/init.sql

db-connect: ## Connect to PostgreSQL
	docker exec -it express-postgres psql -U postgres -d platform_core

db-migrate: ## Run database migrations (TODO: implement migration tool)
	@echo "Migration tool not implemented yet"

# Backend Services
backend-install: ## Install Go dependencies for all services
	cd platform-core && go mod download
	cd express-service && go mod download
	cd realtime-gateway && go mod download

backend-test: ## Run tests for all backend services
	cd platform-core && go test ./...
	cd express-service && go test ./...
	cd realtime-gateway && go test ./...

backend-lint: ## Lint Go code
	cd platform-core && golangci-lint run
	cd express-service && golangci-lint run
	cd realtime-gateway && golangci-lint run

# Platform Core
platform-core: ## Run Platform Core service
	cd platform-core && go run cmd/api/main.go

platform-core-build: ## Build Platform Core binary
	cd platform-core && go build -o bin/platform-core cmd/api/main.go

# Express Service
express-service: ## Run Express Service
	cd express-service && go run cmd/api/main.go

express-service-build: ## Build Express Service binary
	cd express-service && go build -o bin/express-service cmd/api/main.go

# Realtime Gateway
realtime-gateway: ## Run Realtime Gateway
	cd realtime-gateway && go run cmd/api/main.go

realtime-gateway-build: ## Build Realtime Gateway binary
	cd realtime-gateway && go build -o bin/realtime-gateway cmd/api/main.go

# Frontend Web
web-install: ## Install dependencies for all web apps
	cd express-customer-web && npm install
	cd express-merchant-web && npm install
	cd express-admin-web && npm install

web-customer: ## Run Customer Web
	cd express-customer-web && npm run dev

web-merchant: ## Run Merchant Web
	cd express-merchant-web && npm run dev

web-admin: ## Run Admin Web
	cd express-admin-web && npm run dev

web-build: ## Build all web apps for production
	cd express-customer-web && npm run build
	cd express-merchant-web && npm run build
	cd express-admin-web && npm run build

# Flutter Apps
flutter-install: ## Install dependencies for all Flutter apps
	cd express_customer_app && flutter pub get
	cd express_merchant_app && flutter pub get
	cd express_rider_app && flutter pub get

flutter-customer: ## Run Customer App
	cd express_customer_app && flutter run

flutter-merchant: ## Run Merchant App
	cd express_merchant_app && flutter run

flutter-rider: ## Run Rider App
	cd express_rider_app && flutter run

flutter-clean: ## Clean Flutter build artifacts
	cd express_customer_app && flutter clean
	cd express_merchant_app && flutter clean
	cd express_rider_app && flutter clean

# Development
dev-setup: infra-up backend-install web-install flutter-install ## Complete development setup
	@echo "✅ Development environment setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Copy .env.example to .env in each service"
	@echo "  2. Update environment variables"
	@echo "  3. Run 'make dev-start' to start all services"

dev-start: ## Start all services for development
	@echo "Starting infrastructure..."
	@make infra-up
	@echo ""
	@echo "Infrastructure started. Now start backend services in separate terminals:"
	@echo "  Terminal 1: make platform-core"
	@echo "  Terminal 2: make express-service"
	@echo "  Terminal 3: make realtime-gateway"
	@echo "  Terminal 4: make web-customer"
	@echo "  Terminal 5: make web-merchant"
	@echo "  Terminal 6: make web-admin"
	@echo "  Terminal 7: make flutter-rider"

dev-stop: infra-down ## Stop all services

# Testing
test-all: backend-test ## Run all tests
	@echo "✅ All tests passed!"

# Docker
docker-build: ## Build all Docker images
	docker-compose build

docker-up: ## Start all services with Docker
	docker-compose up -d

docker-down: ## Stop all Docker services
	docker-compose down

docker-logs: ## View Docker logs
	docker-compose logs -f

# Utilities
clean: ## Clean all build artifacts
	rm -rf platform-core/bin
	rm -rf express-service/bin
	rm -rf realtime-gateway/bin
	rm -rf express-customer-web/dist
	rm -rf express-merchant-web/dist
	rm -rf express-admin-web/dist
	@make flutter-clean

health-check: ## Check health of all services
	@echo "Checking Platform Core..."
	@curl -s http://localhost:8080/health || echo "❌ Platform Core not running"
	@echo ""
	@echo "Checking Express Service..."
	@curl -s http://localhost:8082/health || echo "❌ Express Service not running"
	@echo ""
	@echo "Checking Realtime Gateway..."
	@curl -s http://localhost:8083/health || echo "❌ Realtime Gateway not running"

# Documentation
docs-serve: ## Serve documentation (if using MkDocs or similar)
	@echo "Documentation server not implemented yet"

# Production
prod-build: ## Build for production
	@make backend-lint
	@make test-all
	@make docker-build
	@echo "✅ Production build complete!"

prod-deploy: ## Deploy to production (TODO: implement)
	@echo "Deployment script not implemented yet"
