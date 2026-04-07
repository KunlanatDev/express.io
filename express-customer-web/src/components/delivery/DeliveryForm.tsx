import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
} from "@mui/material";
import type { AddressInfo } from "../../types";
import LocationSearchInput from "./LocationSearchInput";
import {
  Add,
  Description,
  Inventory2,
  WineBar,
  Apartment,
  LocalDining,
  FlashOn, // For Express
  LocalShipping, // For Same-day
  Language, // For Inter-city
  CheckCircle,
  History,
  Lock,
  TwoWheeler,
  LocalTaxi,
} from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";

interface DeliveryFormProps {
  token: string | null;
  pickup: AddressInfo;
  setPickup: (val: AddressInfo) => void;
  deliveries: AddressInfo[];
  setDeliveries: (val: AddressInfo[]) => void;
  deliveryTab: number;
  setDeliveryTab: (val: number) => void;
  vehicleType: string;
  setVehicleType: (val: string) => void;
  parcelType: string;
  setParcelType: (val: string) => void;
  parcelSize: string;
  setParcelSize: (val: string) => void;
  services: { wait: boolean; lift: boolean; insurance: boolean };
  setServices: (val: {
    wait: boolean;
    lift: boolean;
    insurance: boolean;
  }) => void;
  note: string;
  setNote: (val: string) => void;
  loading: boolean;
  onSubmit: () => void;
  pricingData?: any;
  mapDistance?: number;
}

const POINT_SIZE = 16; // ขนาดวงกลม (ring)

const DeliveryForm: React.FC<DeliveryFormProps> = ({
  token,
  pickup,
  setPickup,
  deliveries,
  setDeliveries,
  deliveryTab,
  setDeliveryTab,
  vehicleType,
  setVehicleType,
  parcelType,
  setParcelType,
  parcelSize,
  setParcelSize,
  services,
  setServices,
  pricingData,
  mapDistance,
}) => {
  const theme = useTheme();

  // Drag and drop state for deliveries
  const dragItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    position: number,
  ) => {
    dragItem.current = position;
    // Fix for Firefox requiring data transfer
    e.dataTransfer.setData("text/plain", position.toString());
  };

  const handleDragEnter = (
    _e: React.DragEvent<HTMLDivElement>,
    position: number,
  ) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = () => {
    if (
      dragItem.current !== null &&
      dragOverItem.current !== null &&
      dragItem.current !== dragOverItem.current
    ) {
      const _deliveries = [...deliveries];
      const draggedItemContent = _deliveries.splice(dragItem.current, 1)[0];
      _deliveries.splice(dragOverItem.current, 0, draggedItemContent);
      setDeliveries(_deliveries);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleDeliveryChange = (index: number, value: AddressInfo) => {
    const newDeliveries = [...deliveries];
    newDeliveries[index] = value;
    setDeliveries(newDeliveries);
  };

  const handleRemoveDelivery = (index: number) => {
    if (deliveries.length > 1) {
      const newDeliveries = deliveries.filter((_, i) => i !== index);
      setDeliveries(newDeliveries);
    }
  };

  // Local state for extra fields shown in design
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [parcelValue, setParcelValue] = useState("");

  const promoDiscount = pricingData?.promo_discount || 0;

  // Service Types Data (use dynamic if possible)
  const serviceTypes = [
    {
      id: "express",
      label: "Express",
      price:
        pricingData?.services?.find((s: any) => s.service_type === "express")
          ?.total_price || 45,
      originalPrice:
        promoDiscount > 0
          ? (pricingData?.services?.find(
              (s: any) => s.service_type === "express",
            )?.total_price || 45) + promoDiscount
          : null,
      desc: "ด่วนที่สุด ทันใจคุณ",
      time:
        pricingData?.services?.find((s: any) => s.service_type === "express")
          ?.eta || "1-2 ชม.",
      icon: FlashOn,
      tabIndex: 0,
    },
    {
      id: "sameday",
      label: "Same-day",
      price:
        pricingData?.services?.find((s: any) => s.service_type === "sameday")
          ?.total_price || 25,
      originalPrice:
        promoDiscount > 0
          ? (pricingData?.services?.find(
              (s: any) => s.service_type === "sameday",
            )?.total_price || 25) + promoDiscount
          : null,
      desc: "ส่งเช้า ถึงเย็น ราคาประหยัด",
      time:
        pricingData?.services?.find((s: any) => s.service_type === "sameday")
          ?.eta || "ภายในวัน",
      icon: LocalShipping,
      tabIndex: 1,
    },
    {
      id: "intercity",
      label: "Inter-city",
      price:
        pricingData?.services?.find((s: any) => s.service_type === "intercity")
          ?.total_price || 85,
      originalPrice:
        promoDiscount > 0
          ? (pricingData?.services?.find(
              (s: any) => s.service_type === "intercity",
            )?.total_price || 85) + promoDiscount
          : null,
      desc: "ส่งข้ามจังหวัด มีระบบติดตาม",
      time:
        pricingData?.services?.find((s: any) => s.service_type === "intercity")
          ?.eta || "1-2 วัน",
      icon: Language,
      tabIndex: 2,
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* 1. LOCATION CARD */}
      <Card
        sx={{
          borderRadius: "24px",
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
            px: "20px",
            py: "8px",
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

          <Typography variant="body2" sx={{ color: "#64748B" }}>
            ระยะทางประมาณ{" "}
            {mapDistance && mapDistance > 0
              ? mapDistance.toFixed(1)
              : pricingData?.distance || "4.2"}{" "}
            กม.
          </Typography>
        </Stack>
        
        <Divider />

        {/* Body */}
        <Box sx={{ p: "20px" }}>
          <Stack spacing="16px">
            {/* 1. Pickup Block */}
            <Stack direction="row" spacing={2} alignItems="stretch">
              <Box
                sx={{
                  width: 24,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    height: POINT_SIZE,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: POINT_SIZE,
                      height: POINT_SIZE,
                      borderRadius: "50%",
                      bgcolor: "#2563EB",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: "bold",
                      flexShrink: 0,
                    }}
                  >
                    A
                  </Box>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    width: 3,
                    borderRadius: 999,
                    background:
                      "linear-gradient(to bottom, #2563EB 0%, rgba(37,99,235,0.55) 45%, rgba(37,99,235,0.20) 75%, transparent 100%)",
                    mt: 0.5,
                    mb: -2, // Bridge the gap to the next block
                  }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    height: POINT_SIZE,
                    display: "flex",
                    alignItems: "center",
                    mb: "8px",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: "#64748B" }}>
                    จุดรับพัสดุ
                  </Typography>
                </Box>

                <LocationSearchInput
                  value={pickup}
                  onChange={setPickup}
                  placeholder="ค้นหาจุดรับ..."
                />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="คุณสมชาย"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "48px",
                        borderRadius: "12px",
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
                        height: "48px",
                        borderRadius: "12px",
                        bgcolor: "#fff",
                      },
                      "& fieldset": { borderColor: "#D8E2F1" },
                    }}
                  />
                </Stack>
              </Box>
            </Stack>

            {/* 2. Dropoff Block */}
            {deliveries.map((deliveryLocation, index) => {
              const isLast = index === deliveries.length - 1;
              return (
                <Stack
                  key={index}
                  direction="row"
                  spacing={2}
                  alignItems="stretch"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  sx={{ cursor: "grab", "&:active": { cursor: "grabbing" } }}
                >
                  <Box
                    sx={{
                      width: 24,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        height: POINT_SIZE,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        sx={{
                          width: POINT_SIZE,
                          height: POINT_SIZE,
                          borderRadius: "50%",
                          bgcolor: "#EF4444",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          fontWeight: "bold",
                          flexShrink: 0,
                        }}
                      >
                        {String.fromCharCode(66 + index)}
                      </Box>
                    </Box>
                    {!isLast && (
                      <Box
                        sx={{
                          flex: 1,
                          width: 2,
                          borderRadius: 999,
                          bgcolor: "#E2E8F0",
                          mt: 0.5,
                          mb: -2,
                        }}
                      />
                    )}
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        height: POINT_SIZE,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: "8px",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: "#64748B" }}>
                        จุดส่งพัสดุ {String.fromCharCode(66 + index)}
                      </Typography>
                      {deliveries.length > 1 && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#EF4444",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                          onClick={() => handleRemoveDelivery(index)}
                        >
                          ลบ
                        </Typography>
                      )}
                    </Box>

                    <LocationSearchInput
                      value={deliveryLocation}
                      onChange={(val) => handleDeliveryChange(index, val)}
                      placeholder="ระบุจุดส่ง (เช่น อาคาร, ตึก, เลขที่บ้าน)"
                    />

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        value={deliveryLocation.contactName || ""}
                        onChange={(e) =>
                          handleDeliveryChange(index, {
                            ...deliveryLocation,
                            contactName: e.target.value,
                          })
                        }
                        placeholder="ชื่อผู้รับ"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "48px",
                            borderRadius: "12px",
                            bgcolor: "#fff",
                          },
                          "& fieldset": { borderColor: "#D8E2F1" },
                        }}
                      />
                      <TextField
                        fullWidth
                        value={deliveryLocation.contactPhone || ""}
                        onChange={(e) =>
                          handleDeliveryChange(index, {
                            ...deliveryLocation,
                            contactPhone: e.target.value,
                          })
                        }
                        placeholder="เบอร์โทรศัพท์ผู้รับ"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "48px",
                            borderRadius: "12px",
                            bgcolor: "#fff",
                          },
                          "& fieldset": { borderColor: "#D8E2F1" },
                        }}
                      />
                    </Stack>
                  </Box>
                </Stack>
              );
            })}

            {/* 3. Add Stop dashed */}
            {deliveries.length < 5 && (
              <Stack direction="row" spacing={2} alignItems="stretch">
                <Box
                  sx={{
                    width: 24,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {/* Add a line connecting from the last pin to the add box if needed, or leave empty space */}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      border: "2px dashed #D8E2F1",
                      height: "48px",
                      borderRadius: "12px",
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
                      setDeliveries([
                        ...deliveries,
                        { address: "", lat: 13.75, lng: 100.5 },
                      ]);
                    }}
                  >
                    <Add sx={{ color: "#64748B" }} />
                    <Typography fontWeight={800}>เพิ่มจุดส่งพัสดุ</Typography>
                  </Box>
                </Box>
              </Stack>
            )}
          </Stack>
        </Box>
      </Card>

      {/* 2. PARCEL DETAILS */}
      <Card
        sx={{
          p: "20px",
          borderRadius: "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
          <Inventory2 color="primary" sx={{ width: "20px", height: "20px" }} />
          <Typography variant="subtitle1" fontWeight={700}>
            รายละเอียดการจัดส่ง
          </Typography>
        </Stack>

        {/* Vehicle Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>
            ประเภทรถ
          </Typography>
          <ToggleButtonGroup
            value={vehicleType}
            exclusive
            onChange={(_, v) => v && setVehicleType(v)}
            fullWidth
            sx={{ gap: 2 }}
          >
            {[
              { id: "motorcycle", label: "มอเตอร์ไซค์", icon: TwoWheeler },
              { id: "car", label: "รถยนต์ / ปิคอัพ", icon: LocalTaxi },
            ].map((v) => (
              <ToggleButton
                key={v.id}
                value={v.id}
                sx={{
                  borderRadius: "12px !important",
                  border: "1px solid !important",
                  borderColor: "divider",
                  height: "80px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    borderColor: "primary.main",
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
                  },
                  "&.Mui-selected:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                <v.icon />
                <Typography variant="body2" fontWeight={700}>
                  {v.label}
                </Typography>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Typography variant="subtitle2" fontWeight={700} mb={1}>
          ประเภทสิ่งของ
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          sx={{ overflowX: "auto", pb: 1, mb: 3 }}
          alignItems="stretch"
        >
          {[
            { id: "doc", label: "เอกสาร", icon: Description },
            { id: "box", label: "กล่อง", icon: Inventory2 },
            { id: "fragile", label: "ของแตกหัก", icon: WineBar },
            { id: "large", label: "ของขนาดใหญ่", icon: Apartment },
            { id: "food", label: "อาหาร", icon: LocalDining },
          ].map((item) => (
            <Button
              key={item.id}
              variant={parcelType === item.id ? "contained" : "outlined"}
              onClick={() => setParcelType(item.id)}
              sx={{
                minWidth: 100,
                height: "96px",
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                gap: 1,
                bgcolor:
                  parcelType === item.id ? "primary.main" : "transparent",
                borderColor:
                  parcelType === item.id ? "primary.main" : "divider",
                color: parcelType === item.id ? "#fff" : "text.secondary",
                boxShadow:
                  parcelType === item.id
                    ? "0 4px 12px rgba(37,99,235,0.3)"
                    : "none",
                "&:hover": {
                  bgcolor:
                    parcelType === item.id
                      ? "primary.dark"
                      : "rgba(0,0,0,0.02)",
                  borderColor:
                    parcelType === item.id ? "primary.dark" : "text.primary",
                },
              }}
            >
              <item.icon />
              <Typography variant="body2" fontWeight={600}>
                {item.label}
              </Typography>
            </Button>
          ))}
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          {/* Size Selector */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              ขนาดพัสดุ (โดยประมาณ)
            </Typography>
            <ToggleButtonGroup
              value={parcelSize}
              exclusive
              onChange={(_, v) => v && setParcelSize(v)}
              fullWidth
              sx={{ gap: 1 }}
            >
              {["S", "M", "L", "XL"].map((size) => (
                <ToggleButton
                  key={size}
                  value={size}
                  sx={{
                    borderRadius: "12px !important",
                    border: "1px solid !important",
                    borderColor: "divider",
                    fontWeight: 700,
                    height: "44px",
                    "&.Mui-selected": {
                      bgcolor: "#fff",
                      borderColor: "primary.main",
                      color: "primary.main",
                      fontWeight: 800,
                    },
                  }}
                >
                  {size}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* Value Input */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              มูลค่าสินค้า (เพื่อประกัน)
            </Typography>
            <TextField
              fullWidth
              value={parcelValue}
              onChange={(e) => setParcelValue(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">฿</InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  height: "44px",
                },
              }}
            />
          </Box>
        </Stack>

        {/* Insurance Toggle */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: "16px",
            border: "1px solid",
            borderColor: services.insurance ? "primary.main" : "divider",
            bgcolor: services.insurance
              ? alpha(theme.palette.primary.main, 0.04)
              : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={() =>
            setServices({ ...services, insurance: !services.insurance })
          }
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid",
                borderColor: services.insurance
                  ? "primary.main"
                  : "text.disabled",
                bgcolor: services.insurance ? "primary.main" : "transparent",
                color: "#fff",
              }}
            >
              <CheckCircle
                sx={{ fontSize: 16, opacity: services.insurance ? 1 : 0 }}
              />
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
            <Typography variant="subtitle2" fontWeight={700}>
              +฿10
            </Typography>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: 1,
                bgcolor: services.insurance ? "primary.main" : "#e2e8f0",
                transition: "all 0.2s",
              }}
            />
          </Stack>
        </Box>
      </Card>

      {/* 3. SERVICE TYPE SELECTION */}
      <Box>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
          เลือกประเภทบริการ
        </Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          {serviceTypes.map((service) => {
            const isSelected = deliveryTab === service.tabIndex;
            return (
              <Card
                key={service.id}
                onClick={() => setDeliveryTab(service.tabIndex)}
                sx={{
                  flex: 1,
                  p: 2.5,
                  borderRadius: "16px",
                  border: "2px solid",
                  borderColor: isSelected ? "primary.main" : "transparent",
                  bgcolor: isSelected
                    ? alpha(theme.palette.primary.main, 0.04)
                    : "#fff",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  position: "relative",
                  overflow: "visible",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 160,
                  boxShadow: isSelected
                    ? "0 8px 24px rgba(37, 99, 235, 0.15)"
                    : "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                {service.id === "express" && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -10,
                      left: 16,
                      bgcolor: "primary.main",
                      color: "#fff",
                      px: 1.5,
                      py: 0.25,
                      borderRadius: 1,
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    แนะนำ
                  </Box>
                )}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: isSelected ? "primary.main" : "grey.100",
                      color: isSelected ? "#fff" : "text.secondary",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <service.icon />
                  </Box>
                  <Box
                    sx={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {token ? (
                      <Stack direction="row" alignItems="baseline" spacing={1}>
                        <Typography
                          variant="h5"
                          fontWeight={800}
                          color="text.primary"
                        >
                          ฿{service.price}
                        </Typography>
                        {service.originalPrice && (
                          <Typography
                            variant="body2"
                            sx={{
                              textDecoration: "line-through",
                              color: "#94a3b8",
                              fontWeight: 500,
                              fontSize: "0.85rem",
                            }}
                          >
                            ฿{service.originalPrice}
                          </Typography>
                        )}
                      </Stack>
                    ) : (
                      <>
                        <Typography
                          variant="h5"
                          fontWeight={800}
                          color="text.primary"
                          sx={{
                            filter: "blur(5px)",
                            opacity: 0.5,
                            userSelect: "none",
                          }}
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
                            fontSize: 20,
                          }}
                        />
                      </>
                    )}
                  </Box>
                </Box>

                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={800}
                    sx={{ mb: 0.5 }}
                  >
                    {service.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                    sx={{ mb: 1.5, lineHeight: 1.4 }}
                  >
                    {service.desc}
                  </Typography>

                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <History sx={{ fontSize: 14, color: "primary.main" }} />
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="primary.main"
                    >
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
