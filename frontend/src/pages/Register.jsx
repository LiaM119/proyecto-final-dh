// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/auth";
import "../styles/Register.css";

const initial = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirm: "",
  accept: false,
};

export default function Register() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const rules = {
    firstName: (v) =>
      !v ? "Ingresa tu nombre" : v.length < 2 ? "Mínimo 2 caracteres" : "",
    lastName: (v) =>
      !v ? "Ingresa tu apellido" : v.length < 2 ? "Mínimo 2 caracteres" : "",
    email: (v) =>
      !v
        ? "Ingresa tu email"
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        ? "Email inválido"
        : "",
    password: (v) => {
      if (!v) return "Ingresa una contraseña";
      if (v.length < 8) return "Mínimo 8 caracteres";
      if (!/[a-z]/.test(v) || !/[A-Z]/.test(v) || !/\d/.test(v))
        return "Debe incluir mayúscula, minúscula y número";
      return "";
    },
    confirm: (v, f) => (v !== f.password ? "Las contraseñas no coinciden" : ""),
    accept: (v) => (!v ? "Debes aceptar los términos" : ""),
  };

  const validateAll = (f = form) => {
    const e = {};
    Object.entries(rules).forEach(([k, fn]) => {
      const msg = fn(f[k], f);
      if (msg) e[k] = msg;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    const v = type === "checkbox" ? checked : value;
    const next = { ...form, [name]: v };
    setForm(next);
    const msg = rules[name]?.(v, next);
    setErrors((prev) => ({ ...prev, [name]: msg || undefined }));
  };

const onSubmit = async (e) => {
  e.preventDefault();
  setServerError("");
  if (!validateAll()) return;

  setLoading(true);
  try {
    await authApi.register({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
    });

    navigate("/login", { state: { justRegistered: true } });
  } catch (err) {
    setServerError(err.message || "No se pudo registrar");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="register-wrap">
      <form className="register-card" onSubmit={onSubmit} noValidate>
        <h1 className="register-title">Crear cuenta</h1>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <div className="grid-two">
          <div className="field">
            <label>Nombre</label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={onChange}
              autoComplete="given-name"
            />
            {errors.firstName && <p className="err">{errors.firstName}</p>}
          </div>

          <div className="field">
            <label>Apellido</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={onChange}
              autoComplete="family-name"
            />
            {errors.lastName && <p className="err">{errors.lastName}</p>}
          </div>
        </div>

        <div className="field">
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
          />
          {errors.email && <p className="err">{errors.email}</p>}
        </div>

        <div className="grid-two">
          <div className="field">
            <label>Contraseña</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              autoComplete="new-password"
            />
            {errors.password && <p className="err">{errors.password}</p>}
            <small className="hint">
              8+ caracteres, mayúscula, minúscula y número.
            </small>
          </div>

          <div className="field">
            <label>Confirmar contraseña</label>
            <input
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={onChange}
              autoComplete="new-password"
            />
            {errors.confirm && <p className="err">{errors.confirm}</p>}
          </div>
        </div>

        <label className="check">
          <input
            type="checkbox"
            name="accept"
            checked={form.accept}
            onChange={onChange}
          />
          <span>Acepto los términos y condiciones</span>
        </label>
        {errors.accept && <p className="err">{errors.accept}</p>}

        <button className="btn-primary" disabled={loading}>
          {loading ? "Creando..." : "Crear cuenta"}
        </button>

        <p className="swap">
          ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </form>
    </div>
  );
}
