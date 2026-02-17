import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function ReservationCheckout() {
  const [params] = useSearchParams();
  const nav = useNavigate();

  const reservableId = params.get("reservableId");
  const start = params.get("start");
  const end = params.get("end");

  const payload = useMemo(() => ({
    reservableId: reservableId ? Number(reservableId) : null,
    startDate: start || null,
    endDate: end || null,
  }), [reservableId, start, end]);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function confirm() {
    setLoading(true);
    setMsg("");
    try {
      await api.createReservation(payload);
      setMsg("✅ Reserva confirmada.");
      setTimeout(() => nav(`/reservables/${reservableId}`), 800);
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>Confirmar reserva</h1>

      <div className="card">
        <p><b>ID:</b> {reservableId}</p>
        <p><b>Desde:</b> {start}</p>
        <p><b>Hasta:</b> {end}</p>

        <button className="btn btn--primary" onClick={confirm} disabled={loading}>
          {loading ? "Confirmando…" : "Confirmar reserva"}
        </button>

        {msg && <p className="muted" style={{ marginTop: 12 }}>{msg}</p>}
      </div>
    </div>
  );
}
