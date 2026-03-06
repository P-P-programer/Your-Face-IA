import { useEffect, useState } from "react";
import axios from "axios";
import { getAuthHeader } from "../../lib/session";

export default function AdminTokenRequestsPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/admin/device-token-requests?status=${status}`, {
        headers: { Authorization: getAuthHeader(), Accept: "application/json" },
      });
      setItems(data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    const admin_notes = prompt("Notas (opcional):") || "";
    if (admin_notes === null) return;

    try {
      await axios.post(`/api/admin/device-token-requests/${id}/approve`, { admin_notes }, {
        headers: { Authorization: getAuthHeader(), Accept: "application/json" },
      });
      await load();
      alert("✅ Solicitud aprobada");
    } catch (err) {
      alert("❌ Error al aprobar: " + (err?.response?.data?.message || "Error desconocido"));
    }
  };

  const reject = async (id) => {
    const admin_notes = prompt("Motivo de rechazo:");
    if (!admin_notes) return;

    try {
      await axios.post(`/api/admin/device-token-requests/${id}/reject`, { admin_notes }, {
        headers: { Authorization: getAuthHeader(), Accept: "application/json" },
      });
      await load();
      alert("✅ Solicitud rechazada");
    } catch (err) {
      alert("❌ Error al rechazar: " + (err?.response?.data?.message || "Error desconocido"));
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const statusConfig = {
    pending: { label: "⏳ Pendientes", color: "#f59e0b" },
    approved: { label: "✅ Aprobadas", color: "#10b981" },
    rejected: { label: "❌ Rechazadas", color: "#ef4444" },
    all: { label: "📋 Todas", color: "#8b5cf6" },
  };

  return (
    <div className="panel" style={{ maxWidth: 1000, margin: "0 auto" }}>
      <h1 className="panel-title">🔐 Gestión de Solicitudes de Token ESP32</h1>

      <div style={{ marginBottom: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
        {Object.entries(statusConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setStatus(key)}
            style={{
              background: status === key ? config.color : "#0f172a",
              border: status === key ? `2px solid ${config.color}` : "1px solid #1e293b",
              color: status === key ? "#000" : "#e2e8f0",
              padding: 10,
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.2s",
            }}
          >
            {config.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#94a3b8" }}>Cargando solicitudes...</p>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: 32, background: "#0f172a", borderRadius: 8 }}>
          <p style={{ fontSize: 18, color: "#94a3b8" }}>Sin solicitudes en esta categoría</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((r) => (
            <div
              key={r.id}
              style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: 8,
                padding: 16,
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16 }}>
                <div>
                  <h3 style={{ margin: "0 0 8px 0", color: "#34d399" }}>
                    📱 {r.device_name}
                  </h3>
                  <div style={{ display: "grid", gap: 4, fontSize: 13, color: "#cbd5e1" }}>
                    <p style={{ margin: 0 }}>👤 Usuario: {r.user?.email}</p>
                    <p style={{ margin: 0 }}>💬 Motivo: {r.reason || "No especificado"}</p>
                    <p style={{ margin: 0, color: "#94a3b8" }}>
                      📅 {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {r.status === "pending" && (
                  <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                    <button
                      onClick={() => approve(r.id)}
                      style={{
                        background: "#10b981",
                        color: "#000",
                        padding: "8px 16px",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      ✅ Aprobar
                    </button>
                    <button
                      onClick={() => reject(r.id)}
                      style={{
                        background: "#ef4444",
                        color: "#fff",
                        padding: "8px 16px",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      ❌ Rechazar
                    </button>
                  </div>
                )}
              </div>

              {r.admin_notes && (
                <div style={{ background: "#1e293b", padding: 8, borderRadius: 4, marginTop: 12 }}>
                  <p style={{ margin: "0 0 4px 0", fontSize: 11, color: "#94a3b8" }}>💬 Notas Admin:</p>
                  <p style={{ margin: 0, fontSize: 13, color: "#cbd5e1" }}>{r.admin_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}