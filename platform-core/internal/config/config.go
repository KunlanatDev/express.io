package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Environment string
	Database    DatabaseConfig
	Redis       RedisConfig
	JWT         JWTConfig
	CORS        CORSConfig
	Payment     PaymentConfig
	Server      ServerConfig
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
}

type JWTConfig struct {
	Secret     string
	Expiration int // hours
}

type CORSConfig struct {
	AllowedOrigins string
}

type PaymentConfig struct {
	GatewayURL string
	APIKey     string
	SecretKey  string
}

type ServerConfig struct {
	Port string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	return &Config{
		Environment: getEnv("ENVIRONMENT", "development"),
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5434"), // Default updated
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "postgres"),
			Name:     getEnv("DB_NAME", "platform_core"),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
		},
		JWT: JWTConfig{
			Secret:     getEnv("JWT_SECRET", "supersecretDefault"),
			Expiration: 24, // 24 hours
		},
		CORS: CORSConfig{
			AllowedOrigins: getEnv("CORS_ALLOWED_ORIGINS", "*"),
		},
		Payment: PaymentConfig{
			GatewayURL: getEnv("PAYMENT_GATEWAY_URL", ""),
			APIKey:     getEnv("PAYMENT_API_KEY", ""),
			SecretKey:  getEnv("PAYMENT_SECRET_KEY", ""),
		},
		Server: ServerConfig{
			Port: getEnv("PORT", "8081"),
		},
	}, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
