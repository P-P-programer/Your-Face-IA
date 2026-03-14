import { useEffect, useState } from "react";
import axios from "axios";
import { getAuthHeader } from "../../lib/session";

export default function AdminRevocationRequestsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const normalizeRows = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/revocation-requests?status=pending", {
        headers: { Authorization: getAuthHeader(), Accept: "application/json" },
      });
      setItems(normalizeRows(data));
    } catch (err) {
      console.error("Admin revocation-requests error:", err?.response?.status, err?.response?.data);
      setItems([]);
      alert(err?.response?.data?.message || "No se pudieron cargar las revocaciones");
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    const admin_notes = prompt("Notas (opcional):") || "";
    if (admin_notes === null) return;

    try {
      await axios.post(`/api/admin/revocation-requests/${id}/approve`, { admin_notes }, {
        headers: { Authorization: getAuthHeader(), Accept: "application/json" },
      });
      await load();
      alert("✅ Revocación aprobada");
    } catch (err) {
      alert("❌ Error: " + (err?.response?.data?.message || "Error desconocido"));
    }
  };

  const reject = async (id) => {
    const admin_notes = prompt("Motivo de rechazo:");
    if (!admin_notes) return;

    try {
      await axios.post(`/api/admin/revocation-requests/${id}/reject`, { admin_notes }, {
        headers: { Authorization: getAuthHeader(), Accept: "application/json" },
      });
      await load();
      alert("✅ Revocación rechazada");
    } catch (err) {
      alert("❌ Error: " + (err?.response?.data?.message || "Error desconocido"));
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="panel" style={{ maxWidth: 1000, margin: "0 auto" }}>
      <h1 className="panel-title">🔓 Solicitudes de Revocación de Tokens</h1>

      {loading ? (
        <p style={{ textAlign: "center", color: "#94a3b8" }}>Cargando solicitudes...</p>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: 32, background: "#0f172a", borderRadius: 8 }}>
          <p style={{ fontSize: 18, color: "#94a3b8" }}>✅ No hay solicitudes pendientes</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((r) => (
            <div
              key={r.id}
              style={{
                background: "#0f172a",
                border: "2px solid #ef4444",
                borderRadius: 8,
                padding: 16,
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16 }}>
                <div>
                  <h3 style={{ margin: "0 0 8px 0", color: "#ef4444" }}>
                    ⚠️ Revocación de Token
                  </h3>
                  <div style={{ display: "grid", gap: 4, fontSize: 13, color: "#cbd5e1" }}>
                    <p style={{ margin: 0 }}>👤 Usuario: {r.user?.email}</p>
                    <p style={{ margin: 0 }}>🔑 Token: {r.api_token?.name}</p>
                    <p style={{ margin: 0 }}>📝 Motivo: {r.reason}</p>
                    <p style={{ margin: 0, color: "#94a3b8" }}>
                      📅 {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}