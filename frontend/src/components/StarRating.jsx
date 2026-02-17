import { Star } from "lucide-react";

export default function StarRating({
  value = 0,      
  onChange,       
  size = 18,
  readOnly = false,
  showValue = false,
}) {
  const editable = !!onChange && !readOnly;

  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5;

  const StarBtn = ({ i }) => {
    const filled = i <= full;
    const half = !filled && hasHalf && i === full + 1;
    const opacity = filled ? 1 : half ? 0.55 : 0.18;

    return (
      <button
        type="button"
        onClick={() => editable && onChange(i)}
        onMouseDown={(e) => e.preventDefault()}
        disabled={!editable}
        aria-label={`${i} estrellas`}
        style={{
          border: "none",
          background: "transparent",
          padding: 0,
          cursor: editable ? "pointer" : "default",
          display: "inline-flex",
        }}
      >
        <Star size={size} style={{ opacity }} />
      </button>
    );
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <StarBtn key={i} i={i} />
        ))}
      </div>

      {showValue && (
        <span style={{ fontSize: 14, opacity: 0.85 }}>
          {Number(value || 0).toFixed(1)}
        </span>
      )}
    </div>
  );
}
