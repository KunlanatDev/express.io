import { useState } from "react";
import PromoManagement from "./PromoManagement";
import OrderManagement from "./OrderManagement";

function App() {
  const [tab, setTab] = useState("orders");

  return (
    <div>
      <div style={{ background: "#1e293b", padding: "15px 20px", display: "flex", gap: "20px" }}>
        <h2 style={{ color: "white", margin: 0, marginRight: "40px" }}>Express Admin</h2>
        <button 
          onClick={() => setTab("orders")}
          style={{ background: "transparent", color: tab === "orders" ? "#38bdf8" : "white", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: tab === "orders" ? "bold" : "normal" }}
        >
          Orders
        </button>
        <button 
          onClick={() => setTab("promos")}
          style={{ background: "transparent", color: tab === "promos" ? "#38bdf8" : "white", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: tab === "promos" ? "bold" : "normal" }}
        >
          Promos
        </button>
      </div>

      <div style={{ padding: "20px" }}>
        {tab === "orders" && <OrderManagement />}
        {tab === "promos" && <PromoManagement />}
      </div>
    </div>
  );
}

export default App;
