import React, { useState } from 'react';
import {
    AppBar, Toolbar, Typography, Button, Container, Box, IconButton,
    Stack, Avatar, useTheme, Menu, MenuItem, ListItemIcon, Divider
} from '@mui/material';
import {
    HelpOutline, DarkMode, LightMode,
    Login, Logout, Person, Settings,
    Inventory2,
    Send,
    Place,
    History,
    Apple,
    Android
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

interface MainLayoutProps {
    children: React.ReactNode;
    mode: 'light' | 'dark';
    setMode: (mode: 'light' | 'dark') => void;
    token: string | null;
    onLogout: () => void;
    onLoginClick: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, mode, setMode, token, onLogout, onLoginClick }) => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>

            {/* HEADER */}
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: mode === 'light' ? '#ffffff' : '#0B1120', // Specific Dark Navy from image
                    borderBottom: '1px solid',
                    borderColor: mode === 'light' ? 'grey.200' : 'rgba(255,255,255,0.1)',
                    height: 72,
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    padding: '0 96px'
                }}
            >
                <Container>
                    <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>

                        {/* LEFT: LOGO */}
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ cursor: 'pointer' }}>
                            <Box
                                sx={{
                                    width: 40, height: 40,
                                    borderRadius: '12px',
                                    bgcolor: '#2563EB', // Bright Blue
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
                                }}
                            >
                                <Inventory2 sx={{ fontSize: 24, color: '#fff' }} />
                            </Box>
                            <Typography variant="h6" sx={{
                                fontWeight: 800,
                                fontSize: '1.25rem',
                                color: mode === 'light' ? '#1e293b' : '#f8fafc',
                                letterSpacing: 0.5
                            }}>
                                EXPRESS.IO
                            </Typography>
                        </Stack>

                        {/* CENTER: NAV ITEMS */}
                        <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
                            {[
                                { label: 'ส่งพัสดุ', icon: Send, active: true },
                                { label: 'ติดตาม', icon: Place, active: false },
                                { label: 'ประวัติ', icon: History, active: false },
                                { label: 'ช่วยเหลือ', icon: HelpOutline, active: false }
                            ].map((item) => (
                                <Button
                                    key={item.label}
                                    startIcon={<item.icon sx={{ fontSize: 20 }} />}
                                    variant="text"
                                    sx={{
                                        px: 2,
                                        py: 1,
                                        textTransform: 'none',
                                        fontSize: 15,
                                        fontWeight: 600,
                                        color: item.active
                                            ? (mode === 'light' ? 'primary.main' : 'primary.light')
                                            : (mode === 'light' ? 'text.secondary' : 'grey.400'),
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                                            color: 'primary.main'
                                        }
                                    }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </Stack>

                        {/* RIGHT: ACTIONS */}
                        <Stack direction="row" alignItems="center" spacing={2.5}>
                            {/* Theme Toggle */}
                            <IconButton
                                onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
                                sx={{
                                    color: mode === 'light' ? 'text.secondary' : 'grey.400',
                                    bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    '&:hover': { bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)' }
                                }}
                            >
                                {mode === 'light' ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
                            </IconButton>

                            {/* Vertical Divider */}
                            <Box sx={{ width: 1, height: 24, bgcolor: mode === 'light' ? 'grey.300' : 'rgba(255,255,255,0.2)' }} />

                            {/* User Profile */}
                            {token ? (
                                <>
                                    <Box
                                        onClick={handleMenu}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            pl: 2, pr: 0.5, py: 0.5,
                                            borderRadius: 50,
                                            bgcolor: mode === 'light' ? '#F1F5F9' : 'rgba(255,255,255,0.1)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': { bgcolor: mode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.2)' }
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: mode === 'light' ? '#334155' : '#fff' }}>
                                            K.Somchai
                                        </Typography>
                                        <Avatar sx={{
                                            width: 32, height: 32,
                                            bgcolor: mode === 'light' ? '#fff' : 'rgba(255,255,255,0.2)',
                                            color: mode === 'light' ? 'primary.main' : '#fff'
                                        }}>
                                            <Person fontSize="small" />
                                        </Avatar>
                                    </Box>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleClose}
                                        onClick={handleClose}
                                        PaperProps={{
                                            elevation: 0,
                                            sx: {
                                                overflow: 'visible',
                                                filter: 'drop-shadow(0px 10px 30px rgba(0,0,0,0.1))',
                                                mt: 2,
                                                borderRadius: 3,
                                                minWidth: 180,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                            },
                                        }}
                                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                    >
                                        <MenuItem sx={{ py: 1.5, fontWeight: 600 }}>
                                            <ListItemIcon><Person fontSize="small" /></ListItemIcon> Profile
                                        </MenuItem>
                                        <MenuItem sx={{ py: 1.5, fontWeight: 600 }}>
                                            <ListItemIcon><Settings fontSize="small" /></ListItemIcon> Settings
                                        </MenuItem>
                                        <Divider />
                                        <MenuItem onClick={onLogout} sx={{ py: 1.5, fontWeight: 600, color: 'error.main' }}>
                                            <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon> Logout
                                        </MenuItem>
                                    </Menu>
                                </>
                            ) : (
                                <Button variant="contained" onClick={onLoginClick} startIcon={<Login />}>Sign In</Button>
                            )}
                        </Stack>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* CONTENT */}
            <Box sx={{ flexGrow: 1, py: 4, px: '96px' }}>
                <Container maxWidth="xl">
                    {children}
                </Container>
            </Box>

            {/* FOOTER */}
            <Box sx={{
                bgcolor: mode === 'light' ? '#FFFFFF' : '#0B1120',
                borderTop: '1px solid',
                borderColor: mode === 'light' ? 'divider' : 'rgba(255,255,255,0.1)',
                pt: 8,
                pb: 4,
                mt: 'auto',
                px: '96px'

            }}>
                <Container maxWidth="xl">
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="space-between">
                        {/* Brand Column */}
                        <Box sx={{ maxWidth: 320 }}>
                            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                                <Box
                                    sx={{
                                        width: 40, height: 40,
                                        borderRadius: '8px',
                                        bgcolor: '#2563EB',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <Inventory2 sx={{ fontSize: 24, color: '#fff' }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.25rem', color: mode === 'light' ? '#0F172A' : '#F8FAFC' }}>
                                    EXPRESS.IO
                                </Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '0.875rem' }}>
                                บริการส่งพัสดุด่วนที่ทันสมัยที่สุด เพื่อธุรกิจและบุคคลทั่วไป ครอบคลุมทั่วไทย ด้วยเทคโนโลยีการติดตามแบบเรียลไทม์
                            </Typography>
                        </Box>

                        {/* Links Columns */}
                        <Stack direction="row" spacing={{ xs: 4, md: 8 }} flexWrap="wrap">
                            {/* Service Column */}
                            <Stack spacing={2.5}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '1rem', color: mode === 'light' ? '#0F172A' : '#F8FAFC' }}>
                                    บริการของเรา
                                </Typography>
                                <Stack spacing={1.5}>
                                    {['Express Delivery', 'Same-day Delivery', 'Bulk Logistics', 'Custom Solutions'].map((item) => (
                                        <Typography key={item} variant="body2" sx={{ cursor: 'pointer', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                                            {item}
                                        </Typography>
                                    ))}
                                </Stack>
                            </Stack>

                            {/* Help Column */}
                            <Stack spacing={2.5}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '1rem', color: mode === 'light' ? '#0F172A' : '#F8FAFC' }}>
                                    ช่วยเหลือ
                                </Typography>
                                <Stack spacing={1.5}>
                                    {['ศูนย์ช่วยเหลือ', 'เงื่อนไขการบริการ', 'นโยบายความเป็นส่วนตัว', 'ติดต่อเรา'].map((item) => (
                                        <Typography key={item} variant="body2" sx={{ cursor: 'pointer', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                                            {item}
                                        </Typography>
                                    ))}
                                </Stack>
                            </Stack>
                        </Stack>

                        {/* Download App Column */}
                        <Stack spacing={2.5}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '1rem', color: mode === 'light' ? '#0F172A' : '#F8FAFC' }}>
                                ดาวน์โหลดแอป
                            </Typography>
                            <Stack spacing={1.5}>
                                <Button
                                    variant="contained"
                                    startIcon={<Apple />}
                                    sx={{
                                        bgcolor: '#1E293B',
                                        color: '#fff',
                                        textTransform: 'none',
                                        justifyContent: 'flex-start',
                                        px: 2.5,
                                        py: 1,
                                        borderRadius: 2,
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        '&:hover': { bgcolor: '#0F172A' }
                                    }}
                                >
                                    App Store
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<Android />}
                                    sx={{
                                        bgcolor: '#1E293B',
                                        color: '#fff',
                                        textTransform: 'none',
                                        justifyContent: 'flex-start',
                                        px: 2.5,
                                        py: 1,
                                        borderRadius: 2,
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        '&:hover': { bgcolor: '#0F172A' }
                                    }}
                                >
                                    Google Play
                                </Button>
                            </Stack>
                        </Stack>
                    </Stack>

                    <Divider sx={{ my: 6, borderColor: mode === 'light' ? 'grey.200' : 'rgba(255,255,255,0.1)' }} />

                    <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
                        © 2026 EXPRESS.IO Express Logistics. All rights reserved.
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default MainLayout;
