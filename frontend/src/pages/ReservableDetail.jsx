import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import { api } from "../services/api";

export default function ReservableDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [range, setRange] = useState({ start: null, end: null });

  useEffect(() => {
    let mounted = true;
    setError("");
    api.getReservable(id)
      .then((data) => mounted && setItem(data))
      .catch((e) => mounted && setError(e.message));
    return () => { mounted = false; };
  }, [id]);

  function goReserve() {
    if (!range.start || !range.end) return;
    nav(`/reservas?reservableId=${id}&start=${range.start}&end=${range.end}`);
  }

  if (error) return <div className="page"><p>❌ {error}</p></div>;
  if (!item) return <div className="page"><p>Cargando…</p></div>;

  return (
    <div className="page">
      <div className="detail">
        <div className="detail__info">
          <span className="pill">{item.type === "SERVICE" ? "Servicio" : "Producto"}</span>
          <h1>{item.name}</h1>
          <p className="muted">{item.description}</p>
        </div>

        <div className="detail__calendar">
          <AvailabilityCalendar
            reservableId={Number(id)}
            onRangeChange={setRange}
          />

          <button
            className="btn btn--primary"
            onClick={goReserve}
            disabled={!range.start || !range.end}
            title={!range.start || !range.end ? "Seleccioná un rango primero" : "Ir a reservar"}
          >
            Ir a reservar
          </button>
        </div>
      </div>
    </div>
  );
}
