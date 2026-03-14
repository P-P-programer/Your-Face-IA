import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getAuthHeader } from "../../lib/session";

export default function TokenRevocationsPage() {
  const [devices, setDevices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const normalizeRows = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [devicesRes, reqRes] = await Promise.all([
        axios.get("/api/tokens/my-tokens", {
          headers: { Authorization: getAuthHeader(), Accept: "application/json" },
        }),
        axios.get("/api/tokens/my-revocation-requests", {
          headers: { Authorization: getAuthHeader(), Accept: "application/json" },
        }),
      ]);

      setDevices(normalizeRows(devicesRes.data));
      setRequests(normalizeRows(reqRes.data));
    } catch (e) {
      console.error("TokenRevocations load error:", e?.response?.status, e?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const { active, revoked } = useMemo(() => {
    const a = [];
    const r = [];
    for (const d of devices) {
      const isRevoked = d.status === "revoked" || d.token_status === "revoked" || !!d.revoked_at;
      if (isRevoked) r.push(d);
      else a.push(d);
    }
    return { active: a, revoked: r };
  }, [devices]);

  const requestRevocation = async (device) => {
    const reason = window.prompt("Motivo de revocación:");
    if (!reason?.trim()) return;

    const apiTokenId = device.api_token_id ?? device.token_id ?? device.id;

    try {
      await axios.post(
        "/api/tokens/revoke-request",
        { api_token_id: apiTokenId, reason: reason.trim() },
        { headers: { Authorization: getAuthHeader(), Accept: "application/json" } }
      );
      await loadData();
      alert("Solicitud enviada");
    } catch (err) {
      alert("❌ " + (err?.response?.data?.message || "No se pudo enviar la solicitud"));
    }
  };

  return (
    <div className="panel" style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 className="panel-title">Revocar Tokens</h1>

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Cargando...</p>
      ) : (
        <>
          <section style={{ marginBottom: 24 }}>
            <h3>🟢 Activos ({active.length})</h3>
            {active.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>No hay tokens activos.</p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {active.map((d) => (
                  <div key={d.id} style={{ border: "1px solid #1e293b", borderRadius: 8, padding: 12 }}>
                    <strong>{d.device_name || d.name || `Dispositivo #${d.id}`}</strong>
                    <div style={{ marginTop: 8 }}>
                      <button className="button" onClick={() => requestRevocation(d)}>
                        Solicitar revocación
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3>🔴 Revocados ({revoked.length})</h3>
            {revoked.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>No hay tokens revocados.</p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {revoked.map((d) => (
                  <div key={d.id} style={{ border: "1px solid #7f1d1d", borderRadius: 8, padding: 12 }}>
                    <strong>{d.device_name || d.name || `Dispositivo #${d.id}`}</strong>
                    <p style={{ margin: "6px 0 0", color: "#fca5a5" }}>Estado: Revocado</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section style={{ marginTop: 24 }}>
            <h3>📋 Mis solicitudes de revocación</h3>
            {requests.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>Sin solicitudes.</p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {requests.map((r) => (
                  <div key={r.id} style={{ border: "1px solid #1e293b", borderRadius: 8, padding: 12 }}>
                    <strong>{r.api_token?.name || `Token #${r.api_token_id}`}</strong>
                    <p style={{ margin: "4px 0", color: "#cbd5e1" }}>{r.reason}</p>
                    <small style={{ color: "#94a3b8" }}>Estado: {r.status}</small>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}