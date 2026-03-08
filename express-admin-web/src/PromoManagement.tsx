import { useState, useEffect } from "react";

interface Promo {
  id: string;
  code: string;
  discount: number;
  description: string;
  is_active: boolean;
}

const API_URL =
  import.meta.env.VITE_EXPRESS_SERVICE_URL || "http://localhost:8082/api/v1";

export default function PromoManagement() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState(0);
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const res = await fetch(`${API_URL}/promos`);
      if (res.ok) {
        const data = await res.json();
        setPromos(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch(`${API_URL}/promos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode,
          discount: newDiscount,
          description: newDesc,
          is_active: true,
        }),
      });
      if (res.ok) {
        setNewCode("");
        setNewDiscount(0);
        setNewDesc("");
        fetchPromos();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (promo: Promo) => {
    try {
      const res = await fetch(`${API_URL}/promos/${promo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...promo,
          is_active: !promo.is_active,
        }),
      });
      if (res.ok) {
        fetchPromos();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Promotion Management (Admin)</h1>

      <div
        style={{
          background: "#f5f5f5",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3>Create New Promo</h3>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <input
            placeholder="Code (e.g. PROMO10)"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            style={{ padding: "8px" }}
          />
          <input
            type="number"
            placeholder="Discount Amount (THB)"
            value={newDiscount}
            onChange={(e) => setNewDiscount(Number(e.target.value))}
            style={{ padding: "8px" }}
          />
        </div>
        <input
          placeholder="Description"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          style={{ padding: "8px", width: "100%", marginBottom: "10px" }}
        />
        <button
          onClick={handleCreate}
          style={{
            background: "#2563EB",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Add Promo
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#eee", textAlign: "left" }}>
            <th style={{ padding: "10px" }}>Code</th>
            <th style={{ padding: "10px" }}>Discount(THB)</th>
            <th style={{ padding: "10px" }}>Description</th>
            <th style={{ padding: "10px" }}>Status</th>
            <th style={{ padding: "10px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {promos.map((p) => (
            <tr key={p.id} style={{ borderBottom: "1px solid #ccc" }}>
              <td style={{ padding: "10px", fontWeight: "bold" }}>{p.code}</td>
              <td style={{ padding: "10px" }}>{p.discount}</td>
              <td style={{ padding: "10px" }}>{p.description}</td>
              <td style={{ padding: "10px" }}>
                <span style={{ color: p.is_active ? "green" : "red" }}>
                  {p.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td style={{ padding: "10px" }}>
                <button onClick={() => toggleStatus(p)}>
                  {p.is_active ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
