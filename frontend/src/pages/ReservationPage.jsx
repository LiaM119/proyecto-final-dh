import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { reservationsApi } from "../api/reservations";

const AUTH_TOKEN_KEY = "turmalin:token";

export default function ReservationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [range, setRange] = useState();
  const [disabledDays, setDisabledDays] = useState([]);
  const [loading, setLoading] = useState(true);

  const logged = !!localStorage.getItem(AUTH_TOKEN_KEY);

  useEffect(() => {
    if (!logged) {
      navigate("/login?redirect=/reservation/" + id);
      setLoading(false);
      return;
    }

    reservationsApi
      .getByReservable(id)
      .then((list) => {
        const reserved = (list || []).map((r) => ({
          from: new Date(r.startDate),
          to: new Date(r.endDate),
        }));
        setDisabledDays(reserved);
      })
      .finally(() => setLoading(false));
  }, [id, logged, navigate]);

  const handleReserve = async () => {
    if (!range?.from || !range?.to) return;

    try {
      await reservationsApi.createReservation({
        reservableId: Number(id),
        startDate: range.from.toISOString().split("T")[0],
        endDate: range.to.toISOString().split("T")[0],
      });

      alert("Reserva creada correctamente");
      navigate("/");
    } catch {
      alert("Fechas no disponibles");
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div style={{ padding: "40px" }}>
      <h2>Seleccionar fechas</h2>

      <DayPicker
        mode="range"
        selected={range}
        onSelect={setRange}
        disabled={disabledDays}
      />

      <div style={{ marginTop: 20 }}>
        {range?.from && range?.to && (
          <p>
            Desde: {range.from.toLocaleDateString()} - Hasta:{" "}
            {range.to.toLocaleDateString()}
          </p>
        )}

        <button onClick={handleReserve}>
          Confirmar reserva
        </button>
      </div>
    </div>
  );
}
