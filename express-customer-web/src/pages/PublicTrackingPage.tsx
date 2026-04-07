import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Stack,
  Divider,
  Paper,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  DirectionsBike,
  Phone,
  Chat,
  Star,
  SearchOutlined,
  LocalShipping,
  CheckCircle,
  RadioButtonUnchecked,
  QrCodeScanner,
  ArrowForward,
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import type { OrderResponse } from "../types";
import { orderService } from "../services/order";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

// Status step config พร้อม labels ภาษาไทย
const STATUS_STEPS = [
  { key: "pending", label: "รับคำสั่ง", icon: RadioButtonUnchecked },
  { key: "matched", label: "จับคู่ไรเดอร์", icon: RadioButtonUnchecked },
  { key: "arrived_pickup", label: "ถึงจุดรับแล้ว", icon: LocalShipping },
  { key: "picked_up", label: "รับพัสดุแล้ว", icon: LocalShipping },
  { key: "arrived_dropoff", label: "ถึงจุดส่งแล้ว", icon: LocalShipping },
  { key: "delivered", label: "ส่งแล้ว", icon: CheckCircle },
  { key: "completed", label: "เสร็จสิ้น", icon: CheckCircle },
];

const mapLibraries: "places"[] = ["places"];

const TrackingMap = ({
  riderLat,
  riderLng,
  orderStatus,
  pickupLat,
  pickupLng,
}: {
  riderLat?: number;
  riderLng?: number;
  orderStatus?: string;
  pickupLat?: number;
  pickupLng?: number;
}) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: mapLibraries,
  });

  if (orderStatus === "pending" || !isLoaded) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          bgcolor: "#F8FAFC",
          position: "relative",
          backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          overflow: "hidden",
        }}
      >
        {/* Pickup Point pulsing animation when pending */}
        {orderStatus === "pending" && (
          <Box
            sx={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                bgcolor: "rgba(37, 99, 235, 0.15)",
                position: "absolute",
                animation:
                  "pingAnimation 2s cubic-bezier(0, 0, 0.2, 1) infinite",
                "@keyframes pingAnimation": {
                  "75%, 100%": {
                    transform: "scale(2)",
                    opacity: 0,
                  },
                },
              }}
            />
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                bgcolor: "rgba(37, 99, 235, 0.3)",
                position: "absolute",
                animation:
                  "pingAnimation 2s cubic-bezier(0, 0, 0.2, 1) infinite",
                animationDelay: "0.5s",
              }}
            />
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                bgcolor: "#2563EB",
                border: "4px solid #fff",
                boxShadow: "0 0 12px rgba(37, 99, 235, 0.4)",
                zIndex: 10,
              }}
            />
          </Box>
        )}

        {/* Moving Mock Riders */}
        {orderStatus === "pending" && (
          <>
            {[
              { top: "30%", left: "40%", delay: "0s" },
              { top: "60%", left: "70%", delay: "1s" },
              { top: "65%", left: "30%", delay: "2s" },
              { top: "35%", left: "65%", delay: "1.5s" },
            ].map((pos, i) => (
              <Box
                key={i}
                sx={{
                  position: "absolute",
                  top: pos.top,
                  left: pos.left,
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  animation: "floatRider 3s ease-in-out infinite",
                  animationDelay: pos.delay,
                  "@keyframes floatRider": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-8px)" },
                  },
                }}
              >
                <DirectionsBike sx={{ color: "#64748B", fontSize: 20 }} />
              </Box>
            ))}
          </>
        )}
      </Box>
    );
  }

  const center = {
    lat: riderLat || pickupLat || 13.7563,
    lng: riderLng || pickupLng || 100.5018,
  };

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={15}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {pickupLat && pickupLng && (
          <Marker position={{ lat: pickupLat, lng: pickupLng }} />
        )}
        {riderLat && riderLng && (
          <Marker
            position={{ lat: riderLat, lng: riderLng }}
            icon={{
              url: "https://maps.google.com/mapfiles/kml/shapes/motorcycling.png",
              scaledSize: new window.google.maps.Size(32, 32),
            }}
          />
        )}
      </GoogleMap>
    </Box>
  );
};

const FindingRiderCard = ({ onCancel }: { onCancel: () => void }) => {
  const [loadingText, setLoadingText] = useState(
    "Broadcasting delivery request...",
  );
  const statusTexts = [
    "Broadcasting delivery request...",
    "Notifying riders nearby...",
    "Waiting for a rider to accept...",
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % statusTexts.length;
      setLoadingText(statusTexts[i]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      <Typography
        variant="h5"
        fontWeight={800}
        sx={{ color: "#0F172A", mb: 0.5 }}
      >
        Finding a Rider
      </Typography>
      <Typography variant="body2" sx={{ color: "#64748B", mb: 3 }}>
        Notifying nearby riders
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {[1, 2, 3].map((dot) => (
            <Box
              key={dot}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "#2563EB",
                animation: "dotBounce 1.4s infinite ease-in-out both",
                animationDelay: `${dot * 0.16}s`,
                "@keyframes dotBounce": {
                  "0%, 80%, 100%": { transform: "scale(0)" },
                  "40%": { transform: "scale(1)" },
                },
              }}
            />
          ))}
        </Box>
        <Typography variant="body2" fontWeight={600} sx={{ color: "#2563EB" }}>
          {loadingText}
        </Typography>
      </Box>

      <Typography
        variant="caption"
        sx={{ color: "#94A3B8", display: "block", mb: 3 }}
      >
        Usually takes 10–30 seconds
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Typography
        variant="subtitle2"
        fontWeight={700}
        sx={{ mb: 2, color: "#334155" }}
      >
        Riders nearby
      </Typography>
      <Stack spacing={1.5} sx={{ mb: 4 }}>
        {[
          { name: "Somchai", dist: "0.8 km" },
          { name: "Anan", dist: "1.2 km" },
          { name: "Suda", dist: "1.5 km" },
        ].map((rider) => (
          <Box
            key={rider.name}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: "#F1F5F9" }}>
                <DirectionsBike sx={{ fontSize: 16, color: "#64748B" }} />
              </Avatar>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ color: "#1E293B" }}
              >
                {rider.name}
              </Typography>
            </Box>
            <Typography
              variant="caption"
              fontWeight={600}
              sx={{ color: "#64748B" }}
            >
              {rider.dist}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Button
        variant="outlined"
        fullWidth
        color="error"
        onClick={onCancel}
        sx={{
          borderRadius: 2,
          py: 1.5,
          fontWeight: 700,
          textTransform: "none",
          borderColor: "#FDA4AF",
          color: "#E11D48",
          boxShadow: "none",
          "&:hover": {
            bgcolor: "#FFF1F2",
            borderColor: "#F43F5E",
            boxShadow: "none",
          },
        }}
      >
        Cancel Request
      </Button>
    </Box>
  );
};

// หน้า search ก่อนที่จะค้นหา
const SearchSection = ({
  trackingNo,
  setTrackingNo,
  onSearch,
  loading,
  error,
}: {
  trackingNo: string;
  setTrackingNo: (v: string) => void;
  onSearch: () => void;
  loading: boolean;
  error: string | null;
}) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        px: 2,
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "24px",
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <QrCodeScanner sx={{ fontSize: 40, color: "primary.main" }} />
      </Box>

      <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
        ติดตามพัสดุ
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        textAlign="center"
        sx={{ mb: 4, maxWidth: 400 }}
      >
        กรอกหมายเลขพัสดุ (Tracking No.) เพื่อตรวจสอบสถานะการจัดส่งแบบเรียลไทม์
      </Typography>

      {/* Search Input */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ width: "100%", maxWidth: 520 }}
      >
        <TextField
          fullWidth
          placeholder="เช่น ORD-XXXXXX หรือ EX-XXXXXXXXXX"
          value={trackingNo}
          onChange={(e) => setTrackingNo(e.target.value.trim())}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          error={!!error}
          helperText={error || ""}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined color="action" />
              </InputAdornment>
            ),
            sx: {
              borderRadius: "12px",
              height: 52,
              bgcolor: "background.paper",
              fontSize: "0.95rem",
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: "primary.main",
                borderWidth: 2,
              },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={onSearch}
          disabled={loading || !trackingNo}
          endIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <ArrowForward />
            )
          }
          sx={{
            minWidth: 130,
            height: 52,
            borderRadius: "12px",
            fontWeight: 700,
            textTransform: "none",
            fontSize: "1rem",
            whiteSpace: "nowrap",
            px: 3,
            boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
          }}
        >
          {loading ? "กำลังค้นหา..." : "ค้นหา"}
        </Button>
      </Stack>

      {/* ตัวอย่าง */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 3 }}>
        <Typography variant="caption" color="text.secondary">
          ตัวอย่าง:
        </Typography>
        {["ORD-DEMO", "EX-1234567890"].map((ex) => (
          <Chip
            key={ex}
            label={ex}
            size="small"
            variant="outlined"
            onClick={() => setTrackingNo(ex)}
            sx={{
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: "0.75rem",
              "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

// หน้าแสดงผลหลังค้นหาเจอ
const TrackingResult = ({
  order,
  onReset,
}: {
  order: OrderResponse;
  onReset: () => void;
}) => {
  const theme = useTheme();
  const activeStep = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* TOP BAR: tracking no + status steps */}
      <Paper
        square
        elevation={0}
        sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ maxWidth: 900, mx: "auto", width: "100%", mb: 2 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              หมายเลขพัสดุ:
            </Typography>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              fontFamily="monospace"
              sx={{ color: "primary.main", letterSpacing: 1 }}
            >
              {order.order_number}
            </Typography>
          </Stack>
          <Button
            size="small"
            variant="outlined"
            onClick={onReset}
            startIcon={<SearchOutlined />}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8rem",
            }}
          >
            ค้นหาใหม่
          </Button>
        </Stack>

        {/* Status Steps */}
        <Stack
          direction="row"
          alignItems="flex-start"
          spacing={0}
          sx={{ maxWidth: 900, mx: "auto", width: "100%" }}
        >
          {STATUS_STEPS.map((step, index) => {
            const isCompleted = index <= activeStep;
            const isActive = index === activeStep;
            return (
              <Box
                key={step.key}
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {/* connector line + dot */}
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{ width: "100%", mb: 1 }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      height: 3,
                      bgcolor:
                        index === 0
                          ? "transparent"
                          : isCompleted
                            ? "primary.main"
                            : "divider",
                      borderRadius: 2,
                    }}
                  />
                  <Box
                    sx={{
                      width: isActive ? 14 : 10,
                      height: isActive ? 14 : 10,
                      borderRadius: "50%",
                      bgcolor: isCompleted ? "primary.main" : "divider",
                      border: isActive
                        ? `3px solid ${theme.palette.primary.main}`
                        : "none",
                      outline: isActive
                        ? `3px solid ${alpha(theme.palette.primary.main, 0.25)}`
                        : "none",
                      transition: "all 0.2s",
                      flexShrink: 0,
                    }}
                  />
                  <Box
                    sx={{
                      flex: 1,
                      height: 3,
                      bgcolor:
                        index === STATUS_STEPS.length - 1
                          ? "transparent"
                          : index < activeStep
                            ? "primary.main"
                            : "divider",
                      borderRadius: 2,
                    }}
                  />
                </Stack>
                <Typography
                  variant="caption"
                  fontWeight={isActive ? 700 : 500}
                  textAlign="center"
                  sx={{
                    color: isCompleted ? "primary.main" : "text.disabled",
                    fontSize: "0.7rem",
                    lineHeight: 1.3,
                  }}
                >
                  {step.label}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Paper>

      {/* MAP + RIDER CARD */}
      <Box sx={{ flexGrow: 1, position: "relative" }}>
        <TrackingMap
          riderLat={order.rider_lat}
          riderLng={order.rider_lng}
          orderStatus={order.status}
          pickupLat={order.pickup_address?.lat}
          pickupLng={order.pickup_address?.lng}
        />

        {/* RIDER CARD OVERLAY OR COMPLETION OVERLAY */}
        <Paper
          elevation={6}
          sx={{
            position: "absolute",
            bottom: 30,
            left: 30,
            right: { xs: 30, md: "auto" },
            maxWidth: 400,
            p: 3,
            borderRadius: 4,
            bgcolor: alpha(theme.palette.background.paper, 0.97),
            backdropFilter: "blur(10px)",
          }}
        >
          {order.status === "completed" ? (
            <Box textAlign="center">
              <Stack direction="row" justifyContent="center" mb={1}>
                <CheckCircle sx={{ fontSize: 48, color: "success.main" }} />
              </Stack>
              <Typography
                variant="h5"
                fontWeight={800}
                color="success.main"
                gutterBottom
              >
                จัดส่งสำเร็จ
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                เวลาจัดส่ง:{" "}
                {new Date().toLocaleTimeString("th-TH", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>

              <Box
                sx={{
                  width: "100%",
                  height: 140,
                  bgcolor: "grey.200",
                  borderRadius: 2,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {order.delivery_photo_url ? (
                  <img
                    src={order.delivery_photo_url}
                    alt="Proof of delivery"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    รูปภาพหลักฐานการจัดส่ง
                  </Typography>
                )}
              </Box>

              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                ให้คะแนนการจัดส่ง
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center" mb={2}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    sx={{
                      color: "warning.main",
                      fontSize: 28,
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Stack>
              <Button
                variant="contained"
                fullWidth
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                ส่งคะแนน
              </Button>
            </Box>
          ) : order.status === "pending" ? (
            <FindingRiderCard onCancel={() => (window.location.href = "/")} />
          ) : (
            <>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Avatar
                  sx={{ width: 64, height: 64, bgcolor: "grey.300" }}
                  src="https://via.placeholder.com/150"
                />
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Somchai P.
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Star fontSize="small" color="warning" />
                    <Typography variant="body2" fontWeight={600}>
                      4.9 (120 งาน)
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Honda Wave 110i • 1กก-9999
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Stack spacing={1}>
                  <IconButton
                    color="primary"
                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                  >
                    <Phone />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}
                  >
                    <Chat />
                  </IconButton>
                </Stack>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    ถึงโดยประมาณ
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    color="primary.main"
                  >
                    14:35
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    ระยะทาง
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    2.5 กม.
                  </Typography>
                </Box>
              </Stack>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

// ============================
// Main Component
// ============================
const PublicTrackingPage = () => {
  const [trackingNo, setTrackingNo] = useState(() => {
    return new URLSearchParams(window.location.search).get("tracking_no") || "";
  });
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!trackingNo) return;
    setError(null);
    setLoading(true);
    try {
      // Demo mode: ถ้าพิมพ์ ORD-DEMO จะแสดง mock data
      if (trackingNo === "ORD-DEMO" || trackingNo === "EX-1234567890") {
        await new Promise((r) => setTimeout(r, 800)); // simulate delay
        setOrder({
          id: "123",
          order_number: trackingNo,
          status: "matched",
          base_price: 100,
          distance_price: 50,
          add_ons_price: 0,
          total_price: 150,
          estimated_duration: 15,
          created_at: new Date().toISOString(),
          rider_lat: 13.75,
          rider_lng: 100.5,
        } as OrderResponse);
      } else {
        // Fetch actual order using the trackingNo which is the order id
        const result = await orderService.getById(trackingNo);
        setOrder(result);
      }
    } catch (e: any) {
      setError(e.message || "ค้นหาไม่สำเร็จ กรุณาตรวจสอบหมายเลขพัสดุ");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackingNo) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!order?.id) return;
    const ws = new WebSocket("ws://localhost:8083/ws");
    ws.onopen = () => console.log("Tracking WS Connected");
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.order_id === order.id) {
          if (data.type === "LOCATION_UPDATE") {
            setOrder((prev) =>
              prev
                ? { ...prev, rider_lat: data.lat, rider_lng: data.lng }
                : null,
            );
          } else {
            // Re-fetch the order to get the latest status
            orderService
              .getById(order.id)
              .then((newOrder) => {
                setOrder((prev) => {
                  if (!prev) return newOrder;
                  return {
                    ...newOrder,
                    rider_lat: prev.rider_lat,
                    rider_lng: prev.rider_lng,
                  };
                });
              })
              .catch(console.error);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    return () => ws.close();
  }, [order?.id]);

  const handleReset = () => {
    setOrder(null);
    setTrackingNo("");
    setError(null);
  };

  // แสดงผลสถานะหลังค้นหา
  if (order) {
    return (
      <Box
        sx={{
          height: "calc(100vh - 80px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TrackingResult order={order} onReset={handleReset} />
      </Box>
    );
  }

  // หน้า search
  return (
    <SearchSection
      trackingNo={trackingNo}
      setTrackingNo={setTrackingNo}
      onSearch={handleSearch}
      loading={loading}
      error={error}
    />
  );
};

export default PublicTrackingPage;
