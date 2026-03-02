package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Environment string
	Database    DatabaseConfig
	Redis       RedisConfig
	Temporal    TemporalConfig
	Platform    PlatformConfig
	GoogleMaps  GoogleMapsConfig
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

type TemporalConfig struct {
	Host      string
	Namespace string
}

type PlatformConfig struct {
	CoreURL string
}

type GoogleMapsConfig struct {
	APIKey string
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
			Name:     getEnv("DB_NAME", "express_service"),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
		},
		Temporal: TemporalConfig{
			Host:      getEnv("TEMPORAL_HOST", "localhost:7233"),
			Namespace: getEnv("TEMPORAL_NAMESPACE", "default"),
		},
		Platform: PlatformConfig{
			CoreURL: getEnv("PLATFORM_CORE_URL", "http://localhost:8081"),
		},
		GoogleMaps: GoogleMapsConfig{
			APIKey: getEnv("GOOGLE_MAPS_API_KEY", ""),
		},
		Server: ServerConfig{
			Port: getEnv("PORT", "8082"),
		},
	}, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
