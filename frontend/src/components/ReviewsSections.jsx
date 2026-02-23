import { useEffect, useMemo, useState } from "react";
import StarRating from "./StarRating";
import { reviewsApi } from "../api/reviews";

const AUTH_TOKEN_KEY = "turmalin:token";
const isLoggedIn = () => !!localStorage.getItem(AUTH_TOKEN_KEY);

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function normalizeError(err, context = "read") {
  const status = err?.status;
  const msg = err?.message || "Error inesperado";

  if (status === 401) {
    return context === "write"
      ? "Tenés que iniciar sesión para puntuar."
      : "No se pudo obtener el resumen de reseñas.";
  }

  if (status === 403) {
    return context === "write"
      ? "Solo podes puntuar si tenes una reserva de este alojamiento."
      : "No se pudieron cargar las reseñas para este alojamiento.";
  }

  return msg;
}

export default function ReviewsSections({ productId }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [saving, setSaving] = useState(false);

  const logged = isLoggedIn();

  const myReview = useMemo(() => {
    if (!data?.reviews?.length) return null;
    return data.reviews.find((r) => r.mine);
  }, [data]);

  const canWriteReview = useMemo(() => {
    if (!logged) return false;
    if (myReview) return true;
    return data?.canReview === true;
  }, [logged, myReview, data?.canReview]);

  async function load() {
    setLoading(true);
    setErr("");

    try {
      const res = await reviewsApi.getByProduct(productId);
      setData(res);

      const mine = res?.reviews?.find((r) => r.mine);
      if (mine) {
        setMyRating(mine.rating);
        setMyComment(mine.comment || "");
      } else {
        setMyRating(0);
        setMyComment("");
      }
    } catch (e) {
      setErr(normalizeError(e, "read") || "No se pudieron cargar las reseñas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (productId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function saveReview() {
    setErr("");
    if (myRating < 1 || myRating > 5) {
      setErr("Elegí una puntuación (1 a 5).");
      return;
    }

    setSaving(true);
    try {
      await reviewsApi.upsertMine(productId, { rating: myRating, comment: myComment });
      await load();
    } catch (e) {
      if (e?.status === 403) {
        setData((prev) => (prev ? { ...prev, canReview: false } : prev));
      }
      setErr(normalizeError(e, "write") || "No se pudo guardar la reseña");
    } finally {
      setSaving(false);
    }
  }

  async function deleteReview() {
    setErr("");
    setSaving(true);

    try {
      await reviewsApi.deleteMine(productId);
      await load();
    } catch (e) {
      if (e?.status === 403) {
        setData((prev) => (prev ? { ...prev, canReview: false } : prev));
      }
      setErr(normalizeError(e, "write") || "No se pudo borrar tu reseña");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="reviews card">
      <div className="reviewsHead">
        <div>
          <h3 style={{ margin: 0 }}>Valoraciones</h3>

          <div
            style={{
              marginTop: 10,
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <StarRating value={data?.averageRating || 0} readOnly showValue />
            <span style={{ opacity: 0.8 }}>{data?.totalReviews || 0} opinión(es)</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ marginTop: 12, opacity: 0.85 }}>Cargando reseñas...</div>
      ) : (
        <>
          {err && (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,.10)",
                background: "rgba(255,0,0,.07)",
              }}
            >
              {err}
            </div>
          )}

          <div className="reviewsMine" style={{ marginTop: 16 }}>
            <h4 style={{ margin: "0 0 10px 0" }}>Tu reseña</h4>

            {!logged && (
              <div style={{ opacity: 0.8 }}>Iniciá sesión para puntuar y escribir una reseña.</div>
            )}

            {logged && !canWriteReview && (
              <div style={{ opacity: 0.82 }}>
                Solo podes opinar si tenes una reserva confirmada de este alojamiento.
              </div>
            )}

            {logged && canWriteReview && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <StarRating value={myRating} onChange={setMyRating} size={20} />
                  <span style={{ opacity: 0.8 }}>
                    {myRating ? `${myRating}/5` : "Elegí una puntuación"}
                  </span>
                </div>

                <textarea
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  rows={4}
                  placeholder="Escribí tu reseña (opcional)"
                  style={{
                    width: "100%",
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,.10)",
                    background: "rgba(0,0,0,.12)",
                    color: "inherit",
                    resize: "vertical",
                  }}
                />

                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                  <button className="btnPrimary" onClick={saveReview} disabled={saving || myRating < 1}>
                    {saving ? "Guardando..." : myReview ? "Actualizar reseña" : "Publicar reseña"}
                  </button>

                  {myReview && (
                    <button className="btnGhost" onClick={deleteReview} disabled={saving}>
                      Borrar mi reseña
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div style={{ marginTop: 18 }}>
            <h4 style={{ margin: "0 0 10px 0" }}>Reseñas</h4>

            {!data?.reviews?.length ? (
              <div style={{ opacity: 0.8 }}>Todavía no hay reseñas.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.reviews.map((r) => (
                  <article
                    key={r.id}
                    style={{
                      border: "1px solid rgba(255,255,255,.10)",
                      borderRadius: 14,
                      padding: 12,
                      background: "rgba(0,0,0,.10)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <StarRating value={r.rating} readOnly />
                        <strong style={{ opacity: 0.95 }}>{r.userName || r.userEmail}</strong>
                        {r.mine && (
                          <span
                            style={{
                              fontSize: 12,
                              padding: "2px 10px",
                              borderRadius: 999,
                              border: "1px solid rgba(255,255,255,.10)",
                              background: "rgba(109,94,243,.18)",
                            }}
                          >
                            Tu reseña
                          </span>
                        )}
                      </div>
                      <span style={{ opacity: 0.7 }}>{formatDate(r.createdAt)}</span>
                    </div>

                    {r.comment && (
                      <p style={{ margin: "10px 0 0 0", opacity: 0.92, lineHeight: 1.45 }}>
                        {r.comment}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

