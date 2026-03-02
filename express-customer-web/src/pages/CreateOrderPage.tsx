import React, { useState } from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import DeliveryForm from '../components/delivery/DeliveryForm';
import OrderSummary from '../components/delivery/OrderSummary';
import { orderService } from '../services/order';
import type { OrderResponse } from '../types';

interface CreateOrderPageProps {
    token: string | null;
    onRequireAuth: () => void;
    orderResult: OrderResponse | null;
    setOrderResult: (res: any) => void;
    successMsg: string | null;
    setSuccessMsg: (msg: string | null) => void;
    error: string | null;
    setError: (msg: string | null) => void;
}

const CreateOrderPage: React.FC<CreateOrderPageProps> = ({
    token, onRequireAuth, orderResult, setOrderResult,
    setSuccessMsg, setError
}) => {
    // Order Form State
    const [deliveryTab, setDeliveryTab] = useState(0);
    const [pickup, setPickup] = useState('Siam Paragon, Bangkok');
    const [delivery, setDelivery] = useState('Central World, Bangkok');
    const [parcelType, setParcelType] = useState('box');
    const [parcelSize, setParcelSize] = useState('M');
    const [services, setServices] = useState({ wait: false, lift: false, insurance: false });
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateOrder = async () => {
        if (!token) {
            onRequireAuth();
            return;
        }
        setLoading(true);
        try {
            // Map inputs to API request
            let weight = 1.0, w = 20, l = 20, h = 10;
            switch (parcelSize) {
                case 'S': weight = 1.0; w = 20; l = 20; h = 10; break;
                case 'M': weight = 5.0; w = 30; l = 30; h = 15; break;
                case 'L': weight = 15.0; w = 50; l = 50; h = 40; break;
                case 'XL': weight = 30.0; w = 80; l = 80; h = 60; break;
            }

            const addons: string[] = [];
            if (services.wait) addons.push('wait');
            if (services.lift) addons.push('lift');
            if (services.insurance) addons.push('insurance');

            const orderData = {
                pickup_address: {
                    address: pickup,
                    lat: 13.7462,
                    lng: 100.5348,
                    note: ''
                },
                delivery_address: {
                    address: delivery,
                    lat: 13.7500,
                    lng: 100.5000,
                    note: note
                },
                pickup_contact: { name: `Me`, phone: '0812345678' },
                delivery_contact: { name: 'Receiver', phone: '0898765432' },
                service_type: deliveryTab === 0 ? 'express' : 'next_day',
                parcels: [{
                    description: `${parcelType} - ${parcelSize}`,
                    weight, width: w, length: l, height: h,
                    quantity: 1
                }],
                addons,
                scheduled_at: deliveryTab === 1 ? new Date(Date.now() + 86400000).toISOString() : undefined
            };

            const res = await orderService.create(orderData);
            setOrderResult(res);
            setSuccessMsg('Order successfully created! Finding nearby riders...');
        } catch (err: any) {
            setError(err?.message || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!orderResult) return;
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        setLoading(true);
        try {
            await orderService.cancel(orderResult.id, 'User cancelled');
            setOrderResult((prev: any) => ({ ...prev, status: 'cancelled' }));
            setSuccessMsg('Order cancelled.');
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid container spacing={4} sx={{ height: '100%', alignItems: 'stretch' }}>

            {/* LEFT PANEL (Builder) - 60% approx */}
            <Grid size={{ xs: 12, md: 7 }}>

                <Typography variant="h5" fontWeight={800} gutterBottom sx={{ mb: 3, pl: 1 }}>
                    {/* CREATE DELIVERY */}
                    สร้างคำสั่งส่งของ
                </Typography>

                <DeliveryForm
                    pickup={pickup} setPickup={setPickup}
                    delivery={delivery} setDelivery={setDelivery}
                    deliveryTab={deliveryTab} setDeliveryTab={setDeliveryTab}
                    parcelType={parcelType} setParcelType={setParcelType}
                    parcelSize={parcelSize} setParcelSize={setParcelSize}
                    services={services} setServices={setServices}
                    note={note} setNote={setNote}
                    loading={loading}
                    onSubmit={handleCreateOrder}
                />
            </Grid>

            {/* RIGHT PANEL (Map + Summary) - 40% approx */}
            <Grid size={{ xs: 12, md: 5 }}>
                <OrderSummary
                    orderResult={orderResult}
                    loading={loading}
                    onConfirm={handleCreateOrder}
                    onCancel={handleCancelOrder}
                />
            </Grid>

        </Grid>
    );
};

export default CreateOrderPage;
