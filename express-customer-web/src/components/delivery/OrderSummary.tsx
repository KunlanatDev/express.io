import React from 'react';
import { Box, Typography, Card, Button, Divider, Stack, TextField, InputAdornment } from '@mui/material';
import { Place, InfoOutlined, ArrowForward } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import type { OrderResponse } from '../../types';

interface OrderSummaryProps {
    orderResult: OrderResponse | null;
    loading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ orderResult, onConfirm }) => {
    const theme = useTheme();

    // Helper to format currency
    const formatPrice = (price: any) => {
        return typeof price === 'number' ? `฿${price}` : price;
    };

    return (
        <Stack spacing={3} sx={{ height: '100%' }}>
            {/* MAP AREA */}
            <Card sx={{
                flexGrow: 1,
                minHeight: 320,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '24px',
                bgcolor: '#283042', // Dark Navy/Slate from image
                boxShadow: 'none',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {/* Visual Curve */}
                <Box sx={{ position: 'absolute', inset: 0, opacity: 0.8 }}>
                    <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="none">
                        <path
                            d="M -20 320 Q 200 50 420 320"
                            stroke="#3B82F6"
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray="8 8"
                            strokeLinecap="round"
                            style={{ filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))' }}
                        />
                    </svg>
                </Box>

                {/* Start Pin Indicator (Ghost) */}
                <Box sx={{
                    position: 'absolute',
                    bottom: '15%',
                    left: '20%',
                    width: 40, height: 12,
                    bgcolor: 'rgba(0,0,0,0.2)',
                    borderRadius: '50%',
                    filter: 'blur(4px)'
                }} />

                {/* Pin Icon */}
                <Box sx={{
                    position: 'absolute',
                    top: '40%', // Approximate top of curve
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}>
                    <Box sx={{
                        width: 48, height: 48,
                        borderRadius: '50%',
                        bgcolor: 'rgba(59, 130, 246, 0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'pulse 2s infinite'
                    }}>
                        <Box sx={{
                            width: 36, height: 36,
                            borderRadius: '50%',
                            bgcolor: '#3B82F6',
                            border: '3px solid #fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
                        }}>
                            <Place sx={{ fontSize: 20, color: '#fff' }} />
                        </Box>
                    </Box>
                </Box>

                {/* Decoration Element */}
                <Box sx={{
                    position: 'absolute',
                    bottom: 40,
                    left: 40,
                    width: 60, height: 24,
                    bgcolor: '#1e293b',
                    borderRadius: 2
                }} />

            </Card>

            {/* SUMMARY CARD */}
            <Card sx={{
                borderRadius: '24px',
                p: { xs: 2.5, md: 3 },
                boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid',
                borderColor: 'divider'
            }}>
                {/* Header: Price & Time */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                            ราคาโดยประมาณ
                        </Typography>
                        <Stack direction="row" alignItems="baseline" spacing={1.5}>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: '#2563EB', fontSize: '2.5rem', letterSpacing: -1 }}>
                                {formatPrice(orderResult?.total_price || 45)}
                            </Typography>
                            <Typography variant="h6" sx={{ textDecoration: 'line-through', color: '#94a3b8', fontWeight: 500 }}>
                                ฿60
                            </Typography>
                        </Stack>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                            ถึงผู้รับประมาณ
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                            14:20 – 14:50
                        </Typography>
                    </Box>
                </Stack>

                <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

                {/* Cost Breakdown */}
                <Stack spacing={2} sx={{ mb: 3 }}>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body1" color="text.secondary" fontWeight={500}>
                            ค่าจัดส่ง (4.2 กม.)
                        </Typography>
                        <Typography variant="body1" fontWeight={700} color="#0F172A">
                            {formatPrice(orderResult?.distance_price || 35)}
                        </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body1" color="text.secondary" fontWeight={500}>
                            ค่าบริการพื้นฐาน
                        </Typography>
                        <Typography variant="body1" fontWeight={700} color="#0F172A">
                            {formatPrice(orderResult?.base_price || 10)}
                        </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body1" fontWeight={700} sx={{ color: '#0F172A' }}>
                            ส่วนลดสมาชิก (PROMO10)
                        </Typography>
                        <Typography variant="body1" fontWeight={700} sx={{ color: '#0F172A' }}>
                            -฿10
                        </Typography>
                    </Stack>
                </Stack>

                {/* Coupon Field */}
                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        placeholder="กรอกคูปองส่วนลด"
                        variant="outlined"
                        size="small"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Button
                                        variant="contained"
                                        size="small"
                                        sx={{
                                            bgcolor: '#1e293b',
                                            color: '#fff',
                                            textTransform: 'none',
                                            borderRadius: 1.5,
                                            px: 2,
                                            minWidth: 'auto',
                                            boxShadow: 'none',
                                            '&:hover': { bgcolor: '#0f172a' }
                                        }}
                                    >
                                        ใช้สิทธิ์
                                    </Button>
                                </InputAdornment>
                            ),
                            sx: {
                                borderRadius: 3,
                                bgcolor: '#F8FAFC',
                                '& fieldset': { border: '1px solid #E2E8F0' },
                                pr: 0.5,
                                py: 0.5
                            }
                        }}
                    />
                </Box>

                {/* Main Action Button */}
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={onConfirm}
                    endIcon={<ArrowForward />}
                    sx={{
                        bgcolor: '#2563EB',
                        color: 'white',
                        py: 1.5,
                        borderRadius: 3,
                        fontSize: '1rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)',
                        mb: 2,
                        '&:hover': {
                            bgcolor: '#1d4ed8',
                            boxShadow: '0 12px 24px -5px rgba(37, 99, 235, 0.5)',
                        }
                    }}
                >
                    ยืนยันคำสั่งส่งพัสดุ
                </Button>

                <Typography variant="caption" display="block" align="center" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    โดยการกดปุ่ม คุณยอมรับ <Box component="span" sx={{ textDecoration: 'underline', cursor: 'pointer', color: 'text.primary' }}>ข้อตกลงและเงื่อนไขการใช้บริการ</Box>
                </Typography>
            </Card>

            {/* Info Footer */}
            <Card sx={{
                borderRadius: '20px',
                p: 2,
                bgcolor: '#F8FAFC',
                border: '1px solid',
                borderColor: '#F1F5F9',
                boxShadow: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 2
            }}>
                <Box sx={{
                    minWidth: 40, height: 40,
                    borderRadius: '50%',
                    bgcolor: '#DBEAFE',
                    color: '#2563EB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <InfoOutlined />
                </Box>
                <Box>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#1e293b' }}>
                        ข้อมูลควรรู้
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        มีไรเดอร์อยู่ใกล้คุณ 15 คน โอกาสจับคู่สูงมาก
                    </Typography>
                </Box>
            </Card>
        </Stack>
    );
};

export default OrderSummary;
