package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Environment string
	Redis       RedisConfig
	Server      ServerConfig
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
}

type ServerConfig struct {
	Port string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	return &Config{
		Environment: getEnv("ENVIRONMENT", "development"),
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
		},
		Server: ServerConfig{
			Port: getEnv("PORT", "8083"),
		},
	}, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
