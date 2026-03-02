package service

import (
	"math"

	"github.com/express-platform/express-service/internal/model"
)

type PricingService interface {
	CalculatePrice(req *model.CreateOrderRequest) (total float64, addon float64, eta int, err error)
}

type pricingService struct{}

func NewPricingService() PricingService {
	return &pricingService{}
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
