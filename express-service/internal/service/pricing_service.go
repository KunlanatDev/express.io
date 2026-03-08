package service

import (
	"fmt"
	"math"

	"github.com/express-platform/express-service/internal/entity"
	"github.com/express-platform/express-service/internal/model"
	"gorm.io/gorm"
)

type PricingService interface {
	CalculatePrice(req *model.CreateOrderRequest) (total float64, addon float64, eta int, err error)
	CalculateAllPrices(req *model.CalculatePriceRequest) (*model.CalculatePriceResponse, error)
}

type pricingService struct {
	db *gorm.DB
}

func NewPricingService(db *gorm.DB) PricingService {
	return &pricingService{db: db}
}

func (s *pricingService) CalculatePrice(req *model.CreateOrderRequest) (float64, float64, int, error) {
	// Base Price
	basePrice := 40.0

	// Calculate Distance (Haversine)
	dist := s.haversine(req.PickupAddress.Lat, req.PickupAddress.Lng, req.DeliveryAddress.Lat, req.DeliveryAddress.Lng)
	distancePrice := 0.0
	etaMinutes := 15 // Minimum

	if dist > 0 {
		// 10 baht per KM
		distancePrice = dist * 10.0
		// 3 mins per km + 10 mins base
		etaMinutes = int(dist*3) + 10
	}

	// Calculate Add-ons
	addOnsPrice := 0.0
	for _, a := range req.Addons {
		switch a {
		case "wait":
			addOnsPrice += 20
		case "lift":
			addOnsPrice += 50
		case "insurance":
			addOnsPrice += 10
		}
	}

	// Parcel Weight Logic (Example)
	weightPrice := 0.0
	for _, p := range req.Parcels {
		if p.Weight > 5 {
			weightPrice += (p.Weight - 5) * 5 // +5 baht per kg over 5kg
		}
	}

	totalPrice := basePrice + distancePrice + weightPrice + addOnsPrice

	return math.Round(totalPrice), addOnsPrice, etaMinutes, nil
}

func (s *pricingService) CalculateAllPrices(req *model.CalculatePriceRequest) (*model.CalculatePriceResponse, error) {
	// 1. Calculate Total Distance
	totalDist := 0.0

	if req.Distance != nil && *req.Distance > 0 {
		totalDist = *req.Distance
	} else {
		// We treat req.DeliveryAddress as the last stop or just the first drop-off.
		// If there are Stops, we trace the full path. Let's build a path array
		path := []model.AddressInput{req.PickupAddress}

		// If stops are populated, that means multiple deliveries or a single delivery is in stops[0]
		// Let's assume DeliveryAddress is just the main drop off, but if Stops are provided, we use Stops for B, C, D instead.
		// Wait, the frontend usually puts delivery_address as the first dropoff and stops as the rest.
		path = append(path, req.DeliveryAddress)
		path = append(path, req.Stops...)

		for i := 0; i < len(path)-1; i++ {
			dist := s.haversine(path[i].Lat, path[i].Lng, path[i+1].Lat, path[i+1].Lng)
			totalDist += dist
		}
	}

	// 2. Add-ons Price
	addOnsPrice := 0.0
	for _, a := range req.Addons {
		switch a {
		case "wait":
			addOnsPrice += 20
		case "lift":
			addOnsPrice += 50
		case "insurance":
			addOnsPrice += 10
		}
	}

	// 3. Weight price
	weightPrice := 0.0
	for _, p := range req.Parcels {
		if p.Weight > 5 {
			weightPrice += (p.Weight - 5) * 5
		}
	}

	distPrice := math.Round(totalDist * 10.0) // 10 THB / KM

	// 4. Promo
	promoDiscount := 0.0
	if req.PromoCode != "" {
		var promo entity.Promo
		if err := s.db.Where("code = ? AND is_active = ?", req.PromoCode, true).First(&promo).Error; err == nil {
			promoDiscount = promo.Discount
		}
	}

	// 5. Build Services - use actual Google Maps duration if provided
	formatETA := func(totalMins float64) string {
		h := int(totalMins) / 60
		m := int(totalMins) % 60
		if h == 0 {
			return fmt.Sprintf("%d นาที", m)
		}
		if m == 0 {
			return fmt.Sprintf("%d ชั่วโมง", h)
		}
		return fmt.Sprintf("%d ชั่วโมง %d นาที", h, m)
	}

	expressETA := "1-2 ชั่วโมง"
	samedayETA := "ภายในวัน"
	intercityETA := "1-2 วัน"

	if req.DurationMins != nil && *req.DurationMins > 0 {
		// Express: actual Google Maps travel time + 10 min rider pickup buffer
		expressETA = formatETA(*req.DurationMins + 10)
		// Same-day is a scheduled batch service → always "ภายในวัน" regardless of distance
		// Inter-city is always overnight → "1-2 วัน"
	}

	services := []model.ServicePrice{
		{ServiceType: "express", TotalPrice: math.Round(45 + distPrice + weightPrice + addOnsPrice - promoDiscount), ETA: expressETA},
		{ServiceType: "sameday", TotalPrice: math.Round(25 + distPrice + weightPrice + addOnsPrice - promoDiscount), ETA: samedayETA},
		{ServiceType: "intercity", TotalPrice: math.Round(85 + distPrice + weightPrice + addOnsPrice - promoDiscount), ETA: intercityETA},
	}

	return &model.CalculatePriceResponse{
		Distance:      math.Round(totalDist*10) / 10,
		DistancePrice: distPrice,
		BasePrice:     45,
		WeightPrice:   weightPrice,
		PromoDiscount: promoDiscount,
		TotalPrice:    services[0].TotalPrice,
		ETA:           expressETA,
		Services:      services,
	}, nil
}

// haversine returns distance in km
func (s *pricingService) haversine(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371 // Earth radius in km
	dLat := (lat2 - lat1) * (math.Pi / 180.0)
	dLon := (lon2 - lon1) * (math.Pi / 180.0)

	lat1 = lat1 * (math.Pi / 180.0)
	lat2 = lat2 * (math.Pi / 180.0)

	a := math.Sin(dLat/2)*math.Sin(dLat/2) + math.Sin(dLon/2)*math.Sin(dLon/2)*math.Cos(lat1)*math.Cos(lat2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return R * c
}
