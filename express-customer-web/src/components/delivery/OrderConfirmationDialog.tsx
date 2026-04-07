import React from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  Stack,
  alpha,
  useTheme,
} from "@mui/material";
import { CheckCircle, LocalShipping, AddCircleOutline } from "@mui/icons-material";
import type { OrderResponse } from "../../types";

interface OrderConfirmationDialogProps {
  open: boolean;
  order: OrderResponse | null;
  onNewOrder: () => void;
  onViewOrder: () => void;
  onClose: () => void;
}

const OrderConfirmationDialog: React.FC<OrderConfirmationDialogProps> = ({
  open,
  order,
  onNewOrder,
  onViewOrder,
  onClose,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px",
          p: 2,
          boxShadow: `0 24px 48px ${alpha(theme.palette.primary.main, 0.15)}`,
        },
      }}
    >
      <DialogContent sx={{ p: 2, textAlign: "center" }}>
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
          <CheckCircle sx={{ fontSize: 40, color: "success.main" }} />
        </Box>

        <Typography variant="h5" fontWeight={800} gutterBottom>
          สั่งงานสำเร็จ!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          ระบบกำลังค้นหาไรเดอร์ที่ใกล้ที่สุดสำหรับคำสั่งซื้อของคุณ
          <br />
          หมายเลข:{" "}
          <Typography
            component="span"
            fontWeight={700}
            color="primary.main"
          >
            {order?.order_number || "—"}
          </Typography>
        </Typography>

        <Stack spacing={2}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={onViewOrder}
            startIcon={<LocalShipping />}
            sx={{
              height: 54,
              borderRadius: "16px",
              fontWeight: 700,
              fontSize: "1rem",
              bgcolor: "primary.main",
              boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.25)}`,
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            ติดตามสถานะการจัดส่ง
          </Button>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={onNewOrder}
            startIcon={<AddCircleOutline />}
            sx={{
              height: 54,
              borderRadius: "16px",
              fontWeight: 700,
              fontSize: "1rem",
              borderWidth: "2px",
              "&:hover": { borderWidth: "2px" },
            }}
          >
            ส่งพัสดุเพิ่ม (สร้างงานใหม่)
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default OrderConfirmationDialog;
