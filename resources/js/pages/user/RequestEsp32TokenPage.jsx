import { useEffect, useState } from "react";
import axios from "axios";
import { getAuthHeader } from "../../lib/session";

export default function RequestEsp32TokenPage() {
  const [deviceName, setDeviceName] = useState("");
  const [reason, setReason] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadMyRequests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/device-tokens/my-requests", {
        headers: { Authorization: getAuthHeader(), Accept: "application/json" },
      });
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    if (!deviceName.trim()) return;

    setSubmitting(true);
    try {
      await axios.post(
        "/api/device-tokens/request",
        { device_name: deviceName, reason },
        { headers: { Authorization: getAuthHeader(), Accept: "application/json" } }
      );
      setDeviceName("");
      setReason("");
      await loadMyRequests();
    } catch (err) {
      alert(err?.response?.data?.message || "Error al enviar solicitud");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadMyRequests();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      approved: "#10b981",
      rejected: "#ef4444",
    };
    return colors[status] || "#64748b";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "⏳ Pendiente",
      approved: "✅ Aprobado",
      rejected: "❌ Rechazado",
    };
    return labels[status] || status;
  };

  return (
    <div className="panel" style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1 className="panel-title">Solicitar Token ESP32</h1>

      <div style={{ background: "#0f172a", padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <h3 style={{ marginTop: 0, color: "#34d399" }}>📝 Nueva Solicitud</h3>
        <form onSubmit={submitRequest} style={{ display: "grid", gap: 12 }}>
          <div>
            <label className="input-label" htmlFor="deviceName">
              Nombre del Dispositivo *
            </label>
            <input
              id="deviceName"
              className="input"
              type="text"
              placeholder="ej: ESP32 Sala, ESP32 Entrada"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="input-label" htmlFor="reason">
              Motivo (opcional)
            </label>
            <textarea
              id="reason"
              className="input"
              placeholder="ej: Seguridad del hogar, Detección de intrusos"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              style={{ resize: "vertical" }}
            />
          </div>

          <button
            disabled={submitting || !deviceName.trim()}
            className="button"
            style={{
              background: submitting ? "#64748b" : "#10b981",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "📤 Enviando..." : "✉️ Enviar Solicitud"}
          </button>
        </form>
      </div>

      <div style={{ marginTop: 32 }}>
        <h3 style={{ color: "#34d399", marginBottom: 16 }}>📋 Mis Solicitudes</h3>

        {loading ? (
          <p style={{ textAlign: "center", color: "#94a3b8" }}>Cargando solicitudes...</p>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: 24, background: "#0f172a", borderRadius: 8 }}>
            <p style={{ color: "#94a3b8" }}>No hay solicitudes aún</p>
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                  <div>
                    <h4 style={{ margin: "0 0 4px 0", color: "#e2e8f0" }}>{r.device_name}</h4>
                    <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>ID: {r.id}</p>
                  </div>
                  <span
                    style={{
                      background: getStatusColor(r.status),
                      color: "#000",
                      padding: "4px 12px",
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  >
                    {getStatusLabel(r.status)}
                  </span>
                </div>

                {r.reason && (
                  <div style={{ marginBottom: 8 }}>
                    <p style={{ margin: "0 0 4px 0", fontSize: 12, color: "#94a3b8" }}>📌 Motivo:</p>
                    <p style={{ margin: 0, color: "#cbd5e1" }}>{r.reason}</p>
                  </div>
                )}

                {r.admin_notes && (
                  <div style={{ background: "#1e293b", padding: 8, borderRadius: 4, marginTop: 8 }}>
                    <p style={{ margin: "0 0 4px 0", fontSize: 12, color: "#94a3b8" }}>💬 Notas del Admin:</p>
                    <p style={{ margin: 0, color: "#cbd5e1" }}>{r.admin_notes}</p>
                  </div>
                )}

                <div style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}>
                  📅 Solicitado: {new Date(r.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}