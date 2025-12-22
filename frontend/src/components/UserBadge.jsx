import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

function initialsFrom(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || "")
    .join("");
}

export default function UserBadge() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const initials = useMemo(() => initialsFrom(user?.name), [user?.name]);

  if (!user) return null;

  return (
    <div className="user-badge" onMouseLeave={() => setOpen(false)}>
      <button className="user-chip" onClick={() => setOpen(o => !o)} aria-label="Cuenta">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="user-avatar" />
        ) : (
          <div className="user-avatar initials">{initials}</div>
        )}
        <span className="user-name">{user.name}</span>
      </button>

      {open && (
        <div className="user-menu">
          <button onClick={logout}>Salir</button>
        </div>
      )}
    </div>
  );
}
