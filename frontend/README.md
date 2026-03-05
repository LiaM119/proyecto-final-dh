# Frontend Turmalin

Este modulo contiene la aplicacion web de Turmalin desarrollada con React + Vite.

## Tecnologias

- React 19
- Vite
- React Router
- Swiper
- CSS modular por pantalla/componente

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Instalacion

```bash
npm install
```

## Ejecucion en desarrollo

```bash
npm run dev
```

La app se levanta por defecto en `http://localhost:5173`.

## Variables de entorno

Crear archivo `.env` en esta carpeta (`frontend/.env`):

```env
VITE_API_URL=http://localhost:8080
```

## Scripts disponibles

- `npm run dev`: levanta entorno local con recarga en caliente.
- `npm run build`: genera build de produccion.
- `npm run preview`: sirve localmente el build generado.
- `npm run lint`: ejecuta reglas de ESLint.

## Estructura principal

```text
frontend/
|-- src/
|   |-- api/           # clientes HTTP y servicios
|   |-- components/    # componentes de UI
|   |-- context/       # estado global (auth, favoritos)
|   |-- pages/         # paginas y vistas
|   |-- routes/        # rutas protegidas
|   `-- styles/        # estilos CSS
|-- public/
`-- vite.config.js
```

## Flujos cubiertos

- Home y catalogo de alojamientos.
- Detalle de alojamiento.
- Login y registro.
- Favoritos.
- Reserva y confirmacion.
- Historial de reservas.
- Panel de administracion (segun rol).

## Documentacion general

Para arquitectura completa del proyecto, backend, endpoints y testing, revisar el README raiz:

- `../README.md`
