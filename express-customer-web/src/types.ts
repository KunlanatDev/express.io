export interface AddressInfo {
    address: string;
    place_id?: string;
    lat: number;
    lng: number;
    room?: string;
    floor?: string;
    note?: string;
    contactName?: string;
    contactPhone?: string;
}

export interface ContactInfo {
    name: string;
    phone: string;
    note?: string;
}

export interface ParcelItem {
    description: string;
    weight: number;
    width: number;
    length: number;
    height: number;
    quantity: number;
    value?: number; // For insurance
}

export interface OrderRequest {
    pickup_address: AddressInfo;
    delivery_address: AddressInfo;
    stops?: AddressInfo[]; // For multi-stop
    pickup_contact: ContactInfo;
    delivery_contact: ContactInfo;
    service_type: 'express' | 'same_day' | 'next_day' | 'inter_prov';
    parcels: ParcelItem[];
    addons: string[];
    scheduled_at?: string;
    note?: string;
}

export interface OrderResponse {
    id: string;
    order_number: string;
    status: 'pending' | 'matched' | 'arrived_pickup' | 'picked_up' | 'arrived_dropoff' | 'delivered' | 'completed' | 'cancelled';
    rider_id?: string;
    base_price: number;
    distance_price: number;
    add_ons_price: number;
    total_price: number;
    estimated_duration: number;
    rider_lat?: number;
    rider_lng?: number;
    delivery_photo_url?: string;
    created_at: string;
}

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'customer' | 'rider' | 'merchant' | 'admin';
}
