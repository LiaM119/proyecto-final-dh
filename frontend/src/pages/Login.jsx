import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Completa email y contrasena.");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);

      const redirect = searchParams.get("redirect");
      navigate(redirect || "/");
    } catch (err) {
      console.error("Error al iniciar sesion:", err);
      setError("No se pudo iniciar sesion. Verifica email y contrasena.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-wrap">
      <form className="login-card" onSubmit={onSubmit} noValidate>
        <h1 className="login-title">Iniciar sesion</h1>
        <p className="login-subtitle">Accede a tu cuenta para gestionar tus reservas.</p>

        {error && <div className="login-alert">{error}</div>}

        <div className="login-field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="login-field">
          <label htmlFor="login-password">Contrasena</label>
          <input
            id="login-password"
            type="password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>
    </section>
  );
}
