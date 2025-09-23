# Control Flujo Logístico

## Descripción
Sistema de control de flujo logístico que gestiona el movimiento de pedidos a través de diferentes etapas: Bodega, Despachos, Mensajero y Maquilas.

## Características
- Sistema de autenticación con JWT
- Roles de usuario: Admin, Bodega, DESPACHOS, Mensajero, Maquilas
- Seguimiento de pedidos en tiempo real
- Historial completo de movimientos
- API REST documentada con Swagger

## Tecnologías
- Node.js
- Express
- MySQL
- JWT para autenticación
- Swagger para documentación

## Instalación
1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno en `.env`
4. Iniciar el servidor: `node server.js`

## Estructura de Base de Datos
### Tablas
- USUARIOS: Gestión de usuarios y roles
- PEDIDOS: Estado actual de pedidos
- historial_pedidos: Registro detallado de movimientos

## Endpoints
### Autenticación
- POST /api/usuarios/registro - Registro de usuarios
- POST /api/usuarios/login - Login y obtención de token

### Pedidos
- POST /api/pedidos - Crear nuevo pedido (Admin)
- GET /api/pedidos/historial - Ver historial de pedidos

### Flujo Logístico
#### Bodega
- PUT /api/pedidos/:id/bodega/recibir
- PUT /api/pedidos/:id/bodega/entregar

#### Despachos
- PUT /api/pedidos/:id/despacho/recibir
- PUT /api/pedidos/:id/despacho/entregar

#### Mensajero
- PUT /api/pedidos/:id/mensajero/recibir
- PUT /api/pedidos/:id/mensajero/entregar

#### Maquilas
- PUT /api/pedidos/:id/maquila/recibir

## Documentación API
Acceder a http://localhost:3000/api-docs para ver la documentación completa de la API con Swagger.

## Seguridad
- Autenticación mediante JWT
- Validación de roles para cada endpoint
- Contraseñas hasheadas con bcrypt
- Control de acceso basado en roles
 API

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
