package service

import (
	"errors"
	"time"

	"github.com/express-platform/platform-core/internal/config"
	"github.com/express-platform/platform-core/internal/entity"
	"github.com/express-platform/platform-core/internal/model"
	"github.com/express-platform/platform-core/internal/repo"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Register(req *model.RegisterRequest) (*entity.User, error)
	Login(req *model.LoginRequest) (*model.AuthResponse, error)
}

type authService struct {
	userRepo repo.UserRepository
	cfg      *config.Config
}

func NewAuthService(userRepo repo.UserRepository, cfg *config.Config) AuthService {
	return &authService{
		userRepo: userRepo,
		cfg:      cfg,
	}
}

func (s *authService) Register(req *model.RegisterRequest) (*entity.User, error) {
	// 1. Check if user already exists
	exists, err := s.userRepo.ExistsByEmail(req.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("email already exists")
	}

	// 2. Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// 3. Create user entity
	user := &entity.User{
		ID:           uuid.New(),
		Email:        req.Email,
		Phone:        req.Phone,
		PasswordHash: string(hashedPassword),
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Role:         req.Role,
		Status:       "active",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// 4. Save to database
	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *authService) Login(req *model.LoginRequest) (*model.AuthResponse, error) {
	// 1. Find user by email
	user, err := s.userRepo.GetByEmail(req.Email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("invalid email or password")
	}

	// 2. Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	// 3. Check status
	if user.Status != "active" {
		return nil, errors.New("account is not active")
	}

	// 4. Generate JWT
	accessToken, err := s.generateToken(user)
	if err != nil {
		return nil, err
	}

	return &model.AuthResponse{
		AccessToken: accessToken,
		ExpiresIn:   s.cfg.JWT.Expiration * 3600, // hours to seconds
		User: model.User{
			ID:        user.ID.String(),
			Email:     user.Email,
			FirstName: user.FirstName,
			LastName:  user.LastName,
			Role:      user.Role,
		},
	}, nil
}

func (s *authService) generateToken(user *entity.User) (string, error) {
	claims := jwt.MapClaims{
		"sub":  user.ID.String(),
		"role": user.Role,
		"exp":  time.Now().Add(time.Duration(s.cfg.JWT.Expiration) * time.Hour).Unix(),
		"iat":  time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWT.Secret))
}
