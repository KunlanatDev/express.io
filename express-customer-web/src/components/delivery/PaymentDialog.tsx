import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  Stack,
  alpha,
  useTheme,
  IconButton,
  Divider,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  Close,
  CreditCard,
  QrCode2,
  CheckCircle,
  AccountBalanceWallet,
} from "@mui/icons-material";
import type { OrderResponse } from "../../types";

interface PaymentDialogProps {
  open: boolean;
  order: OrderResponse | null;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  order,
  onClose,
  onSuccess,
}) => {
  const theme = useTheme();
  const [method, setMethod] = useState<"promptpay" | "card">("promptpay");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Timer logic for PromptPay
  useEffect(() => {
    if (open && method === "promptpay" && !processing && !success) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [open, method, processing, success]);

  // Reset state on open
  useEffect(() => {
    if (open) {
      setMethod("promptpay");
      setTimeLeft(300);
      setProcessing(false);
      setSuccess(false);
    }
  }, [open]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSimulatePayment = () => {
    if (!order) return;
    setProcessing(true);
    // Simulate network delay and Bank Webhook callback
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess(order.id);
      }, 1500); // Show success checkmark for 1.5s before redirecting
    }, 2000);
  };

  return (
    <Dialog
      open={open}
      onClose={processing ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px",
          p: 0,
          boxShadow: `0 24px 48px ${alpha(theme.palette.primary.main, 0.1)}`,
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#f4f4f5",
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e4e4e7",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <AccountBalanceWallet sx={{ color: "#3f3f46" }} />
          <Typography variant="h6" fontWeight={700} sx={{ color: "#27272a" }}>
            EXPRESS PAY
          </Typography>
        </Stack>
        <IconButton disabled={processing || success} onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: 4 }}>
        {success ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: alpha(theme.palette.success.main, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              <CheckCircle sx={{ fontSize: 48, color: "success.main" }} />
            </Box>
            <Typography variant="h5" fontWeight={800} gutterBottom>
              ชำระเงินสำเร็จ!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              กำลังส่งคำสั่งซื้อของคุณไปยังไรเดอร์ที่ใกล้ที่สุด...
            </Typography>
          </Box>
        ) : (
          <Stack spacing={4}>
            {/* Amount display */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
                ยอดที่ต้องชำระ (ออเดอร์ {order?.order_number})
              </Typography>
              <Typography variant="h3" fontWeight={800} sx={{ color: "#0f172a", letterSpacing: -1 }}>
                ฿{order?.total_price.toFixed(2)}
              </Typography>
            </Box>

            {/* Methods Tabs */}
            <Stack direction="row" spacing={2}>
              <Button
                fullWidth
                variant={method === "promptpay" ? "contained" : "outlined"}
                onClick={() => setMethod("promptpay")}
                startIcon={<QrCode2 />}
                sx={{
                  borderRadius: "12px",
                  py: 1.5,
                  fontWeight: 700,
                  bgcolor: method === "promptpay" ? "#111827" : "transparent",
                  color: method === "promptpay" ? "#fff" : "#64748b",
                  borderColor: method === "promptpay" ? "transparent" : "#e2e8f0",
                  "&:hover": {
                    bgcolor: method === "promptpay" ? "#1f2937" : "#f1f5f9",
                  },
                }}
              >
                พร้อมเพย์
              </Button>
              <Button
                fullWidth
                variant={method === "card" ? "contained" : "outlined"}
                onClick={() => setMethod("card")}
                startIcon={<CreditCard />}
                sx={{
                  borderRadius: "12px",
                  py: 1.5,
                  fontWeight: 700,
                  bgcolor: method === "card" ? "#111827" : "transparent",
                  color: method === "card" ? "#fff" : "#64748b",
                  borderColor: method === "card" ? "transparent" : "#e2e8f0",
                  "&:hover": {
                    bgcolor: method === "card" ? "#1f2937" : "#f1f5f9",
                  },
                }}
              >
                บัตรเครดิต
              </Button>
            </Stack>

            <Divider />

            {/* PromptPay UI */}
            {method === "promptpay" && (
              <Box sx={{ textAlign: "center" }}>
                <Box
                  sx={{
                    width: 200,
                    height: 200,
                    mx: "auto",
                    bgcolor: "#fff",
                    border: "2px solid #e2e8f0",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    p: 2,
                  }}
                >
                  {/* Fake QR code generation using CSS grid for that expert feel without libraries */}
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      background: `repeating-linear-gradient(45deg, #020617 25%, transparent 25%, transparent 75%, #020617 75%, #020617),
                                  repeating-linear-gradient(45deg, #020617 25%, #fff 25%, #fff 75%, #020617 75%, #020617)`,
                      backgroundPosition: "0 0, 10px 10px",
                      backgroundSize: "20px 20px",
                      borderRadius: "8px",
                      position: "relative",
                    }}
                  >
                    <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", bgcolor: "#fff", p: 0.5, borderRadius: "4px" }}>
                        <Typography variant="caption" fontWeight={800} color="primary">PROMPTPAY</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  สแกนคิวอาร์โค้ดนี้ผ่านแอพธนาคารของคุณ
                </Typography>
                <Typography variant="h6" fontWeight={800} color="error.main" sx={{ mt: 1 }}>
                  กรุณาชำระภายใน {formatTime(timeLeft)}
                </Typography>
              </Box>
            )}

            {/* Credit Card UI */}
            {method === "card" && (
              <Stack spacing={2}>
                <TextField 
                  label="หมายเลขบัตรเครดิต" 
                  fullWidth 
                  placeholder="0000 0000 0000 0000"
                  InputProps={{ sx: { borderRadius: "12px", bgcolor: "#f8fafc" } }}
                />
                <Stack direction="row" spacing={2}>
                   <TextField 
                     label="วันหมดอายุ (MM/YY)" 
                     fullWidth 
                     placeholder="12/26"
                     InputProps={{ sx: { borderRadius: "12px", bgcolor: "#f8fafc" } }}
                   />
                   <TextField 
                     label="CVV" 
                     fullWidth 
                     placeholder="123"
                     InputProps={{ sx: { borderRadius: "12px", bgcolor: "#f8fafc" } }}
                   />
                </Stack>
                <TextField 
                  label="ชื่อบนบัตร" 
                  fullWidth 
                  placeholder="KULLANAT PAKINE"
                  InputProps={{ sx: { borderRadius: "12px", bgcolor: "#f8fafc" } }}
                />
              </Stack>
            )}

            {/* Dev Helper - Simulate Payment */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={processing || timeLeft === 0}
              onClick={handleSimulatePayment}
              sx={{
                py: 2,
                borderRadius: "16px",
                fontSize: "1.1rem",
                fontWeight: 800,
                bgcolor: "#10b981",
                textTransform: "none",
                "&:hover": { bgcolor: "#059669" },
              }}
            >
              {processing ? (
                <Stack direction="row" spacing={2} alignItems="center">
                  <CircularProgress size={24} color="inherit" />
                  <span>กำลังดำเนินการ...</span>
                </Stack>
              ) : (
                "ชำระเงิน (จำลองการตัดบัตร)"
              )}
            </Button>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
