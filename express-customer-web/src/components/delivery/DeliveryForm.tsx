import React, { useState } from 'react';
import {
    Box, Typography, TextField, Button,
    Stack, Card, Divider,
    ToggleButton, ToggleButtonGroup,
    InputAdornment
} from '@mui/material';
import {
    Place, Add,
    Description, Inventory2, WineBar, Apartment, LocalDining,
    FlashOn,  // For Express
    LocalShipping, // For Same-day
    Language, // For Inter-city
    CheckCircle,
    History,
    Search
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';

interface DeliveryFormProps {
    pickup: string;
    setPickup: (val: string) => void;
    delivery: string;
    setDelivery: (val: string) => void;
    deliveryTab: number;
    setDeliveryTab: (val: number) => void;
    parcelType: string;
    setParcelType: (val: string) => void;
    parcelSize: string;
    setParcelSize: (val: string) => void;
    services: { wait: boolean; lift: boolean; insurance: boolean };
    setServices: (val: any) => void;
    note: string;
    setNote: (val: string) => void;
    loading: boolean;
    onSubmit: () => void;
}

const POINT_SIZE = 26;        // ขนาดวงกลม (ring)
const POINT_BORDER = 5;       // ความหนาขอบ ring
const TIMELINE_X = 32 + 16;   // left ของ container (32) + center ในกล่อง (16) = 48


const DeliveryForm: React.FC<DeliveryFormProps> = ({
    pickup, setPickup, delivery, setDelivery,
    deliveryTab, setDeliveryTab,
    parcelType, setParcelType, parcelSize, setParcelSize,
    services, setServices
}) => {
    const theme = useTheme();

    // Local state for extra fields shown in design
    const [senderName, setSenderName] = useState('คุณสมชาย');
    const [senderPhone, setSenderPhone] = useState('081-234-56xx');
    const [parcelValue, setParcelValue] = useState('36');

    // Service Types Data
    const serviceTypes = [
        {
            id: 'express',
            label: 'Express',
            price: 45,
            desc: 'ด่วนที่สุด ทันใจคุณ',
            time: '1-2 ชม.',
            icon: FlashOn,
            tabIndex: 0
        },
        {
            id: 'sameday',
            label: 'Same-day',
            price: 25,
            desc: 'ส่งเช้า ถึงเย็น ราคาประหยัด',
            time: 'ภายในวัน',
            icon: LocalShipping,
            tabIndex: 1
        },
        {
            id: 'intercity',
            label: 'Inter-city',
            price: 85,
            desc: 'ส่งข้ามจังหวัด มีระบบติดตาม',
            time: '1-2 วัน',
            icon: Language,
            tabIndex: 2
        }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* 1. LOCATION CARD */}
            {/* 1. LOCATION CARD */}
            <Card
                sx={{
                    borderRadius: "28px",
                    border: "1px solid #E6EDF7",
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
                    overflow: "hidden",
                }}
            >
                {/* Header Tabs */}
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                        px: 3,
                        py: 2.25,
                        bgcolor: "#F7FAFF",
                    }}
                >
                    <Stack direction="row" spacing={3} alignItems="center">
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                color: deliveryTab === 0 ? "#2563EB" : "#64748B",
                                cursor: "pointer",
                                fontWeight: 800,
                            }}
                            onClick={() => setDeliveryTab(0)}
                        >
                            <History fontSize="small" />
                            <Typography variant="subtitle1" fontWeight={800}>
                                ส่งทันที
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                color: deliveryTab === 1 ? "#2563EB" : "#64748B",
                                cursor: "pointer",
                                fontWeight: 700,
                            }}
                            onClick={() => setDeliveryTab(1)}
                        >
                            <Typography variant="subtitle1" fontWeight={700}>
                                นัดหมายเวลา
                            </Typography>
                        </Box>
                    </Stack>

                    <Typography sx={{ color: "#64748B", fontWeight: 700 }}>
                        ระยะทางประมาณ 4.2 กม.
                    </Typography>
                </Stack>

                <Divider sx={{ borderColor: "#E6EDF7" }} />

                {/* Body */}
                <Box sx={{ p: 4 }}>
                    <Stack direction="row" spacing={2} alignItems="stretch">
                        {/* LEFT Timeline Column (วงกลมบน-เส้น-วงกลมล่าง) */}
                        <Box
                            sx={{
                                width: 40,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                // ให้ตำแหน่งวงกลมตรงกับบรรทัดหัวข้อ (จุดรับ/จุดส่ง)
                                pt: 0.25,
                            }}
                        >
                            {/* Top ring */}
                            <Box
                                sx={{
                                    width: POINT_SIZE,
                                    height: POINT_SIZE,
                                    borderRadius: "50%",
                                    bgcolor: "#fff",
                                    border: `${POINT_BORDER}px solid #2563EB`,
                                    boxSizing: "border-box",
                                    flexShrink: 0,
                                }}
                            />

                            {/* Line between rings (ไม่เกินจุดส่งแน่นอน) */}
                            <Box
                                sx={{
                                    flex: 1,
                                    width: 3,
                                    borderRadius: 999,
                                    background:
                                        "linear-gradient(to bottom, #2563EB 0%, rgba(37,99,235,0.55) 45%, rgba(37,99,235,0.20) 75%, transparent 100%)",
                                    // ให้เส้นเริ่มจาก “กลางวงกลม” จริง ๆ (เพราะวงกลมเป็น ring มี border หนา)
                                    mt: 0.5,
                                    mb: 0.5,
                                }}
                            />

                            {/* Bottom ring */}
                            <Box
                                sx={{
                                    width: POINT_SIZE,
                                    height: POINT_SIZE,
                                    borderRadius: "50%",
                                    bgcolor: "#fff",
                                    border: `${POINT_BORDER}px solid #0F172A`,
                                    boxSizing: "border-box",
                                    flexShrink: 0,
                                }}
                            />
                        </Box>

                        {/* RIGHT Content Column */}
                        <Stack spacing={3.25} sx={{ flex: 1 }}>
                            {/* Pickup block */}
                            <Box>
                                <Box sx={{ height: POINT_SIZE, display: "flex", alignItems: "center", mb: 1.25 }}>
                                    <Typography sx={{ color: "#64748B", fontWeight: 800 }}>
                                        จุดรับพัสดุ
                                    </Typography>
                                </Box>

                                <TextField
                                    fullWidth
                                    value={pickup}
                                    onChange={(e) => setPickup(e.target.value)}
                                    placeholder="ค้นหาจุดรับ..."
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search sx={{ color: "#94A3B8" }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        mb: 2,
                                        "& .MuiOutlinedInput-root": {
                                            height: 64,
                                            borderRadius: "22px",
                                            bgcolor: "#fff",
                                        },
                                        "& fieldset": { borderColor: "#D8E2F1" },
                                        "& .MuiOutlinedInput-root:hover fieldset": { borderColor: "#C9D7EE" },
                                        "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "#2563EB" },
                                    }}
                                />

                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        fullWidth
                                        value={senderName}
                                        onChange={(e) => setSenderName(e.target.value)}
                                        placeholder="คุณสมชาย"
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                height: 58,
                                                borderRadius: "18px",
                                                bgcolor: "#fff",
                                            },
                                            "& fieldset": { borderColor: "#D8E2F1" },
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        value={senderPhone}
                                        onChange={(e) => setSenderPhone(e.target.value)}
                                        placeholder="081-234-56xx"
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                height: 58,
                                                borderRadius: "18px",
                                                bgcolor: "#fff",
                                            },
                                            "& fieldset": { borderColor: "#D8E2F1" },
                                        }}
                                    />
                                </Stack>
                            </Box>

                            {/* Dropoff block */}
                            <Box>
                                <Box sx={{ height: POINT_SIZE, display: "flex", alignItems: "center", mb: 1.25 }}>
                                    <Typography sx={{ color: "#64748B", fontWeight: 800 }}>
                                        จุดส่งพัสดุ
                                    </Typography>
                                </Box>

                                <TextField
                                    fullWidth
                                    value={delivery}
                                    onChange={(e) => setDelivery(e.target.value)}
                                    placeholder="ระบุจุดส่ง (เช่น อาคาร, ตึก, เลขที่บ้าน)"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search sx={{ color: "#94A3B8" }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            height: 64,
                                            borderRadius: "22px",
                                            bgcolor: "#fff",
                                        },
                                        "& fieldset": { borderColor: "#D8E2F1" },
                                        "& .MuiOutlinedInput-root:hover fieldset": { borderColor: "#C9D7EE" },
                                        "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "#2563EB" },
                                    }}
                                />
                            </Box>

                            {/* Add Stop dashed */}
                            <Box
                                sx={{
                                    border: "2px dashed #D8E2F1",
                                    borderRadius: "20px",
                                    height: 64,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 1,
                                    color: "#64748B",
                                    fontWeight: 800,
                                    cursor: "pointer",
                                    userSelect: "none",
                                    "&:hover": { bgcolor: "#F7FAFF" },
                                }}
                                onClick={() => {
                                    // TODO: add stop action
                                }}
                            >
                                <Add sx={{ color: "#64748B" }} />
                                <Typography fontWeight={800}>เพิ่มจุดส่งพัสดุ</Typography>
                            </Box>
                        </Stack>
                    </Stack>
                </Box>

            </Card>

            {/* 2. PARCEL DETAILS */}
            <Card sx={{
                p: 3,
                borderRadius: 4,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid',
                borderColor: 'divider'
            }}>
                <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
                    <Inventory2 color="primary" />
                    <Typography variant="h6" fontWeight={700}>รายละเอียดพัสดุ</Typography>
                </Stack>

                {/* Type Selection */}
                <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1, mb: 3 }} alignItems="stretch">
                    {[
                        { id: 'doc', label: 'เอกสาร', icon: Description },
                        { id: 'box', label: 'กล่อง', icon: Inventory2 },
                        { id: 'fragile', label: 'ของแตกหัก', icon: WineBar },
                        { id: 'large', label: 'ของขนาดใหญ่', icon: Apartment },
                        { id: 'food', label: 'อาหาร', icon: LocalDining },
                    ].map((item) => (
                        <Button
                            key={item.id}
                            variant={parcelType === item.id ? 'contained' : 'outlined'}
                            onClick={() => setParcelType(item.id)}
                            sx={{
                                minWidth: 100,
                                borderRadius: 3,
                                py: 1.5,
                                display: 'flex', flexDirection: 'column', gap: 1,
                                bgcolor: parcelType === item.id ? 'primary.main' : 'transparent',
                                borderColor: parcelType === item.id ? 'primary.main' : 'divider',
                                color: parcelType === item.id ? '#fff' : 'text.secondary',
                                boxShadow: parcelType === item.id ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
                                '&:hover': {
                                    bgcolor: parcelType === item.id ? 'primary.dark' : 'rgba(0,0,0,0.02)',
                                    borderColor: parcelType === item.id ? 'primary.dark' : 'text.primary'
                                }
                            }}
                        >
                            <item.icon />
                            <Typography variant="caption" fontWeight={600}>{item.label}</Typography>
                        </Button>
                    ))}
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                    {/* Size Selector */}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700} mb={1.5}>ขนาดพัสดุ (โดยประมาณ)</Typography>
                        <ToggleButtonGroup
                            value={parcelSize}
                            exclusive
                            onChange={(_, v) => v && setParcelSize(v)}
                            fullWidth
                            sx={{ gap: 1 }}
                        >
                            {['S', 'M', 'L', 'XL'].map((size) => (
                                <ToggleButton
                                    key={size}
                                    value={size}
                                    sx={{
                                        borderRadius: '12px !important',
                                        border: '1px solid !important',
                                        borderColor: 'divider',
                                        fontWeight: 700,
                                        '&.Mui-selected': { bgcolor: '#fff', borderColor: 'primary.main', color: 'primary.main', fontWeight: 800 }
                                    }}
                                >
                                    {size}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Box>

                    {/* Value Input */}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700} mb={1.5}>มูลค่าสินค้า (เพื่อประกัน)</Typography>
                        <TextField
                            fullWidth
                            value={parcelValue}
                            onChange={(e) => setParcelValue(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">฿</InputAdornment>
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                    </Box>
                </Stack>

                {/* Insurance Toggle */}
                <Box sx={{
                    mt: 3, p: 2,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: services.insurance ? 'primary.main' : 'divider',
                    bgcolor: services.insurance ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }} onClick={() => setServices({ ...services, insurance: !services.insurance })}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{
                            width: 24, height: 24, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid', borderColor: services.insurance ? 'primary.main' : 'text.disabled',
                            bgcolor: services.insurance ? 'primary.main' : 'transparent',
                            color: '#fff'
                        }}>
                            <CheckCircle sx={{ fontSize: 16, opacity: services.insurance ? 1 : 0 }} />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700}>
                                ประกันพัสดุคุ้มครองสูงสุด ฿5,000
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                แนะนำสำหรับของมีค่าหรือแตกหักง่าย
                            </Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle2" fontWeight={700}>+฿10</Typography>
                        <Box sx={{
                            width: 20, height: 20, borderRadius: 1,
                            bgcolor: services.insurance ? 'primary.main' : '#e2e8f0',
                            transition: 'all 0.2s'
                        }} />
                    </Stack>
                </Box>
            </Card>

            {/* 3. SERVICE TYPE SELECTION */}
            <Box>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>เลือกประเภทบริการ</Typography>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    {serviceTypes.map((service) => {
                        const isSelected = deliveryTab === service.tabIndex;
                        return (
                            <Card
                                key={service.id}
                                onClick={() => setDeliveryTab(service.tabIndex)}
                                sx={{
                                    flex: 1,
                                    p: 2.5,
                                    borderRadius: 4,
                                    border: '2px solid',
                                    borderColor: isSelected ? 'primary.main' : 'transparent',
                                    bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.04) : '#fff',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    overflow: 'visible',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    minHeight: 160,
                                    boxShadow: isSelected ? '0 8px 24px rgba(37, 99, 235, 0.15)' : '0 2px 8px rgba(0,0,0,0.05)'
                                }}
                            >
                                {service.id === 'express' && (
                                    <Box sx={{
                                        position: 'absolute', top: -10, left: 16,
                                        bgcolor: 'primary.main', color: '#fff',
                                        px: 1.5, py: 0.25, borderRadius: 1,
                                        fontSize: 10, fontWeight: 700
                                    }}>
                                        แนะนำ
                                    </Box>
                                )}

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box sx={{
                                        width: 40, height: 40,
                                        borderRadius: '50%',
                                        bgcolor: isSelected ? 'primary.main' : 'grey.100',
                                        color: isSelected ? '#fff' : 'text.secondary',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        mb: 2
                                    }}>
                                        <service.icon />
                                    </Box>
                                    <Typography variant="h5" fontWeight={800} color="text.primary">
                                        ฿{service.price}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.5 }}>
                                        {service.label}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.4 }}>
                                        {service.desc}
                                    </Typography>

                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <History sx={{ fontSize: 14, color: 'primary.main' }} />
                                        <Typography variant="caption" fontWeight={700} color="primary.main">
                                            {service.time}
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Card>
                        );
                    })}
                </Stack>
            </Box>
        </Box>
    );
};

export default DeliveryForm;
