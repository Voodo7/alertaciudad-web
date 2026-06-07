# AlertaCiudad · Web

Portal administrativo y API REST del sistema **AlertaCiudad** — reporte ciudadano
de incidencias urbanas. La app móvil Android consume la API REST expuesta bajo
`/api`.

Construido con **Next.js 15 (App Router) + TypeScript**, **Prisma ORM + PostgreSQL
(Neon)**, **Tailwind CSS** y componentes estilo **shadcn/ui**, con **modo claro y
oscuro**. Listo para desplegar en **Vercel**.

---

## ✨ Características

- **Portal administrativo** con login, sidebar + topbar, tablas, formularios en
  modal y badges de color por estado.
- **Dashboard** con tarjetas de resumen (total, por estado, por categoría) y
  reportes recientes.
- **Mantenimiento CRUD** de todas las tablas: Usuario, Categoría, Zona, Estado,
  Reporte, Historial y Administrador.
- Al **cambiar el estado** de un reporte se crea automáticamente un registro en
  `HistorialReporte`.
- **API REST** con CORS habilitado para la app móvil.
- Paleta de la app: primario `#4F46E5`, secundario `#00C2A8`, acento `#FF5A5F`.
  Estados: pendiente `#F59E0B`, en proceso `#3B82F6`, resuelto `#10B981`.

---

## 🚀 Puesta en marcha

### 1. Requisitos

- Node.js 18.18+ (recomendado 20 o 22)
- Una base de datos PostgreSQL (por ejemplo, [Neon](https://neon.tech))

### 2. Instalar dependencias

```bash
npm install
```

### 3. Variables de entorno

Copia la plantilla y rellena tus valores reales:

```bash
cp .env.example .env
```

Edita `.env`:

```env
DATABASE_URL="postgresql://USUARIO:PASSWORD@HOST.neon.tech/alertaciudad?sslmode=require"
SESSION_SECRET="<genera-uno-con: openssl rand -base64 32>"
```

> 🔒 **Seguridad:** `DATABASE_URL` se lee **únicamente** desde `.env`. El archivo
> `.env` está en `.gitignore` y **nunca** debe subirse al repositorio ni
> imprimirse en consola.

### 4. Migraciones y datos de ejemplo

```bash
npx prisma migrate deploy   # aplica la migración inicial (prisma/migrations)
npx prisma db seed          # carga estados, categorías, zonas y datos demo
```

> Para desarrollo también puedes usar `npx prisma migrate dev --name init`.

### 5. Levantar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

**Credenciales demo** (creadas por el seed):

- Correo: `admin@alertaciudad.pe`
- Contraseña: `cambia_esto`

> El seed guarda esa contraseña en texto plano sólo como demo. Al crear o editar
> administradores desde el portal, las contraseñas se almacenan cifradas con
> **bcrypt**. Cambia la contraseña del admin demo cuanto antes.

---

## 📡 API REST (consumida por la app móvil)

Todas las respuestas son JSON y llevan cabeceras **CORS** (`Access-Control-Allow-Origin: *`).

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/categorias` | `[{ id, nombre, icono }]` |
| `GET` | `/api/zonas` | `[{ id, nombre }]` |
| `GET` | `/api/estados` | `[{ id, nombre }]` |
| `GET` | `/api/reportes?usuarioId=` | Lista de reportes (del usuario si se indica) |
| `GET` | `/api/reportes/:id` | Reporte + su historial |
| `POST` | `/api/reportes` | Crea un reporte (estado inicial "Pendiente") |
| `PATCH` | `/api/reportes/:id/estado` | Cambia estado y registra historial (admin) |
| `POST` | `/api/usuarios` | Registra/sincroniza un usuario |

### Forma JSON de un reporte

```json
{
  "id": 1,
  "titulo": "Hueco en la pista",
  "descripcion": "Hueco grande frente al parque",
  "fotoUrl": null,
  "lat": -12.097,
  "lng": -77.036,
  "categoria": { "id": 1, "nombre": "Hueco en pista" },
  "zona": { "id": 1, "nombre": "San Isidro" },
  "estado": { "id": 1, "nombre": "Pendiente" },
  "usuarioId": 1,
  "creadoEn": "2026-06-07T00:00:00.000Z"
}
```

### Cuerpos de petición

**POST `/api/reportes`**

```json
{
  "titulo": "string",
  "descripcion": "string",
  "fotoUrl": "string | null",
  "lat": -12.097,
  "lng": -77.036,
  "idCategoria": 1,
  "idZona": 1,
  "idUsuario": 1
}
```

**PATCH `/api/reportes/:id/estado`**

```json
{ "idEstado": 2, "comentario": "En atención por la municipalidad" }
```

**POST `/api/usuarios`**

```json
{ "nombre": "Ana", "correo": "ana@correo.com", "firebaseUid": "abc123" }
```

---

## 🗂️ Estructura del proyecto

```
prisma/
  schema.prisma         # Esquema de datos
  seed.ts               # Datos de ejemplo
  migrations/           # Migración inicial (SQL)
app/
  (admin)/              # Portal administrativo (sidebar + topbar)
    dashboard/          # Tarjetas de resumen + reportes recientes
    reportes/           # CRUD + detalle con historial + cambio de estado
    usuarios/ categorias/ zonas/ estados/ historial/ administradores/
  api/                  # Route Handlers (API REST para la app móvil)
  login/                # Login de administrador
lib/
  prisma.ts             # Cliente Prisma (singleton)
  auth.ts               # Sesión de admin (cookie HMAC) + bcrypt
  api.ts                # Helpers de respuesta JSON, CORS y serialización
  estados.ts utils.ts   # Colores de estado y utilidades
components/
  ui/                   # Componentes estilo shadcn/ui
  admin/                # Sidebar, topbar, tabla CRUD genérica, badges
```

---

## ☁️ Despliegue en Vercel

1. Sube el repositorio a GitHub (sin `.env`).
2. Importa el proyecto en Vercel.
3. Define las variables de entorno `DATABASE_URL` y `SESSION_SECRET` en el panel
   de Vercel.
4. El comando de build (`prisma generate && next build`) ya está configurado en
   `package.json`. Ejecuta las migraciones contra tu base con
   `npx prisma migrate deploy` (localmente o como paso de despliegue).

---

## 🛠️ Scripts útiles

```bash
npm run dev          # desarrollo
npm run build        # build de producción (incluye prisma generate)
npm run start        # servidor de producción
npm run db:migrate   # prisma migrate dev
npm run db:seed      # prisma db seed
npm run db:studio    # Prisma Studio (explorar la BD)
```
