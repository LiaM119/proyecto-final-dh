// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Completá email y contraseña.");
      return;
    }

    try {
      setLoading(true);

      await login(email, password);

      navigate("/");
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("No se pudo iniciar sesión. Verificá email y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 520, marginTop: 40 }}>
      <h1>Iniciar sesión</h1>
      <p>Accedé a tu cuenta para gestionar tus compras.</p>

      {error && (
        <div className="alert error" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
        <div className="row">
          <label>Email</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="row">
          <label>Contraseña</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <div className="actions" style={{ marginTop: 12 }}>
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
