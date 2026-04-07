import React, { useState } from "react";
import { Grid, Typography, Alert, Button, Box } from "@mui/material";
import { Lock, Login } from "@mui/icons-material";
import DeliveryForm from "../components/delivery/DeliveryForm";
import OrderSummary from "../components/delivery/OrderSummary";
import OrderConfirmationDialog from "../components/delivery/OrderConfirmationDialog";
import PaymentDialog from "../components/delivery/PaymentDialog";
import { orderService } from "../services/order";
import type { OrderResponse, AddressInfo } from "../types";

interface CreateOrderPageProps {
  token: string | null;
  onRequireAuth: () => void;
  orderResult: OrderResponse | null;
  setOrderResult: (res: OrderResponse | null) => void;
  successMsg: string | null;
  setSuccessMsg: (msg: string | null) => void;
  error: string | null;
  setError: (msg: string | null) => void;
}

const CreateOrderPage: React.FC<CreateOrderPageProps> = ({
  token,
  onRequireAuth,
  orderResult,
  setOrderResult,
  setSuccessMsg,
  error,
  setError,
}) => {
  // Order Form State
  const [deliveryTab, setDeliveryTab] = useState(0);
  const [vehicleType, setVehicleType] = useState("motorcycle");
  const [pickup, setPickup] = useState<AddressInfo>({
    address: "",
    lat: 13.7563,
    lng: 100.5018,
  });
  const [deliveries, setDeliveries] = useState<AddressInfo[]>([
    { address: "", lat: 13.7563, lng: 100.5018 },
  ]);

  React.useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPickup({
            address: "ตำแหน่งปัจจุบัน",
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location", error);
        },
      );
    }
  }, []);
  const [parcelType, setParcelType] = useState("box");
  const [parcelSize, setParcelSize] = useState("M");
  const [services, setServices] = useState({
    wait: false,
    lift: false,
    insurance: false,
  });
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const [promoCode, setPromoCode] = useState("");
  const [pricingData, setPricingData] = useState<any>(null);
  const [mapDistance, setMapDistance] = useState<number>(0);
  const [mapDurationMins, setMapDurationMins] = useState<number>(0);

  // Popup state
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Auto calculate when inputs change
  React.useEffect(() => {
    // Only calculate if we have a valid pickup and at least one delivery with an address
    if (
      !pickup.lat ||
      !deliveries[0].lat ||
      !pickup.address ||
      !deliveries[0].address
    )
      return;

    // Also debounce it to prevent too many calls (simple version: just call it, maybe wrap in setTimeout)
    const timeout = setTimeout(async () => {
      try {
        let weight = 1.0,
          w = 20,
          l = 20,
          h = 10;
        switch (parcelSize) {
          case "S":
            weight = 1.0;
            w = 20;
            l = 20;
            h = 10;
            break;
          case "M":
            weight = 5.0;
            w = 30;
            l = 30;
            h = 15;
            break;
          case "L":
            weight = 15.0;
            w = 50;
            l = 50;
            h = 40;
            break;
          case "XL":
            weight = 30.0;
            w = 80;
            l = 80;
            h = 60;
            break;
        }

        const addons: string[] = [];
        if (services.wait) addons.push("wait");
        if (services.lift) addons.push("lift");
        if (services.insurance) addons.push("insurance");

        const data = await orderService.calculate({
          pickup_address: pickup,
          delivery_address: deliveries[0],
          stops: deliveries.length > 1 ? deliveries.slice(1) : undefined,
          parcels: [
            {
              description: `${parcelType} - ${parcelSize}`,
              weight,
              width: w,
              length: l,
              height: h,
              quantity: 1,
            },
          ],
          addons,
          promo_code: promoCode,
          distance: mapDistance > 0 ? mapDistance : undefined,
          duration_mins: mapDurationMins > 0 ? mapDurationMins : undefined,
        });
        setPricingData(data);
      } catch (err) {
        console.error("Calculate error:", err);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [
    pickup,
    deliveries,
    parcelSize,
    parcelType,
    services,
    promoCode,
    mapDistance,
    mapDurationMins,
  ]);

  const handleCreateOrder = async () => {
    if (!token) {
      onRequireAuth();
      return;
    }
    setLoading(true);
    try {
      // Map inputs to API request
      let weight = 1.0,
        w = 20,
        l = 20,
        h = 10;
      switch (parcelSize) {
        case "S":
          weight = 1.0;
          w = 20;
          l = 20;
          h = 10;
          break;
        case "M":
          weight = 5.0;
          w = 30;
          l = 30;
          h = 15;
          break;
        case "L":
          weight = 15.0;
          w = 50;
          l = 50;
          h = 40;
          break;
        case "XL":
          weight = 30.0;
          w = 80;
          l = 80;
          h = 60;
          break;
      }

      const addons: string[] = [];
      if (services.wait) addons.push("wait");
      if (services.lift) addons.push("lift");
      if (services.insurance) addons.push("insurance");

      const orderData = {
        pickup_address: {
          address: pickup.address,
          lat: pickup.lat || 13.7462,
          lng: pickup.lng || 100.5348,
          note: "",
        },
        delivery_address: {
          address: deliveries[0]?.address || "",
          lat: deliveries[0]?.lat || 13.75,
          lng: deliveries[0]?.lng || 100.5,
          note: note,
        },
        stops: deliveries.length > 1 ? deliveries.slice(1) : undefined,
        pickup_contact: { name: `Me`, phone: "0812345678" },
        delivery_contact: { name: "Receiver", phone: "0898765432" },
        service_type: deliveryTab === 0 ? "express" : "next_day",
        parcels: [
          {
            description: `${parcelType} - ${parcelSize}`,
            weight,
            width: w,
            length: l,
            height: h,
            quantity: 1,
          },
        ],
        addons,
        scheduled_at:
          deliveryTab === 1
            ? new Date(Date.now() + 86400000).toISOString()
            : undefined,
      };

      const res = await orderService.create(orderData);
      setOrderResult(res);
      setSuccessMsg("สร้างคำสั่งเรียบร้อย กรุณาชำระเงินเพื่อเรียกไรเดอร์");
      // DO NOT pop up the Confirm Popup yet, wait for payment!
      // setShowConfirmPopup(true); 
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderResult) return;
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setLoading(true);
    try {
      await orderService.cancel(orderResult.id, "User cancelled");
      setOrderResult(
        orderResult ? { ...orderResult, status: "cancelled" } : null,
      );
      setSuccessMsg("Order cancelled.");
    } catch (e: unknown) {
      const errorObj = e as Error;
      setError(errorObj.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={4} sx={{ height: "100%", alignItems: "stretch" }}>
      {/* LEFT PANEL (Builder) - 60% approx */}
      <Grid size={{ xs: 12, md: 7 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {!token && (
          <Alert
            severity="warning"
            icon={
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  backgroundColor: "#D08700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Lock sx={{ color: "#fff", fontSize: 18 }} />
              </Box>
            }
            sx={{
              mb: 3,
              borderRadius: "16px",
              border: "2px solid #D08700",
              bgcolor: "#E0D3CC",
              color: "#854D0E",

              // 👇 ตรงนี้สำคัญ
              "& .MuiAlert-icon": {
                alignItems: "flex-start",
                mt: "4px", // ปรับเพิ่ม/ลดได้ตามต้องการ
              },
            }}
          >
            <Typography variant="subtitle1" fontWeight={800} gutterBottom>
              กรอกข้อมูลได้เลย แต่ต้อง Login ก่อนยืนยันคำสั่ง
            </Typography>
            <Typography variant="body2">
              เพื่อความปลอดภัยของราคา
              เราจำเป็นต้องขอให้คุณเข้าสู่ระบบก่อนดูราคาและยืนยันการสั่งส่งพัสดุ
            </Typography>
            <Button
              variant="contained"
              onClick={onRequireAuth}
              sx={{
                mt: "8px",
                px: 3,
                background: "#D08700",
                color: "black",
                borderRadius: "8px",
              }}
            >
              <Login sx={{ pr: 1, color: "#FFFFFF" }} />
              <Typography variant="body2" sx={{ color: "#FFFFFF" }}>
                เข้าสู่ระบบเพื่อดูราคา
              </Typography>
            </Button>
          </Alert>
        )}

        <Typography
          variant="h5"
          fontWeight={800}
          gutterBottom
          sx={{ mb: 3, pl: 1 }}
        >
          {/* CREATE DELIVERY */}
          สร้างคำสั่งส่งของ
        </Typography>

        <DeliveryForm
          token={token}
          pickup={pickup}
          setPickup={setPickup}
          deliveries={deliveries}
          setDeliveries={setDeliveries}
          deliveryTab={deliveryTab}
          setDeliveryTab={setDeliveryTab}
          vehicleType={vehicleType}
          setVehicleType={setVehicleType}
          parcelType={parcelType}
          setParcelType={setParcelType}
          parcelSize={parcelSize}
          setParcelSize={setParcelSize}
          services={services}
          setServices={setServices}
          note={note}
          setNote={setNote}
          loading={loading}
          onSubmit={handleCreateOrder}
          pricingData={pricingData}
          mapDistance={mapDistance}
        />
      </Grid>

      {/* RIGHT PANEL (Map + Summary) - 40% approx */}
      <Grid size={{ xs: 12, md: 5 }}>
        <OrderSummary
          token={token}
          orderResult={orderResult}
          loading={loading}
          onConfirm={handleCreateOrder}
          onCancel={handleCancelOrder}
          pickup={pickup}
          deliveries={deliveries}
          vehicleType={vehicleType}
          pricingData={pricingData}
          selectedServiceTab={deliveryTab}
          promoCode={promoCode}
          setPromoCode={setPromoCode}
          mapDistance={mapDistance}
          mapDurationMins={mapDurationMins}
          onRouteCalculated={(dist, dur) => {
            setMapDistance(dist);
            setMapDurationMins(dur);
          }}
          onApplyPromo={() => {
            // Force recalculation by setting promoCode again (triggers useEffect)
            setPromoCode((prev) => prev);
          }}
          onConfirmPayment={() => {
            // Instead of direct API call, open the awesome mock payment modal
            setShowPaymentModal(true);
          }}
        />
      </Grid>

      {/* Payment Gateway Modal (Mock) */}
      <PaymentDialog
        open={showPaymentModal}
        order={orderResult}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={async (id) => {
          try {
            setLoading(true);
            const newOrderState = await orderService.confirmPayment(id);
            setOrderResult(newOrderState);
            setShowPaymentModal(false);
            setSuccessMsg("ชำระเงินเรียบร้อยแล้ว ระบบกำลังหาไรเดอร์ให้คุณ...");
            setShowConfirmPopup(true);
          } catch (e: unknown) {
            const errObj = e as Error;
            setError(errObj.message || "Failed to confirm payment");
          } finally {
            setLoading(false);
          }
        }}
      />

      {/* Confirmation Popup */}
      <OrderConfirmationDialog
        open={showConfirmPopup}
        order={orderResult}
        onClose={() => setShowConfirmPopup(false)}
        onNewOrder={() => {
          setShowConfirmPopup(false);
          setOrderResult(null);
          // reset states back to default
          setPickup({ address: "", lat: 13.7563, lng: 100.5018 });
          setDeliveries([{ address: "", lat: 13.7563, lng: 100.5018 }]);
          setDeliveryTab(0);
          setVehicleType("motorcycle");
          setParcelType("box");
          setParcelSize("M");
          setNote("");
        }}
        onViewOrder={() => {
          setShowConfirmPopup(false);
          if (orderResult?.id) {
            window.location.href = `/tracking?tracking_no=${orderResult.id}`;
          } else {
            window.location.href = `/tracking`;
          }
        }}
      />
    </Grid>
  );
};

export default CreateOrderPage;
