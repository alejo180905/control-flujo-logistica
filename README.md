# Control Flujo Logístico API

Esta API permite gestionar usuarios, autenticación y pedidos para un sistema logístico.

## Endpoints principales

- `POST /api/auth/registro` — Registrar usuario
- `POST /api/auth/login` — Login de usuario
- `GET /api/usuarios` — Listar todos los usuarios

## Documentación interactiva

Accede a la documentación y prueba los endpoints en:

```
http://localhost:3000/api-docs
```

## Tecnologías
- Node.js
- Express
- MySQL
- Swagger (OpenAPI)

## Uso rápido
1. Instala dependencias: `npm install`
2. Configura tu base de datos en `.env`
3. Inicia el servidor: `node server.js`
4. Prueba la API en `/api-docs` o con Thunder Client/Postman

---

## Estructura de carpetas

- `src/controllers/` — Lógica de negocio
- `src/routes/` — Rutas de la API
- `src/config/` — Configuración de la base de datos
- `src/models/` — Modelos de datos (opcional)
- `server.js` — Punto de entrada principal

---

## Ejemplo de registro de usuario

```json
{
  "nombre": "Juan",
  "email": "juan@email.com",
  "rol": "Admin",
  "usuario": "juan123",
  "contraseña": "123456"
}
```

---

## Autor
- Equipo de desarrollo Control Flujo Logístico
