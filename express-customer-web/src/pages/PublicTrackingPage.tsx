import { useEffect, useState } from 'react';
import {
    Box, Typography, Avatar,
    IconButton, Stack, Divider, Paper
} from '@mui/material';
import {
    DirectionsBike, Phone, Chat, Star
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import type { OrderResponse } from '../types';

// Mock map component (replace with real map later)
const TrackingMap = ({ riderLat }: { riderLat?: number, riderLng?: number }) => (
    <Box sx={{
        width: '100%', height: '100%',
        bgcolor: '#0f172a',
        position: 'relative',
        backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
        backgroundSize: '20px 20px'
    }}>
        {riderLat && (
            <Box sx={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48, border: '4px solid rgba(255,255,255,0.2)' }}>
                    <DirectionsBike />
                </Avatar>
                <Paper sx={{ mt: 1, px: 1, py: 0.5, bgcolor: 'rgba(0,0,0,0.8)', color: 'white', borderRadius: 1 }}>
                    <Typography variant="caption" fontFamily="monospace">RIDER LIVE</Typography>
                </Paper>
            </Box>
        )}
    </Box>
);

const PublicTrackingPage = () => {
    const theme = useTheme();
    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [, setLoading] = useState(false); // Used in future

    useEffect(() => {
        setLoading(true);
        // Mock data
        const timer = setTimeout(() => {
            setOrder({
                id: '123',
                order_number: 'ORD-DEMO',
                status: 'matched',
                base_price: 100,
                distance_price: 50,
                add_ons_price: 0,
                total_price: 150,
                estimated_duration: 15,
                created_at: new Date().toISOString(),
                rider_lat: 13.75,
                rider_lng: 100.50
            } as OrderResponse);
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const statusSteps = ['pending', 'matched', 'picked_up', 'delivered', 'completed'];
    const activeStep = order ? statusSteps.indexOf(order.status) : 0;

    return (
        <Box sx={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>

            {/* STATUS BAR */}
            <Paper square elevation={0} sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ maxWidth: 800, mx: 'auto', width: '100%' }}>
                    {statusSteps.map((step, index) => {
                        const isCompleted = index <= activeStep;
                        return (
                            <Box key={step} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="caption" fontWeight={700} color={isCompleted ? 'primary.main' : 'text.disabled'} sx={{ mb: 1, textTransform: 'uppercase' }}>
                                    {step.replace('_', ' ')}
                                </Typography>
                                <Box sx={{ width: '100%', height: 4, bgcolor: isCompleted ? 'primary.main' : 'divider', borderRadius: 2 }} />
                            </Box>
                        )
                    })}
                </Stack>
            </Paper>

            {/* MAIN CONTENT */}
            <Box sx={{ flexGrow: 1, position: 'relative' }}>
                <TrackingMap riderLat={order?.rider_lat} riderLng={order?.rider_lng} />

                {/* RIDER CARD OVERLAY */}
                <Paper
                    elevation={6}
                    sx={{
                        position: 'absolute', bottom: 30, left: 30, right: 30,
                        maxWidth: 400, mx: { xs: 'auto', md: 0 },
                        p: 3, borderRadius: 4,
                        bgcolor: alpha(theme.palette.background.paper, 0.95),
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: 'grey.300' }} src="https://via.placeholder.com/150" />
                        <Box>
                            <Typography variant="h6" fontWeight={700}>Somchai P.</Typography>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <Star fontSize="small" color="warning" />
                                <Typography variant="body2" fontWeight={600}>4.9 (120 jobs)</Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary">Honda Wave 110i • 1กก-9999</Typography>
                        </Box>
                        <Box sx={{ flexGrow: 1 }} />
                        <Stack spacing={1}>
                            <IconButton color="primary" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}><Phone /></IconButton>
                            <IconButton color="secondary" sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}><Chat /></IconButton>
                        </Stack>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>EST. ARRIVAL</Typography>
                            <Typography variant="h5" fontWeight={800} color="primary.main">14:35</Typography>
                        </Box>
                        <Box textAlign="right">
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>DISTANCE</Typography>
                            <Typography variant="h6" fontWeight={700}>2.5 km</Typography>
                        </Box>
                    </Stack>
                </Paper>
            </Box>

        </Box>
    );
};

export default PublicTrackingPage;
