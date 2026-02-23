import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { reservationsApi } from "../api/reservations";

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export default function AvailabilityCalendar({ reservableId, onRangeChange }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [occupiedSet, setOccupiedSet] = useState(new Set());
  const [range, setRange] = useState(undefined);

  const from = useMemo(() => new Date(), []);
  const to = useMemo(() => addDays(new Date(), 120), []);

  const disabledDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (day) => {
      const d = new Date(day);
      d.setHours(0, 0, 0, 0);
      const key = toISO(d);
      return d < today || occupiedSet.has(key);
    };
  }, [occupiedSet]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await reservationsApi.getAvailability(reservableId, toISO(from), toISO(to));
      setOccupiedSet(new Set((data.occupiedDates || []).map(String)));
    } catch (e) {
      setError(e.message || "No se pudo cargar la disponibilidad");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!reservableId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservableId]);

  const modifiers = useMemo(() => {
    // marcamos ocupadas como modifier (para pintarlas)
    const occupiedDates = Array.from(occupiedSet).map((iso) => new Date(iso));
    return { occupied: occupiedDates };
  }, [occupiedSet]);

  const modifiersStyles = useMemo(() => {
    return {
      occupied: {
        opacity: 0.45,
        textDecoration: "line-through",
        border: "1px solid rgba(255,255,255,.18)",
      },
    };
  }, []);

  function handleSelect(nextRange) {
    setRange(nextRange);
    if (onRangeChange) {
      const start = nextRange?.from ? toISO(nextRange.from) : null;
      const end = nextRange?.to ? toISO(nextRange.to) : null;
      onRangeChange({ start, end });
    }
  }

  return (
    <div className="cal">
      <div className="cal__header">
        <h3>Disponibilidad</h3>
        <div className="cal__legend">
          <span className="dot dot--free" /> Disponible
          <span className="dot dot--busy" /> Ocupado
        </div>
      </div>

      {error && (
        <div className="cal__error">
          <p>❌ {error}</p>
          <button className="btn" onClick={load}>Reintentar</button>
        </div>
      )}

      {!error && loading && <p className="cal__loading">Cargando fechas…</p>}

      {!error && !loading && (
        <DayPicker
          mode="range"
          numberOfMonths={2}
          selected={range}
          onSelect={handleSelect}
          disabled={disabledDays}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          fromMonth={from}
        />
      )}
    </div>
  );
}
