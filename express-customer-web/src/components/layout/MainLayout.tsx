import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Stack,
  Avatar,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import {
  HelpOutline,
  DarkMode,
  LightMode,
  Login,
  Logout,
  Person,
  Settings,
  Inventory2,
  Send,
  Place,
  History,
  Apple,
  Android,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

interface MainLayoutProps {
  children: React.ReactNode;
  mode: "light" | "dark";
  setMode: (mode: "light" | "dark") => void;
  token: string | null;
  onLogout: () => void;
  onLoginClick: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  mode,
  setMode,
  token,
  onLogout,
  onLoginClick,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const navItems = [
    { label: "ส่งพัสดุ", icon: Send, path: "/", show: true },
    { label: "ติดตาม", icon: Place, path: "/tracking", show: true },
    { label: "ประวัติ", icon: History, path: "/orders", show: !!token },
    { label: "ช่วยเหลือ", icon: HelpOutline, path: "/help", show: true },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {/* HEADER */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: mode === "light" ? "#ffffff" : "#0B1120", // Specific Dark Navy from image
          borderBottom: "1px solid",
          borderColor: mode === "light" ? "grey.200" : "rgba(255,255,255,0.1)",
          height: 72,
          justifyContent: "center",
          transition: "all 0.3s ease",
          padding: { xs: 0, lg: "0 96px" },
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
            {/* LEFT: LOGO */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ cursor: "pointer" }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  bgcolor: "#2563EB", // Bright Blue
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
                }}
              >
                <Inventory2 sx={{ fontSize: 24, color: "#fff" }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                  color: mode === "light" ? "#1e293b" : "#f8fafc",
                  letterSpacing: 0.5,
                  display: { xs: "none", sm: "block" },
                }}
              >
                EXPRESS.IO
              </Typography>

              <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", ml: 4 }}>
                {navItems.map(
                  (item) =>
                    item.show &&
                    (() => {
                      const isActive =
                        item.path === "/"
                          ? location.pathname === "/"
                          : location.pathname.startsWith(item.path);
                      return (
                        <Button
                          key={item.label}
                          startIcon={<item.icon sx={{ fontSize: 20 }} />}
                          variant="text"
                          onClick={() => navigate(item.path)}
                          sx={{
                            px: 2,
                            py: 1,
                          textTransform: "none",
                          fontSize: 15,
                          fontWeight: 600,
                          color: isActive
                            ? mode === "light"
                              ? "primary.main"
                              : "primary.light"
                            : mode === "light"
                              ? "text.secondary"
                              : "grey.400",
                          borderBottom: isActive
                            ? "2px solid"
                            : "2px solid transparent",
                          borderRadius: 0,
                          borderColor: isActive
                            ? "primary.main"
                            : "transparent",
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: "primary.main",
                          },
                        }}
                      >
                        {item.label}
                      </Button>
                    );
                  })(),
                )}
              </Box>
            </Stack>

            {/* RIGHT: ACTIONS */}
            <Stack direction="row" alignItems="center" spacing={2.5}>
              {/* Theme Toggle */}
              <IconButton
                onClick={() => setMode(mode === "light" ? "dark" : "light")}
                sx={{
                  color: mode === "light" ? "text.secondary" : "grey.400",
                  bgcolor:
                    mode === "dark" ? "rgba(255,255,255,0.1)" : "transparent",
                  "&:hover": {
                    bgcolor:
                      mode === "dark"
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(0,0,0,0.05)",
                  },
                }}
              >
                {mode === "light" ? (
                  <DarkMode fontSize="small" />
                ) : (
                  <LightMode fontSize="small" />
                )}
              </IconButton>

              {/* Vertical Divider */}
              {/* <Box sx={{ width: 1, height: 24, bgcolor: mode === 'light' ? 'grey.300' : 'rgba(255,255,255,0.2)' }} /> */}

              {/* User Profile */}
              {token ? (
                <>
                  <Box
                    onClick={handleMenu}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      pl: 2,
                      pr: 0.5,
                      py: 0.5,
                      borderRadius: 50,
                      bgcolor:
                        mode === "light" ? "#F1F5F9" : "rgba(255,255,255,0.1)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor:
                          mode === "light"
                            ? "#E2E8F0"
                            : "rgba(255,255,255,0.2)",
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: mode === "light" ? "#334155" : "#fff",
                        display: { xs: "none", sm: "block" },
                      }}
                    >
                      K.Somchai
                    </Typography>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor:
                          mode === "light" ? "#fff" : "rgba(255,255,255,0.2)",
                        color: mode === "light" ? "primary.main" : "#fff",
                      }}
                    >
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
                        overflow: "visible",
                        filter: "drop-shadow(0px 10px 30px rgba(0,0,0,0.1))",
                        mt: 2,
                        borderRadius: 3,
                        minWidth: 180,
                        border: "1px solid",
                        borderColor: "divider",
                      },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    <MenuItem sx={{ py: 1.5, fontWeight: 600 }}>
                      <ListItemIcon>
                        <Person fontSize="small" />
                      </ListItemIcon>{" "}
                      Profile
                    </MenuItem>
                    <MenuItem sx={{ py: 1.5, fontWeight: 600 }}>
                      <ListItemIcon>
                        <Settings fontSize="small" />
                      </ListItemIcon>{" "}
                      Settings
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={onLogout}
                      sx={{ py: 1.5, fontWeight: 600, color: "error.main" }}
                    >
                      <ListItemIcon>
                        <Logout fontSize="small" color="error" />
                      </ListItemIcon>{" "}
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    onClick={onLoginClick}
                    startIcon={<Login />}
                    sx={{
                      borderRadius: "8px",
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      textTransform: "none",
                    }}
                  >
                    Sign In
                  </Button>

                  {/* <Button
                    variant="contained"
                    onClick={onRegisterClick}
                    startIcon={<PersonAdd />}
                    sx={{
                      borderRadius: "8px",
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      textTransform: "none",
                    }}
                  >
                    Sign Up
                  </Button> */}
                </>
              )}
            </Stack>

            {/* Mobile Nav Toggle */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ display: { md: "none" }, ml: 1, color: mode === "light" ? "text.primary" : "text.secondary" }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        PaperProps={{
          sx: {
            width: 250,
            bgcolor: mode === "light" ? "#ffffff" : "#0B1120",
          },
        }}
      >
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                bgcolor: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Inventory2 sx={{ fontSize: 18, color: "#fff" }} />
            </Box>
            <Typography variant="subtitle1" fontWeight={800} color={mode === "light" ? "#1e293b" : "#f8fafc"}>
              EXPRESS.IO
            </Typography>
          </Stack>
        </Box>
        <Divider />
        <List>
          {navItems.map((item) => {
            if (!item.show) return null;
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            
            return (
              <ListItem key={item.label} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    handleDrawerToggle();
                  }}
                  sx={{
                    color: isActive
                      ? "primary.main"
                      : mode === "light"
                      ? "text.primary"
                      : "text.secondary",
                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                  }}
                >
                  <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isActive ? 700 : 500 }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* CONTENT */}
      <Box sx={{ flexGrow: 1, py: { xs: 2, md: 4 }, px: { xs: 2, lg: "116px" } }}>
        <Container maxWidth="xl">{children}</Container>
      </Box>

      {/* FOOTER */}
      <Box
        sx={{
          bgcolor: mode === "light" ? "#FFFFFF" : "#0B1120",
          borderTop: "1px solid",
          borderColor: mode === "light" ? "divider" : "rgba(255,255,255,0.1)",
          pt: { xs: 4, md: 8 },
          pb: 4,
          mt: "auto",
          px: { xs: 2, lg: "96px" },
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            justifyContent="space-between"
          >
            {/* Brand Column */}
            <Box sx={{ maxWidth: 320 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{ mb: 2.5 }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "8px",
                    bgcolor: "#2563EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Inventory2 sx={{ fontSize: 24, color: "#fff" }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    fontSize: "1.25rem",
                    color: mode === "light" ? "#0F172A" : "#F8FAFC",
                  }}
                >
                  EXPRESS.IO
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.8,
                  fontSize: "0.875rem",
                }}
              >
                บริการส่งพัสดุด่วนที่ทันสมัยที่สุด เพื่อธุรกิจและบุคคลทั่วไป
                ครอบคลุมทั่วไทย ด้วยเทคโนโลยีการติดตามแบบเรียลไทม์
              </Typography>
            </Box>

            {/* Links Columns */}
            <Stack direction="row" spacing={{ xs: 4, md: 8 }} flexWrap="wrap">
              {/* Service Column */}
              <Stack spacing={2.5}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: mode === "light" ? "#0F172A" : "#F8FAFC",
                  }}
                >
                  บริการของเรา
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    "Express Delivery",
                    "Same-day Delivery",
                    "Bulk Logistics",
                    "Custom Solutions",
                  ].map((item) => (
                    <Typography
                      key={item}
                      variant="body2"
                      sx={{
                        cursor: "pointer",
                        color: "text.secondary",
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      {item}
                    </Typography>
                  ))}
                </Stack>
              </Stack>

              {/* Help Column */}
              <Stack spacing={2.5}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: mode === "light" ? "#0F172A" : "#F8FAFC",
                  }}
                >
                  ช่วยเหลือ
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    "ศูนย์ช่วยเหลือ",
                    "เงื่อนไขการบริการ",
                    "นโยบายความเป็นส่วนตัว",
                    "ติดต่อเรา",
                  ].map((item) => (
                    <Typography
                      key={item}
                      variant="body2"
                      sx={{
                        cursor: "pointer",
                        color: "text.secondary",
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      {item}
                    </Typography>
                  ))}
                </Stack>
              </Stack>
            </Stack>

            {/* Download App Column */}
            <Stack spacing={2.5}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: mode === "light" ? "#0F172A" : "#F8FAFC",
                }}
              >
                ดาวน์โหลดแอป
              </Typography>
              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  startIcon={<Apple />}
                  sx={{
                    bgcolor: "#1E293B",
                    color: "#fff",
                    textTransform: "none",
                    justifyContent: "flex-start",
                    px: 2.5,
                    py: 1,
                    borderRadius: 2,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    "&:hover": { bgcolor: "#0F172A" },
                  }}
                >
                  App Store
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Android />}
                  sx={{
                    bgcolor: "#1E293B",
                    color: "#fff",
                    textTransform: "none",
                    justifyContent: "flex-start",
                    px: 2.5,
                    py: 1,
                    borderRadius: 2,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    "&:hover": { bgcolor: "#0F172A" },
                  }}
                >
                  Google Play
                </Button>
              </Stack>
            </Stack>
          </Stack>

          <Divider
            sx={{
              my: 6,
              borderColor:
                mode === "light" ? "grey.200" : "rgba(255,255,255,0.1)",
            }}
          />

          <Typography
            variant="body2"
            align="center"
            sx={{ color: "text.secondary" }}
          >
            © 2026 EXPRESS.IO Express Logistics. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
