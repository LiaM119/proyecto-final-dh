# Turmalin - Plataforma de alojamientos y reservas

Turmalin es una aplicacion web full stack para publicar alojamientos, explorar catalogo, gestionar favoritos y concretar reservas con autenticacion de usuarios y panel de administracion.

## 1. Objetivo del proyecto

El proyecto busca resolver dos necesidades principales:

- Para usuarios finales: descubrir alojamientos, consultar detalle, guardar favoritos, reservar y consultar historial.
- Para administradores: gestionar alojamientos, categorias, caracteristicas y permisos de usuarios desde un panel interno.

## 2. Alcance funcional actual

### Funcionalidades para usuarios

- Registro e inicio de sesion con JWT.
- Listado de alojamientos y vista de detalle.
- Filtro y seleccion de disponibilidad por fechas.
- Creacion de reservas.
- Historial personal de reservas (`/mis-reservas`).
- Gestion de favoritos por usuario.
- Resenas por alojamiento (crear/actualizar/eliminar resena propia).
- Pagina de contacto y boton flotante de WhatsApp.

### Funcionalidades para administradores

- Panel de administracion protegido por rol.
- ABM de alojamientos con carga de imagenes (multipart).
- ABM de tipos/categorias de alojamiento.
- ABM de caracteristicas (amenities).
- Gestion de usuarios y cambio de rol admin/user.

### Funcionalidades en progreso

- Modulo de reservas administrativas (`/administracion/reservas`) aun en estado placeholder de UI.

## 3. Historias de usuario y pendientes

A partir del estado actual del codigo, aun quedan pendientes para completar historias de usuario de gestion integral:

- Gestion administrativa completa de reservas (listar, filtrar, cambiar estado, cancelar).
- Documentar y automatizar escenarios E2E de punta a punta (reserva + email + historial).
- Consolidar cobertura de tests de controladores/repositorios (hoy la mayor parte esta en servicios/validaciones).

## 4. Paleta de colores utilizada

La identidad visual actual del frontend usa una linea oscura con acentos violetas:

- Fondo base: `#0b0d16`
- Fondo secciones secundarias: `#151821`, `#0c1020`, `#050711`
- Fondo cards: `#121833`, `#0d1226`
- Texto principal: `#eef1ff`, `#ffffff`
- Texto secundario: `#b7bedf`, `#a7adbb`
- Acento principal (brand): `#6d5ef3` / `#6e4ff7`
- Acento secundario: `#8c77ff`
- Bordes: `#222736` y `rgba(255,255,255,.12)`

Referencias: `frontend/src/index.css`, `frontend/src/styles/Home.css`, `frontend/src/styles/Header.css`, `frontend/src/styles/Footer.css`.

## 5. Arquitectura general

```text
proyecto-final-dh/
|-- backend/
|   `-- products-api/          # API REST con Spring Boot
|-- frontend/                  # SPA React + Vite
|-- README.md                  # Documentacion principal
`-- assets varios (logo/fondos)
```

### Stack tecnico

- Frontend: React 19, Vite, React Router, Swiper, CSS.
- Backend: Java 17, Spring Boot 3, Spring Security, Spring Data JPA, Validation, Mail.
- Base de datos: H2 en archivo local (`backend/products-api/data/productsdb.mv.db`).
- Autenticacion: JWT Bearer Token.
- Storage de imagenes: carpeta local `backend/products-api/uploads/`.

## 6. Endpoints principales

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Productos y catalogo

- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/products` (admin)
- `PUT /api/products/{id}` (admin)
- `DELETE /api/products/{id}` (admin)

### Categorias y caracteristicas

- `GET /api/categories`
- `POST|PUT|DELETE /api/categories/*` (admin)
- `GET /api/amenities`
- `POST|PUT|DELETE /api/amenities/*` (admin)

### Reservas

- `GET /api/reservables/{id}`
- `GET /api/reservables/{id}/availability`
- `POST /api/reservations`
- `GET /api/reservations/me`
- `GET /api/reservations/available`

### Favoritos y Resenas

- `GET|POST|DELETE /api/favorites/*`
- `GET|POST|DELETE /api/products/{productId}/reviews*`

## 7. Como ejecutar el proyecto localmente

### Requisitos

- Node.js 20+
- npm 10+
- Java 17
- Maven (o `./mvnw` incluido)

### Backend

Ubicacion:

```powershell
cd backend/products-api
```

Ejecucion:

```powershell
./mvnw spring-boot:run
```

El backend queda en `http://localhost:8080`.

### Frontend

Ubicacion:

```powershell
cd frontend
```

Instalar dependencias:

```powershell
npm install
```

Levantar entorno dev:

```powershell
npm run dev
```

El frontend queda en `http://localhost:5173`.

### Variables de entorno

Frontend (`frontend/.env`):

```env
VITE_API_URL=http://localhost:8080
```

Backend (opcional en `.env.properties`):

- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `RESERVATION_EMAIL_ENABLED`

## 8. Como se usa la pagina

### Flujo usuario

1. Entrar al home y explorar alojamientos.
2. Abrir detalle de un alojamiento.
3. Iniciar sesion o registrarse.
4. Seleccionar fechas y confirmar reserva.
5. Revisar reservas en `/mis-reservas`.
6. Guardar o quitar favoritos segun preferencia.

### Flujo administrador

1. Iniciar sesion con usuario admin.
2. Ir a `/administracion`.
3. Gestionar alojamientos, categorias, caracteristicas y usuarios.
4. Usar acciones de alta/edicion/baja desde tablas y formularios.

## 9. Testing actual

El proyecto tiene tests automatizados en backend (JUnit + Mockito), por ejemplo:

- `ProductsApiApplicationTests` (context load)
- `DtoValidationTest` (validaciones DTO)
- `AuthServiceTest` (auth y reglas de negocio)
- `UserManagementServiceTest` (permisos de usuarios)

Comando:

```powershell
cd backend/products-api
./mvnw test
```

## Estado de evidencia de tests

Actualmente no existe en el repositorio un documento formal de evidencia de ejecucion (capturas, fecha/hora, resultado por suite) que respalde el listado de tests mencionado historicamente.

Recomendacion minima para cerrar este gap:

- Crear `docs/testing/test-evidence.md`.
- Adjuntar fecha de corrida, comando ejecutado, salida resumida y capturas/logs.
- Registrar al menos: resultado total, tests fallidos, entorno (SO, Java, Node).

## 10. Scripts utiles

Frontend:

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

Backend:

- `./mvnw spring-boot:run`
- `./mvnw test`

## 11. Riesgos tecnicos y mejoras recomendadas

- Homologar URLs hardcodeadas en frontend para usar siempre `VITE_API_URL`.
- Ampliar test suite con integracion de controladores y repositorios.
- Implementar modulo admin de reservas (hoy en progreso).
- Incorporar pipeline CI para correr lint + tests en cada PR.

## 12. Estado del proyecto

Proyecto funcional para flujo principal de catalogo + autenticacion + reservas + administracion basica, con backlog abierto en gestion avanzada de reservas y formalizacion de evidencia QA.


