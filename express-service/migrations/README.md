# Database Migrations

This project uses both **GORM AutoMigrate** (development) and **Goose** (production) for database migrations.

## Auto Migration (Development)

When you run the server with `go run cmd/api/main.go`, GORM will automatically:

- Create missing tables
- Add missing columns
- Update column types (with limitations)

**Note:** AutoMigrate will NOT:

- Delete unused columns
- Delete unused tables
- Rename columns

## Goose Migrations (Production)

For production deployments, use Goose migrations for full control.

### Installation

Goose will be auto-installed when you run `make` commands.

Or install manually:

```bash
go install github.com/pressly/goose/v3/cmd/goose@latest
```

### Commands

```bash
# Run all pending migrations
make migrate-up

# Rollback last migration
make migrate-down

# Check migration status
make migrate-status

# Create new migration
make migrate-create NAME=add_user_table

# Reset database (careful!)
make migrate-reset
```

### Manual Goose Commands

```bash
# Up
goose -dir migrations postgres "postgres://postgres:postgres@localhost:5434/express_service?sslmode=disable" up

# Down
goose -dir migrations postgres "postgres://postgres:postgres@localhost:5434/express_service?sslmode=disable" down

# Status
goose -dir migrations postgres "postgres://postgres:postgres@localhost:5434/express_service?sslmode=disable" status
```

## Migration Files

Migrations are stored in `migrations/` directory.

### File Format

```sql
-- +goose Up
-- SQL for applying migration
ALTER TABLE users ADD COLUMN email VARCHAR(255);

-- +goose Down
-- SQL for rolling back migration
ALTER TABLE users DROP COLUMN email;
```

## Best Practices

1. **Development**: Use AutoMigrate for quick iterations
2. **Production**: Always use Goose migrations
3. **Version Control**: Commit all migration files
4. **Testing**: Test migrations on staging before production
5. **Rollback Plan**: Always write `Down` migrations

## Current Migrations

- `20260213_add_proof_of_delivery.sql` - Adds photo URLs and timestamps for delivery tracking
