import { useEffect, useMemo, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";
import "../styles/SearchBlock.css";

export default function SearchBlock({ products = [], onSearch }) {
  const [q, setQ] = useState("");
  const [range, setRange] = useState(undefined); // { from: Date, to: Date }
  const [openSug, setOpenSug] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const boxRef = useRef(null);

  const norm = (s = "") =>
    s
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const suggestionPool = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p?.name) set.add(p.name);
      if (p?.categoryName) set.add(p.categoryName);
    });
    return Array.from(set);
  }, [products]);

  const suggestions = useMemo(() => {
    const nq = norm(q);
    if (!nq) return [];
    const starts = [];
    const contains = [];
    for (const term of suggestionPool) {
      const nt = norm(term);
      if (!nt) continue;
      if (nt.startsWith(nq)) starts.push(term);
      else if (nt.includes(nq)) contains.push(term);
    }
    return [...starts, ...contains].slice(0, 8);
  }, [q, suggestionPool]);

  useEffect(() => {
    const onDown = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) {
        setOpenSug(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const inRange = (date, from, to) => {
    if (!date) return true;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const f = from ? new Date(from) : null;
    const t = to ? new Date(to) : null;
    if (f) f.setHours(0, 0, 0, 0);
    if (t) t.setHours(0, 0, 0, 0);

    if (f && t) return d >= f && d <= t;
    if (f && !t) return d >= f;
    if (!f && t) return d <= t;
    return true;
  };

  const doSearch = (forcedText) => {
    const text = (forcedText ?? q).trim();
    const nq = norm(text);

    const from = range?.from ?? null;
    const to = range?.to ?? null;

    const results = products
      .map((p) => {
        const hay =
          norm(p?.name).includes(nq) ||
          norm(p?.description).includes(nq) ||
          norm(p?.categoryName).includes(nq);

        let score = 0;
        if (nq) {
          if (norm(p?.name).startsWith(nq)) score += 5;
          if (norm(p?.name).includes(nq)) score += 3;
          if (norm(p?.categoryName).includes(nq)) score += 2;
          if (norm(p?.description).includes(nq)) score += 1;
        } else {
          score = 1; 
        }

        const okDate = p?.createdAt ? inRange(p.createdAt, from, to) : true;

        return { p, hay: nq ? hay : true, okDate, score };
      })
      .filter((x) => x.hay && x.okDate)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.p);

    onSearch?.(results, { q: text, from, to });
    setOpenSug(false);
    setActiveIdx(-1);
  };

  const prettyRange = useMemo(() => {
    if (!range?.from && !range?.to) return "Sin rango";
    const f = range?.from ? format(range.from, "dd/MM/yyyy") : "—";
    const t = range?.to ? format(range.to, "dd/MM/yyyy") : "—";
    return `${f} → ${t}`;
  }, [range]);

  const onKeyDown = (e) => {
    if (!openSug && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      if (suggestions.length) setOpenSug(true);
      return;
    }

    if (openSug) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((v) => Math.min(v + 1, suggestions.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((v) => Math.max(v - 1, 0));
      }
      if (e.key === "Enter" && activeIdx >= 0) {
        e.preventDefault();
        const pick = suggestions[activeIdx];
        setQ(pick);
        doSearch(pick);
      }
      if (e.key === "Escape") {
        setOpenSug(false);
        setActiveIdx(-1);
      }
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      doSearch();
    }
  };

  return (
    <section className="sb" ref={boxRef}>
      <div className="sb__head">
        <h2 className="sb__title">Realizar búsqueda</h2>
        <p className="sb__desc">
          Encontra alojamientos que se ajusten a lo que buscas. Podes filtrar por
          palabra clave y por rango de fechas.
        </p>
      </div>

      <div className="sb__grid">
        <div className="sb__field">
          <label className="sb__label">Alojamiento / tipo</label>
          <div className="sb__inputWrap">
            <input
              className="sb__input"
              value={q}
              placeholder="Ej: suite, doble, spa..."
              onChange={(e) => {
                setQ(e.target.value);
                setOpenSug(true);
                setActiveIdx(-1);
              }}
              onFocus={() => q && setOpenSug(true)}
              onKeyDown={onKeyDown}
            />

            {openSug && suggestions.length > 0 && (
              <div className="sb__sugs" role="listbox">
                {suggestions.map((s, idx) => (
                  <button
                    type="button"
                    key={s + idx}
                    className={
                      "sb__sug " + (idx === activeIdx ? "is-active" : "")
                    }
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => {
                      setQ(s);
                      doSearch(s);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sb__field">
          <label className="sb__label">Fecha (rango)</label>
          <div className="sb__rangeLine">
            <span className="sb__rangePill">{prettyRange}</span>
            <button
              type="button"
              className="sb__ghost"
              onClick={() => setRange(undefined)}
            >
              Limpiar
            </button>
          </div>

          <div className="sb__calendar">
            <DayPicker
              mode="range"
              numberOfMonths={2}
              selected={range}
              onSelect={setRange}
              showOutsideDays
            />
          </div>
        </div>

        <div className="sb__actions">
          <button type="button" className="sb__btn" onClick={() => doSearch()}>
            Realizar búsqueda
          </button>
          <span className="sb__hint">
            Tip: Enter para buscar. Flechas + Enter para elegir sugerencias.
          </span>
        </div>
      </div>
    </section>
  );
}


