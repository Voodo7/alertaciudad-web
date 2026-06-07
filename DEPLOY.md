# Despliegue en Vercel

Guía corta para publicar **AlertaCiudad Web** y conectarlo a la app móvil.

## 1. Subir el código a GitHub

Crea un repositorio **vacío** en https://github.com/new (sin README, sin
`.gitignore`, sin licencia). Luego, desde la carpeta del proyecto:

```bash
git remote add origin https://github.com/<TU_USUARIO>/alertaciudad-web.git
git push -u origin main
```

> El `.env` **no** se sube (está en `.gitignore`). Solo se sube `.env.example`.

## 2. Importar en Vercel

1. Entra a https://vercel.com/new e **importa** el repositorio de GitHub.
2. Vercel detecta Next.js automáticamente. No cambies el build command
   (ya es `prisma generate && next build` vía `package.json`).
3. En **Environment Variables** agrega:

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | Cadena de Neon **con pooler** (ver abajo) |
   | `SESSION_SECRET` | Un valor aleatorio largo (`openssl rand -base64 32`) |

4. Pulsa **Deploy**. Al terminar tendrás una URL como
   `https://alertaciudad-web.vercel.app`.

### DATABASE_URL para serverless (importante)

En Vercel (funciones serverless) usa la cadena **pooled** de Neon para no agotar
conexiones. En el dashboard de Neon copia el "Pooled connection". El host lleva
`-pooler`, por ejemplo:

```
postgresql://USER:PASS@ep-old-art-aq9y9ajo-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require
```

La base ya tiene el esquema y los datos (ya se corrió `migrate deploy` + `seed`),
así que no hace falta volver a migrar. Si en el futuro cambias el esquema, corre
`npx prisma migrate deploy` contra la base antes (o después) de desplegar.

## 3. Conectar la app móvil Android

Cambia la URL base de la API en la app a tu dominio de Vercel:

```
https://<tu-proyecto>.vercel.app/api
```

Endpoints disponibles (con CORS habilitado):

- `GET  /api/categorias`
- `GET  /api/zonas`
- `GET  /api/estados`
- `GET  /api/reportes?usuarioId=`
- `GET  /api/reportes/:id`
- `POST /api/reportes`
- `PATCH /api/reportes/:id/estado`
- `POST /api/usuarios`

## 4. Tras el primer deploy

- Inicia sesión en `https://<tu-proyecto>.vercel.app/login`
  (`admin@alertaciudad.pe` / `cambia_esto`) y **cambia la contraseña** del admin
  demo desde la sección *Administradores*.
- Cada `git push` a `main` vuelve a desplegar automáticamente.
