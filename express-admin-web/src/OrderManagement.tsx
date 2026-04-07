import { useState, useEffect } from "react";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_price: number;
  created_at: string;
  pickup_address: { address: string };
  delivery_address: { address: string };
  service_type: string;
}

const API_URL = import.meta.env.VITE_EXPRESS_SERVICE_URL || "http://localhost:8082/api/v1";

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    switch(status) {
      case "pending": return "#f59e0b"; // amber
      case "matched": return "#3b82f6"; // blue
      case "picked_up": return "#8b5cf6"; // purple
      case "delivered": return "#10b981"; // green
      case "completed": return "#059669"; // dark green
      case "cancelled": return "#ef4444"; // red
      default: return "#6b7280"; // gray
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Order Management (Admin)</h1>
        <button 
          onClick={fetchOrders}
          style={{ background: "#2563EB", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "4px", cursor: "pointer" }}
        >
          Refresh Orders
        </button>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div style={{ overflowX: "auto", background: "#fff", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "12px 16px", color: "#475569" }}>Order No.</th>
                <th style={{ padding: "12px 16px", color: "#475569" }}>Date</th>
                <th style={{ padding: "12px 16px", color: "#475569" }}>Type</th>
                <th style={{ padding: "12px 16px", color: "#475569" }}>Pickup</th>
                <th style={{ padding: "12px 16px", color: "#475569" }}>Dropoff</th>
                <th style={{ padding: "12px 16px", color: "#475569" }}>Price</th>
                <th style={{ padding: "12px 16px", color: "#475569" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: "1px solid #e2e8f0", background: "white" }}>
                    <td style={{ padding: "12px 16px", fontWeight: "600", color: "#1e293b" }}>{order.order_number}</td>
                    <td style={{ padding: "12px 16px", color: "#475569" }}>{new Date(order.created_at).toLocaleString('th-TH')}</td>
                    <td style={{ padding: "12px 16px", color: "#475569", textTransform: "capitalize" }}>{order.service_type}</td>
                    <td style={{ padding: "12px 16px", color: "#475569", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {order.pickup_address?.address || "-"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#475569", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {order.delivery_address?.address || "-"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#475569", fontWeight: "500" }}>฿{order.total_price}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ 
                        background: `${statusColor(order.status)}20`, 
                        color: statusColor(order.status),
                        padding: "4px 8px", 
                        borderRadius: "999px",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        textTransform: "uppercase"
                      }}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
