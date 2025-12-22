import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div style={{ padding: 20 }}>
      <h2>¡Hola, {user?.name}!</h2>
      <p>Ya estás identificado. Desde acá vas a poder gestionar tus reservas y tu perfil.</p>
    </div>
  );
}
