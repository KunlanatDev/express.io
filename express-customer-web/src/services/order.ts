import { authService } from './auth';

const API_URL = import.meta.env.VITE_EXPRESS_SERVICE_URL || 'http://localhost:8082/api/v1';

export interface CreateOrderRequest {
    service_type: string;
    pickup_address: { address: string; lat: number; lng: number; note?: string; };
    delivery_address: { address: string; lat: number; lng: number; note?: string; };
    pickup_contact: { name: string; phone: string; note?: string; };
    delivery_contact: { name: string; phone: string; note?: string; };
    parcels: { description: string; weight: number; width: number; length: number; height: number; quantity: number; }[];
    addons?: string[];
    scheduled_at?: string;
}

export interface CalculatePriceRequest {
    pickup_address: { address: string; lat: number; lng: number; };
    delivery_address: { address: string; lat: number; lng: number; };
    stops?: { address: string; lat: number; lng: number; }[];
    parcels?: { description: string; weight: number; width: number; length: number; height: number; quantity: number; }[];
    addons?: string[];
    promo_code?: string;
    distance?: number;
    duration_mins?: number;
}

export const orderService = {
    calculate: async (data: CalculatePriceRequest) => {
        const response = await fetch(`${API_URL}/orders/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Calculate Price Failed: ${errorText}`);
        }
        return response.json();
    },
    create: async (data: CreateOrderRequest) => {
        const token = authService.getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Create Order Failed: ${errorText}`);
        }

        return response.json();
    },

    getAll: async () => {
        const token = authService.getToken();
        if (!token) throw new Error('Not authenticated');

        // For now, get by ID loop or implement list endpoint
        // Placeholder as API might not support list yet
    },

    getById: async (id: string) => {
        const token = authService.getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_URL}/orders/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Get Order Failed: ${errorText}`);
        }

        return response.json();
    },

    cancel: async (id: string, reason: string) => {
        const token = authService.getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_URL}/orders/${id}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ reason }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Cancel Order Failed: ${errorText}`);
        }

        return response.json();
    },

    rate: async (id: string, rating: number, comment: string) => {
        const token = authService.getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_URL}/orders/${id}/rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ rating, comment }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Rate Order Failed: ${errorText}`);
        }

        return response.json();
    }
};
