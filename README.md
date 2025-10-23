# 🧭 Sprint 1 — Entregables

---

## 🟣 01. Documentación / Bitácora  
**Rol:** Scrum Master  

### 🧩 Definición del proyecto  
**Nombre:** **Turmalin**  
**Tipo:** Plataforma web de servicio técnico y venta de productos tecnológicos.  
**Descripción general:**  
Turmalin es una aplicación web full stack desarrollada con **Java Spring Boot (backend)** y **React + Vite (frontend)**.  
Su objetivo es ofrecer una **plataforma de reservas y administración de servicios técnicos de PC**, además de una sección de catálogo de productos tecnológicos.  

### 🎯 Objetivo del proyecto  
Crear una herramienta que permita:
- A los usuarios: visualizar productos, acceder a información de servicios y contactarse con el negocio.  
- A los administradores: gestionar productos (crear, listar, editar y eliminar) mediante un panel interno.

### 💡 Solución que se desarrolla  
- Un **sitio responsive y moderno** donde se integran servicios y productos.  
- Sistema de **ABM (Alta, Baja, Modificación)** de productos conectado al backend mediante API REST.  
- Manejo de imágenes de productos con almacenamiento en servidor.  
- Estructura base para incorporar módulos futuros: reservas, login, dashboard, etc.

---

## 🟠 02. Diseño de identidad de marca  
**Rol:** Referente UX/UI  

### 🎨 Logo y nombre  
**Nombre de marca:** **Turmalin**  
Inspirado en la piedra *turmalina*, símbolo de protección y energía, transmite seguridad y tecnología.  
El logo está compuesto por:
- Ícono geométrico tipo cristal (forma de turmalina).  
- Tipografía moderna sans-serif.  
- Colores principales oscuros con acento violeta, representando profesionalismo y tecnología.

### 🎨 Paleta de colores  
| Rol | Color | Hex |
|------|--------|------|
| Fondo principal | Azul oscuro / negro profundo | `#0d0f14` |
| Superficie | Gris azulado oscuro | `#151821` |
| Texto | Blanco puro | `#ffffff` |
| Acento principal | Violeta | `#6e4ff7` |
| Acento secundario | Lila claro | `#8f7bff` |
| Líneas y bordes | Gris profundo | `#222736` |

> Estos colores se aplican en todo el sitio, incluyendo el header fijo, botones, y fondo del hero principal.  
> El diseño mantiene una estética **oscura, limpia y profesional**, alineada con el rubro tecnológico.

---

## 🟣 03. Planificación y ejecución de los tests  
**Rol:** Team Leader Testing  

### 🔍 Casos de prueba (basados en historias de usuario)

| ID | Historia de usuario | Caso de prueba | Resultado esperado |
|----|----------------------|----------------|--------------------|
| T1 | Como administrador quiero ver todos los productos disponibles | Acceder a `/administracion/productos` | Se muestra la tabla con ID, Nombre y Acciones |
| T2 | Como administrador quiero eliminar un producto | Hacer clic en “Eliminar” en la tabla | El producto desaparece de la lista y se elimina del backend |
| T3 | Como administrador quiero agregar un nuevo producto | Navegar a `/admin/productos/nuevo` y completar formulario | El producto se guarda y aparece en el listado |
| T4 | Como usuario quiero ver el detalle de un producto | Entrar a `/productos/:id` | Se muestra imagen, descripción, precio y stock |

### 🧪 Ejecución de los tests
- Los endpoints `/api/products` y `/api/products/{id}` fueron verificados con **Postman**.  
- El listado de productos fue probado en el navegador mediante el componente React `AdminProductsList.jsx`.  
- Se verificó que el frontend consuma correctamente la API con respuesta JSON.  
- En caso de error (por ejemplo, servidor caído o sin JSON válido), se muestra mensaje en consola con estado HTTP.

---

## 🟣 04. Actualizar repositorio  
**Roles actuales:** TL Frontend, TL Backend, TL BBDD, TL Infra  

### 📂 Repositorio público  
Todo el código está alojado en el repositorio:  
> `https://github.com/LiamRomero/proyecto-final-dh`

### 🗂️ Estructura general
```
proyecto-final-dh/
├── backend/
│   └── products-api/
│       ├── src/main/java/com/turmalin/productsapi
│       │   ├── config/
│       │   ├── product/
│       │   ├── storage/
│       │   └── ProductsApiApplication.java
│       └── src/main/resources/
│           ├── static/
│           └── application.properties
└── frontend/
    └── src/
        ├── api/
        ├── components/
        ├── pages/admin/
        ├── styles/
        ├── assets/
        └── App.jsx
```

### 💾 Detalles técnicos
- **Frontend:** React + Vite, CSS puro, Swiper.js.  
- **Backend:** Spring Boot + Maven + H2 (o MySQL en despliegue).  
- **Endpoints:** `/api/products`, `/api/products/{id}`, `/api/products/check-name`.  
- **Control de versiones:** Git con ramas dedicadas (por ejemplo, `carrousel-home`, `panel-admin`, etc.).  
