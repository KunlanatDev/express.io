import React, { useState } from "react";
import Map from "../google/Map";
import {
  Box,
  Typography,
  Card,
  Button,
  Divider,
  Stack,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  InfoOutlined,
  ArrowForward,
  Lock,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import type { OrderResponse, AddressInfo } from "../../types";

interface OrderSummaryProps {
  token: string | null;
  orderResult: OrderResponse | null;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  pickup: AddressInfo;
  deliveries: AddressInfo[];
  vehicleType: string;
  pricingData?: any;
  selectedServiceTab?: number;
  promoCode?: string;
  setPromoCode?: (code: string) => void;
  onRouteCalculated?: (distanceKm: number, durationMins: number) => void;
  onApplyPromo?: () => void;
  mapDistance?: number;
  mapDurationMins?: number;
  onConfirmPayment?: (id: string) => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  token,
  orderResult,
  loading,
  onConfirm,
  onCancel,
  pickup,
  deliveries,
  vehicleType,
  pricingData,
  selectedServiceTab,
  promoCode,
  setPromoCode,
  onRouteCalculated,
  onApplyPromo,
  mapDistance,
  mapDurationMins,
  onConfirmPayment,
}) => {
  // Map tab index -> service key
  const serviceKeys = ["express", "sameday", "intercity"];

  const handleConfirmPayment = (id: string) => {
      if (onConfirmPayment) {
          onConfirmPayment(id);
      }
  };
  const activeServiceKey = serviceKeys[selectedServiceTab ?? 0];
  // Find the matching service from pricing data
  const activeService =
    pricingData?.services?.find(
      (s: any) => s.service_type === activeServiceKey,
    ) ??
    pricingData?.services?.[selectedServiceTab ?? 0] ??
    null;

  // ตรวจว่าผู้ใช้เลือกที่อยู่จัดส่งแล้วหรือยัง
  const hasDestination = deliveries.some(
    (d) => d.address && d.address.trim() !== "" && (d.lat !== 0 || d.lng !== 0),
  );

  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setPromoApplied(false);
    setPromoError("");
    try {
      const API =
        import.meta.env.VITE_EXPRESS_SERVICE_URL ||
        "http://localhost:8082/api/v1";
      const res = await fetch(
        `${API}/promos/check/${encodeURIComponent(promoCode)}`,
      );
      if (res.ok) {
        setPromoApplied(true);
        setPromoError("");
        if (onApplyPromo) onApplyPromo();
      } else {
        setPromoApplied(false);
        setPromoError("โค้ดไม่ถูกต้องหรือหมดอายุการใช้งานแล้ว");
      }
    } catch {
      setPromoError("สอบสถานะไม่ได้ ลองใหม่อีกครั้ง");
    }
  };
  // Helper to format currency
  const formatPrice = (price: number) => {
    return `฿${price}`;
  };

  // Format ETA from minutes (from Google Maps)
  const formatETA = (mins: number): string => {
    if (mins <= 0) return "";
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    if (h === 0) return `${m} นาที`;
    if (m === 0) return `${h} ชั่วโมง`;
    return `${h} ชั่วโมง ${m} นาที`;
  };

  return (
    <Stack spacing={3} sx={{ height: "100%" }}>
      {/* MAP AREA */}
      <Card
        sx={{
          flexGrow: 1,
          maxHeight: "50vh",
          position: "relative",
          overflow: "hidden",
          borderRadius: "24px",
          bgcolor: "#283042", // Dark Navy/Slate from image
          boxShadow: "none",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Map
          pickup={pickup}
          deliveries={deliveries}
          vehicleType={vehicleType}
          onRouteCalculated={onRouteCalculated}
        />
        {/* Visual Curve */}
        {/* <Box sx={{ position: "absolute", inset: 0, opacity: 0.8 }}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 300"
            preserveAspectRatio="none"
          >
            <path
              d="M -20 320 Q 200 50 420 320"
              stroke="#3B82F6"
              strokeWidth="3"
              fill="none"
              strokeDasharray="8 8"
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))" }}
            />
          </svg>
        </Box> */}

        {/* Start Pin Indicator (Ghost) */}
        {/* <Box
          sx={{
            position: "absolute",
            bottom: "15%",
            left: "20%",
            width: 40,
            height: 12,
            bgcolor: "rgba(0,0,0,0.2)",
            borderRadius: "50%",
            filter: "blur(4px)",
          }}
        /> */}

        {/* Pin Icon */}
        {/* <Box
          sx={{
            position: "absolute",
            top: "40%", // Approximate top of curve
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: "rgba(59, 130, 246, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "pulse 2s infinite",
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                bgcolor: "#3B82F6",
                border: "3px solid #fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
              }}
            >
              <Place sx={{ fontSize: 20, color: "#fff" }} />
            </Box>
          </Box>
        </Box> */}

        {/* Decoration Element */}
        {/* <Box
          sx={{
            position: "absolute",
            bottom: 40,
            left: 40,
            width: 60,
            height: 24,
            bgcolor: "#1e293b",
            borderRadius: 2,
          }}
        /> */}
      </Card>

      {/* SUMMARY CARD */}
      <Card
        sx={{
          borderRadius: "24px",
          p: { xs: 2.5, md: 3 },
          boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Header: Price & Time */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 0.5, fontWeight: 500 }}
            >
              ราคาโดยประมาณ
            </Typography>
            {!hasDestination ? (
              /* ยังไม่ได้เลือกที่อยู่จัดส่ง */
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: "text.disabled",
                  fontSize: "2rem",
                }}
              >
                —
              </Typography>
            ) : (
              <Stack direction="row" alignItems="baseline" spacing={1.5}>
                {token ? (
                  <>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        color: "#2563EB",
                        fontSize: "2.5rem",
                        letterSpacing: -1,
                      }}
                    >
                      {formatPrice(
                        orderResult
                          ? orderResult.total_price
                          : activeService
                            ? activeService.total_price
                            : pricingData
                              ? pricingData.total_price
                              : 0,
                      )}
                    </Typography>
                    {/* Show original price (before discount) only when a promo is applied */}
                    {((pricingData?.promo_discount ?? 0) > 0 ||
                      (orderResult?.promo_discount ?? 0) > 0) && (
                      <Typography
                        variant="h6"
                        sx={{
                          textDecoration: "line-through",
                          color: "#94a3b8",
                          fontWeight: 500,
                        }}
                      >
                        {formatPrice(
                          orderResult
                            ? orderResult.total_price +
                                (orderResult.promo_discount || 0)
                            : activeService
                              ? activeService.total_price +
                                (pricingData.promo_discount || 0)
                              : pricingData
                                ? pricingData.total_price +
                                  (pricingData.promo_discount || 0)
                                : 0,
                        )}
                      </Typography>
                    )}
                  </>
                ) : (
                  <Box sx={{ position: "relative", display: "inline-block" }}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        color: "#2563EB",
                        fontSize: "2.5rem",
                        letterSpacing: -1,
                        filter: "blur(8px)",
                        opacity: 0.5,
                        userSelect: "none",
                      }}
                    >
                      ฿99.00
                    </Typography>
                    <Lock
                      sx={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "#64748B",
                        fontSize: 28,
                      }}
                    />
                  </Box>
                )}
              </Stack>
            )}
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 0.5, fontWeight: 500 }}
            >
              ถึงผู้รับประมาณ
            </Typography>
            {!hasDestination ? (
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "text.disabled" }}
              >
                —
              </Typography>
            ) : (
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "#0F172A" }}
              >
                {/* Only use live Google Maps duration for Express — other services have fixed ETA semantics */}
                {mapDurationMins &&
                mapDurationMins > 0 &&
                activeServiceKey === "express"
                  ? formatETA(mapDurationMins)
                  : activeService?.eta || pricingData?.eta || "—"}
              </Typography>
            )}
          </Box>
        </Stack>

        <Divider sx={{ mb: 3, borderStyle: "dashed" }} />

        {/* Cost Breakdown */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          {/* ค่าจัดส่ง */}
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              ค่าจัดส่ง (
              {hasDestination
                ? `${mapDistance && mapDistance > 0 ? mapDistance.toFixed(1) : (pricingData?.distance ?? "—")} กม.`
                : "—"}
              )
            </Typography>
            {!hasDestination ? (
              <Typography
                variant="body1"
                fontWeight={700}
                color="text.disabled"
              >
                —
              </Typography>
            ) : token ? (
              <Typography variant="body1" fontWeight={700} color="#0F172A">
                {formatPrice(
                  orderResult
                    ? orderResult.distance_price
                    : pricingData
                      ? pricingData.distance_price
                      : 0,
                )}
              </Typography>
            ) : (
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body1"
                  fontWeight={700}
                  sx={{ filter: "blur(4px)", opacity: 0.5, userSelect: "none" }}
                >
                  ฿99
                </Typography>
                <Lock
                  sx={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "#64748B",
                    fontSize: 16,
                  }}
                />
              </Box>
            )}
          </Stack>

          {/* ค่าบริการพื้นฐาน */}
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              ค่าบริการพื้นฐาน
            </Typography>
            {!hasDestination ? (
              <Typography
                variant="body1"
                fontWeight={700}
                color="text.disabled"
              >
                —
              </Typography>
            ) : token ? (
              <Typography variant="body1" fontWeight={700} color="#0F172A">
                {formatPrice(
                  orderResult
                    ? orderResult.base_price
                    : pricingData
                      ? pricingData.base_price
                      : 0,
                )}
              </Typography>
            ) : (
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body1"
                  fontWeight={700}
                  sx={{ filter: "blur(4px)", opacity: 0.5, userSelect: "none" }}
                >
                  ฿99
                </Typography>
                <Lock
                  sx={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "#64748B",
                    fontSize: 16,
                  }}
                />
              </Box>
            )}
          </Stack>

          {/* ส่วนลด */}
          <Stack direction="row" justifyContent="space-between">
            <Typography
              variant="body1"
              fontWeight={700}
              sx={{ color: "#0F172A" }}
            >
              ส่วนลด (โค้ด: {promoCode || "—"})
            </Typography>
            {!hasDestination ? (
              <Typography
                variant="body1"
                fontWeight={700}
                color="text.disabled"
              >
                —
              </Typography>
            ) : token ? (
              <Typography
                variant="body1"
                fontWeight={700}
                sx={{
                  color: "#0F172A",
                  ...(pricingData?.promo_discount ? { color: "#16a34a" } : {}),
                }}
              >
                -{formatPrice(pricingData?.promo_discount || 0)}
              </Typography>
            ) : (
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body1"
                  fontWeight={700}
                  sx={{ filter: "blur(4px)", opacity: 0.5, userSelect: "none" }}
                >
                  -฿99
                </Typography>
                <Lock
                  sx={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "#64748B",
                    fontSize: 16,
                  }}
                />
              </Box>
            )}
          </Stack>
        </Stack>

        {/* Coupon Field */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="กรอกคูปองส่วนลด"
            variant="outlined"
            size="small"
            value={promoCode || ""}
            onChange={(e) => setPromoCode && setPromoCode(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleApplyPromo}
                    sx={{
                      bgcolor: "#1e293b",
                      color: "#fff",
                      textTransform: "none",
                      borderRadius: 1.5,
                      px: 2,
                      minWidth: "auto",
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#0f172a" },
                    }}
                  >
                    ใช้สิทธิ์
                  </Button>
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                bgcolor: "#F8FAFC",
                "& fieldset": { border: "1px solid #E2E8F0" },
                pr: 0.5,
                py: 0.5,
              },
            }}
          />
          {/* Promo feedback */}
          {promoApplied && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ mt: 1 }}
            >
              <CheckCircle sx={{ color: "#16a34a", fontSize: 16 }} />
              <Typography
                variant="caption"
                sx={{ color: "#16a34a", fontWeight: 600 }}
              >
                ใช้โค้ด {promoCode} สำเร็จ! ส่วนลด{" "}
                {formatPrice(pricingData?.promo_discount || 0)}
              </Typography>
            </Stack>
          )}
          {promoError && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ mt: 1 }}
            >
              <Cancel sx={{ color: "#dc2626", fontSize: 16 }} />
              <Typography
                variant="caption"
                sx={{ color: "#dc2626", fontWeight: 600 }}
              >
                {promoError}
              </Typography>
            </Stack>
          )}
        </Box>

        {/* Main Action Button */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={orderResult && orderResult.status as string === "pending_payment" ? () => handleConfirmPayment(orderResult.id) : onConfirm}
          disabled={loading}
          endIcon={orderResult && orderResult.status as string === "pending_payment" ? null : <ArrowForward />}
          sx={{
            bgcolor: orderResult && orderResult.status as string === "pending_payment" ? "#10b981" : "#2563EB",
            color: "white",
            py: 1.5,
            borderRadius: 3,
            fontSize: "1rem",
            fontWeight: 700,
            textTransform: "none",
            boxShadow: `0 10px 20px -5px ${orderResult && orderResult.status as string === "pending_payment" ? "rgba(16, 185, 129, 0.4)" : "rgba(37, 99, 235, 0.4)"}`,
            mb: 2,
            "&:hover": {
              bgcolor: orderResult && orderResult.status as string === "pending_payment" ? "#059669" : "#1d4ed8",
              boxShadow: `0 12px 24px -5px ${orderResult && orderResult.status as string === "pending_payment" ? "rgba(16, 185, 129, 0.5)" : "rgba(37, 99, 235, 0.5)"}`,
            },
          }}
        >
          {loading ? "กำลังโหลด..." : orderResult && orderResult.status as string === "pending_payment" ? "ชำระเงินเพื่อเรียกไรเดอร์" : "ยืนยันคำสั่งส่งพัสดุ"}
        </Button>

        {orderResult && orderResult.status as string !== "pending_payment" && (
           <Button
             fullWidth
             variant="outlined"
             color="error"
             size="large"
             onClick={onCancel}
             disabled={loading}
             sx={{
               py: 1.5,
               borderRadius: 3,
               fontSize: "1rem",
               fontWeight: 700,
               mb: 2,
             }}
           >
             ยกเลิกคำสั่ง
           </Button>
        )}

        <Typography
          variant="caption"
          display="block"
          align="center"
          color="text.secondary"
          sx={{ fontSize: "0.75rem" }}
        >
          โดยการกดปุ่ม คุณยอมรับ{" "}
          <Box
            component="span"
            sx={{
              textDecoration: "underline",
              cursor: "pointer",
              color: "text.primary",
            }}
          >
            ข้อตกลงและเงื่อนไขการใช้บริการ
          </Box>
        </Typography>
      </Card>

      {/* Info Footer */}
      <Card
        sx={{
          borderRadius: "20px",
          p: 2,
          bgcolor: "#F8FAFC",
          border: "1px solid",
          borderColor: "#F1F5F9",
          boxShadow: "none",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            minWidth: 40,
            height: 40,
            borderRadius: "50%",
            bgcolor: "#DBEAFE",
            color: "#2563EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <InfoOutlined />
        </Box>
        <Box>
          <Typography
            variant="subtitle2"
            fontWeight={800}
            sx={{ color: "#1e293b" }}
          >
            ข้อมูลควรรู้
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "0.8rem" }}
          >
            มีไรเดอร์อยู่ใกล้คุณ 15 คน โอกาสจับคู่สูงมาก
          </Typography>
        </Box>
      </Card>
    </Stack>
  );
};

export default OrderSummary;
