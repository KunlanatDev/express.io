import { useState } from 'react';
import {
    Box, Typography, ToggleButton, ToggleButtonGroup,
    Card, CardContent, Chip, Grid, Button, Stack
} from '@mui/material';
import { ArrowForward, Receipt, Refresh } from '@mui/icons-material';
import type { OrderResponse } from '../types';

// Mock list
const mockOrders: OrderResponse[] = [
    {
        id: '1', order_number: 'ORD-12345', status: 'completed',
        base_price: 40, distance_price: 60, add_ons_price: 20, total_price: 120,
        estimated_duration: 35, created_at: new Date().toISOString()
    },
    {
        id: '2', order_number: 'ORD-67890', status: 'completed',
        base_price: 35, distance_price: 25, add_ons_price: 0, total_price: 60,
        estimated_duration: 20, created_at: new Date().toISOString()
    }
];

const OrdersPage = () => {
    const [filter, setFilter] = useState('today');

    return (
        <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom mb={4}>My Orders</Typography>

            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <ToggleButtonGroup
                    value={filter}
                    exclusive
                    onChange={(_, v) => v && setFilter(v)}
                    color="primary"
                    sx={{ bgcolor: 'background.paper', width: { xs: '100%', md: 'auto' }, display: 'flex' }}
                >
                    <ToggleButton value="today" sx={{ flex: 1, px: { xs: 1, md: 3 } }}>Today</ToggleButton>
                    <ToggleButton value="week" sx={{ flex: 1, px: { xs: 1, md: 3 }, whiteSpace: 'nowrap' }}>Last 7 Days</ToggleButton>
                    <ToggleButton value="month" sx={{ flex: 1, px: { xs: 1, md: 3 }, whiteSpace: 'nowrap' }}>This Month</ToggleButton>
                </ToggleButtonGroup>

                {/* Mock Search/Filter */}
            </Box>

            <Stack spacing={2}>
                {mockOrders.map(order => (
                    <Card key={order.id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, '&:hover': { borderColor: 'primary.main' }, transition: 'all 0.2s' }}>
                        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                            <Grid container spacing={2} alignItems="center">

                                {/* ID & Status */}
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>ID: {order.order_number}</Typography>
                                    <Typography variant="caption" display="block" color="text.secondary">{new Date(order.created_at).toLocaleString()}</Typography>
                                    <Chip
                                        label={order.status.replace(/_/g, ' ').toUpperCase()}
                                        color={
                                            order.status === 'completed' ? 'success' :
                                            order.status === 'delivered' ? 'success' :
                                            order.status === 'cancelled' ? 'error' :
                                            order.status === 'pending' ? 'default' :
                                            'primary' // matched, arrived_pickup, picked_up, arrived_dropoff
                                        }
                                        size="small"
                                        sx={{ mt: 1, fontWeight: 700, borderRadius: 1 }}
                                    />
                                </Grid>

                                {/* Route */}
                                <Grid size={{ xs: 12, md: 5 }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle2" fontWeight={700}>Siam Paragon</Typography>
                                            <Typography variant="caption" color="text.secondary">Pickup</Typography>
                                        </Box>
                                        <ArrowForward color="action" />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle2" fontWeight={700}>Central World</Typography>
                                            <Typography variant="caption" color="text.secondary">Drop-off</Typography>
                                        </Box>
                                    </Stack>
                                </Grid>

                                {/* Price */}
                                <Grid size={{ xs: 6, md: 2 }} textAlign="right">
                                    <Typography variant="h5" fontWeight={700} color="primary.main">฿{order.total_price}</Typography>
                                    <Typography variant="caption" color="text.secondary">{order.estimated_duration} mins</Typography>
                                </Grid>

                                {/* Actions */}
                                <Grid size={{ xs: 6, md: 2 }} textAlign="right">
                                    <Button variant="outlined" size="small" fullWidth startIcon={<Receipt />} sx={{ mb: 1 }}>
                                        Receipt
                                    </Button>
                                    <Button variant="text" size="small" fullWidth startIcon={<Refresh />}>
                                        Reorder
                                    </Button>
                                </Grid>

                            </Grid>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        </Box>
    );
};

export default OrdersPage;
