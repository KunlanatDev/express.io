import { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme'; // New Theme
import MainLayout from './components/layout/MainLayout';
import CreateOrderPage from './pages/CreateOrderPage';
import PublicTrackingPage from './pages/PublicTrackingPage'; // Need to create
import OrdersPage from './pages/OrdersPage'; // Need to create
import { authService } from './services/auth';
import { orderService } from './services/order';
import type { OrderResponse } from './types';
import {
  DialogContent, Tab, Tabs, TextField, Stack, Button, Box, Typography, IconButton, Alert, Dialog
} from '@mui/material';
import { Close } from '@mui/icons-material';

// --- AUTH COMPONENT ---
const AuthDialog = ({ open, onClose, onSuccess }: { open: boolean, onClose: () => void, onSuccess: (token: string) => void }) => {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (tab === 1) { // Register
        await authService.register({
          role: 'customer', email, password, first_name: firstName, last_name: lastName, phone: '0000000000'
        });
      }
      const res = await authService.login({ email, password });
      onSuccess(res.access_token);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 2 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6" fontWeight={700}>Sign In</Typography>
        <IconButton onClick={onClose}><Close /></IconButton>
      </Box>
      <DialogContent>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ mb: 3 }}>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack spacing={2}>
          {tab === 1 && (
            <Stack direction="row" spacing={2}>
              <TextField fullWidth label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
              <TextField fullWidth label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
            </Stack>
          )}
          <TextField fullWidth label="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <TextField fullWidth type="password" label="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <Button fullWidth variant="contained" size="large" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Processing...' : (tab === 0 ? 'Login' : 'Create Account')}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
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
    const ws = new WebSocket('ws://localhost:8083/ws'); // Should come from ENV
    ws.onopen = () => console.log('WS Connected');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WS Msg:', data);

        // If tracking logic matches
        if (currentOrder && data.order_id === currentOrder.id) {
          // Update order status
          if (data.type === 'LOCATION_UPDATE') {
            setCurrentOrder(prev => prev ? ({ ...prev, rider_lat: data.lat, rider_lng: data.lng }) : null);
          } else {
            // Refresh order fully on status change
            orderService.getById(currentOrder.id).then(full => setCurrentOrder(full));
            setSuccessMsg(`Order status updated: ${data.type}`);
          }
        }
      } catch (e) { console.error(e); }
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
          mode={mode} setMode={setMode}
          token={token}
          onLogout={handleLogout}
          onLoginClick={() => setShowAuth(true)}
        >
          <Routes>
            <Route path="/" element={
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
            } />
            <Route path="/tracking" element={<PublicTrackingPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </MainLayout>

        <AuthDialog
          open={showAuth}
          onClose={() => setShowAuth(false)}
          onSuccess={(t) => { setToken(t); setShowAuth(false); }}
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;
