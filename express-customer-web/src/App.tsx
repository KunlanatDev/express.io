import { useState, useMemo, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, CssBaseline, Checkbox } from "@mui/material";
import { theme } from "./theme"; // New Theme
import MainLayout from "./components/layout/MainLayout";
import CreateOrderPage from "./pages/CreateOrderPage";
import PublicTrackingPage from "./pages/PublicTrackingPage"; // Need to create
import OrdersPage from "./pages/OrdersPage"; // Need to create
import { authService } from "./services/auth";
import { orderService } from "./services/order";
import type { OrderResponse } from "./types";
import legalData from "./data/legalPolicies.json";
import {
  DialogContent,
  TextField,
  Stack,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  Dialog,
  InputAdornment,
} from "@mui/material";
import {
  Close,
  EmailOutlined,
  LockOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined,
  PhoneOutlined,
  Person,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

const AuthDialog = ({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
}) => {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: "16px", p: { xs: 2, sm: 3 }, maxWidth: 440 },
      }}
    >
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "16px",
            bgcolor: "#3960ED",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 2,
            boxShadow: "0px 8px 16px rgba(57, 96, 237, 0.24)",
          }}
        >
          {isRegister ? (
            <Person sx={{ fontSize: "32px" }} />
          ) : (
            <LockOutlined sx={{ fontSize: "32px" }} />
          )}
        </Box>

        <Typography
          variant="h5"
          fontWeight={700}
          gutterBottom
          sx={{ color: "#1A2138" }}
        >
          {isRegister ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          เพื่อดูราคาและยืนยันการสั่งส่งพัสดุ
        </Typography>
      </Box>

      {isRegister ? (
        <RegisterForm
          onClose={onClose}
          onSuccess={onSuccess}
          onSwitch={() => setIsRegister(false)}
        />
      ) : (
        <LoginForm
          onClose={onClose}
          onSuccess={onSuccess}
          onSwitch={() => setIsRegister(true)}
        />
      )}
    </Dialog>
  );
};

const LoginForm = ({
  onClose,
  onSuccess,
  onSwitch,
}: {
  onClose: () => void;
  onSuccess: (token: string) => void;
  onSwitch: () => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      // const res = await authService.login({ email, password });
      // onSuccess(res.access_token);
      onSuccess("success");
      onClose();
    } catch (e: any) {
      setError(e.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent sx={{ p: 0, px: 1 }}>
      <Box
        sx={{
          mb: 3,
          borderRadius: "16px",
          border: "2px solid #D08700",
          bgcolor: "#E0D3CC",
          color: "#854D0E",
          padding: "16px",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          🔒 ป้องกันการเข้าถึงข้อมูลราคา
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, fontSize: "0.85rem" }}>
          กรุณาเข้าสู่ระบบเพื่อดูราคาที่แท้จริงและยืนยันคำสั่ง
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing="16px">
        {/* Email */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ mb: "4px", fontWeight: 700, color: "#1A2138" }}
          >
            อีเมล
          </Typography>
          <TextField
            fullWidth
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              sx: { borderRadius: "8px", height: "48px" },
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlined sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Password */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ mb: "4px", fontWeight: 700, color: "#1A2138" }}
          >
            รหัสผ่าน
          </Typography>
          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              sx: { borderRadius: "8px", height: "48px" },
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? (
                      <VisibilityOffOutlined />
                    ) : (
                      <VisibilityOutlined />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            height: "48px",
            borderRadius: "8px",
            fontSize: "1.05rem",
            fontWeight: 700,
            mt: 1,
            bgcolor: "#3960ED",
            boxShadow: "0 4px 12px rgba(57,96,237,0.3)",
            "&:hover": { bgcolor: "#2e4dc2" },
          }}
        >
          {loading ? "Processing..." : "เข้าสู่ระบบ"}
        </Button>

        <Box textAlign="center" mt={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            💡 Demo: ใช้อีเมลและรหัสผ่านใดก็ได้เพื่อทดลอง
          </Typography>
          <Button
            size="small"
            onClick={() => {
              setEmail("demo@demo.com");
              setPassword("demo123");
            }}
            sx={{
              fontWeight: 600,
              textTransform: "none",
              color: "#3960ED",
              fontSize: "0.9rem",
            }}
          >
            กรอกข้อมูลทดลองให้อัตโนมัติ
          </Button>
        </Box>

        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          mt={1}
          mb={1}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mr: 1, fontSize: "0.95rem" }}
          >
            ยังไม่มีบัญชี?
          </Typography>
          <Typography
            variant="subtitle2"
            color="primary"
            sx={{ cursor: "pointer", fontWeight: 700, fontSize: "0.95rem" }}
            onClick={onSwitch}
          >
            สมัครสมาชิก
          </Typography>
        </Box>
      </Stack>
    </DialogContent>
  );
};

const RegisterForm = ({
  onClose,
  onSuccess,
  onSwitch,
}: {
  onClose: () => void;
  onSuccess: (token: string) => void;
  onSwitch: () => void;
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checked, setChecked] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalType, setLegalType] = useState<"term" | "privacy">("term");

  const handleOpenLegal = (type: "term" | "privacy") => {
    setLegalType(type);
    setLegalOpen(true);
  };

  const handleSubmit = async () => {
    setError("");
    if (!checked) {
      setError("กรุณายอมรับข้อตกลงและเงื่อนไขการใช้บริการ");
      return;
    }
    setLoading(true);
    try {
      await authService.register({
        role: "customer",
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone: "0000000000",
      });

      onSuccess("success");
      onClose();
    } catch (e: any) {
      setError(e.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent sx={{ p: 0, px: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing="16px">
        <Stack direction="row" spacing={2}>
          <Box flex={1}>
            <Typography
              variant="subtitle2"
              sx={{ mb: "4px", fontWeight: 700, color: "#1A2138" }}
            >
              ชื่อ
            </Typography>
            <TextField
              fullWidth
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              InputProps={{ sx: { borderRadius: "8px", height: "48px" } }}
            />
          </Box>

          <Box flex={1}>
            <Typography
              variant="subtitle2"
              sx={{ mb: "4px", fontWeight: 700, color: "#1A2138" }}
            >
              นามสกุล
            </Typography>
            <TextField
              fullWidth
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              InputProps={{ sx: { borderRadius: "8px", height: "48px" } }}
            />
          </Box>
        </Stack>

        {/* Email */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ mb: "4px", fontWeight: 700, color: "#1A2138" }}
          >
            อีเมล
          </Typography>
          <TextField
            fullWidth
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              sx: { borderRadius: "8px", height: "48px" },
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlined sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Phone Number */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ mb: "4px", fontWeight: 700, color: "#1A2138" }}
          >
            เบอร์โทรศัพท์
          </Typography>
          <TextField
            fullWidth
            placeholder="081-234-5678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            InputProps={{
              sx: { borderRadius: "8px", height: "48px" },
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneOutlined sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Password */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ mb: "4px", fontWeight: 700, color: "#1A2138" }}
          >
            รหัสผ่าน
          </Typography>
          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              sx: { borderRadius: "8px", height: "48px" },
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Confirm Password */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ mb: "4px", fontWeight: 700, color: "#1A2138" }}
          >
            ยืนยันรหัสผ่าน
          </Typography>
          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              sx: { borderRadius: "8px", height: "48px" },
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Condition and PDPA */}
        <Box>
          <Box display="flex" alignItems="flex-start">
            <Checkbox
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              inputProps={{ "aria-label": "controlled" }}
              sx={{ p: 0, pt: "2px", mr: 1 }}
            />
            <Typography
              variant="body2"
              sx={{ color: "#1A2138", lineHeight: 1.5 }}
            >
              ฉันยอมรับ{" "}
              <Typography
                component="span"
                variant="body2"
                sx={{
                  color: "#3960ED",
                  cursor: "pointer",
                  fontWeight: 600,
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => handleOpenLegal("term")}
              >
                ข้อตกลงและเงื่อนไขการใช้บริการ
              </Typography>{" "}
              และ{" "}
              <Typography
                component="span"
                variant="body2"
                sx={{
                  color: "#3960ED",
                  cursor: "pointer",
                  fontWeight: 600,
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => handleOpenLegal("privacy")}
              >
                นโยบายความเป็นส่วนตัว
              </Typography>
            </Typography>
          </Box>
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            height: "48px",
            borderRadius: "8px",
            fontSize: "1.05rem",
            fontWeight: 700,
            mt: 1,
            bgcolor: "#3960ED",
            boxShadow: "0 4px 12px rgba(57,96,237,0.3)",
            "&:hover": { bgcolor: "#2e4dc2" },
          }}
        >
          {loading ? "Processing..." : "สมัครสมาชิก"}
        </Button>

        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          mt={1}
          mb={1}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mr: 1, fontSize: "0.95rem" }}
          >
            มีบัญชีอยู่แล้ว?
          </Typography>
          <Typography
            variant="subtitle2"
            color="primary"
            sx={{ cursor: "pointer", fontWeight: 700, fontSize: "0.95rem" }}
            onClick={onSwitch}
          >
            เข้าสู่ระบบ
          </Typography>
        </Box>
      </Stack>

      <Dialog
        open={legalOpen}
        onClose={() => setLegalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", m: 2 } }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          px={3}
          pt={2.5}
          pb={1.5}
        >
          <Typography variant="h6" fontWeight={700}>
            {legalType === "term"
              ? legalData.termsAndConditions.title
              : legalData.privacyPolicy.title}
          </Typography>
          <IconButton
            onClick={() => setLegalOpen(false)}
            size="small"
            sx={{ mr: -1 }}
          >
            <Close />
          </IconButton>
        </Box>
        <DialogContent
          dividers
          sx={{
            p: 3,
            pt: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            bgcolor: "#FAFAFB",
          }}
        >
          <Box mb={-1}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={500}
              sx={{ display: "block" }}
            >
              Version: {legalData.version}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={500}
            >
              Effective Date:{" "}
              {new Date(legalData.effectiveDate).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
          </Box>
          {(legalType === "term"
            ? legalData.termsAndConditions.sections
            : legalData.privacyPolicy.sections
          ).map((sec, idx) => (
            <Box
              key={idx}
              sx={{
                bgcolor: "#FFFFFF",
                p: 2,
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                gutterBottom
                sx={{ color: "#1A2138" }}
              >
                {sec.heading}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#4B5563",
                  whiteSpace: "pre-line",
                  lineHeight: 1.6,
                }}
              >
                {sec.body}
              </Typography>
            </Box>
          ))}
        </DialogContent>
        <Box p={2} pt={2} display="flex" justifyContent="center">
          <Button
            variant="contained"
            fullWidth
            onClick={() => setLegalOpen(false)}
            sx={{
              borderRadius: "8px",
              fontWeight: 700,
              height: "48px",
              bgcolor: "#3960ED",
            }}
          >
            ฉันเข้าใจและรับทราบ
          </Button>
        </Box>
      </Dialog>
    </DialogContent>
  );
};

function App() {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const appTheme = useMemo(() => theme(mode), [mode]);
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [showAuth, setShowAuth] = useState(false);

  // Global Order State (for tracking across pages if needed)
  const [currentOrder, setCurrentOrder] = useState<OrderResponse | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // WebSocket Logic (Simplified)
  useEffect(() => {
    if (!token) return;
    const ws = new WebSocket("ws://localhost:8083/ws"); // Should come from ENV
    ws.onopen = () => console.log("WS Connected");
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WS Msg:", data);

        // If tracking logic matches
        if (currentOrder && data.order_id === currentOrder.id) {
          // Update order status
          if (data.type === "LOCATION_UPDATE") {
            setCurrentOrder((prev) =>
              prev
                ? { ...prev, rider_lat: data.lat, rider_lng: data.lng }
                : null,
            );
          } else {
            // Refresh order fully on status change
            orderService
              .getById(currentOrder.id)
              .then((full) => setCurrentOrder(full));
            setSuccessMsg(`Order status updated: ${data.type}`);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    return () => ws.close();
  }, [token, currentOrder?.id]);

  const handleLogout = () => {
    authService.logout();
    setToken(null);
    setCurrentOrder(null);
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Router>
        <MainLayout
          mode={mode}
          setMode={setMode}
          token={token}
          onLogout={handleLogout}
          onLoginClick={() => setShowAuth(true)}
        >
          <Routes>
            <Route
              path="/"
              element={
                <CreateOrderPage
                  token={token}
                  onRequireAuth={() => setShowAuth(true)}
                  orderResult={currentOrder}
                  setOrderResult={setCurrentOrder}
                  successMsg={successMsg}
                  setSuccessMsg={setSuccessMsg}
                  error={errorMsg}
                  setError={setErrorMsg}
                />
              }
            />
            <Route path="/tracking" element={<PublicTrackingPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </MainLayout>

        <AuthDialog
          open={showAuth}
          onClose={() => setShowAuth(false)}
          onSuccess={(t) => {
            setToken(t);
            setShowAuth(false);
          }}
        />
        {/* <RegisterDialog
          open={showRegister}
          onClose={() => setShowRegister(false)}
          onSuccess={(t) => {
            setToken(t);
            setShowRegister(false);
          }}
        /> */}
      </Router>
    </ThemeProvider>
  );
}

export default App;
