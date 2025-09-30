# Sistema de Control de Flujo Logístico

Un sistema completo de gestión logística que permite el seguimiento de pedidos a través de diferentes etapas del proceso de distribución, desde bodega hasta maquilas, con control de usuarios y roles específicos.

## 🚀 Características Principales

### 🔐 Sistema de Autenticación
- **JWT Authentication** con roles diferenciados
- **5 Roles de Usuario**: Admin, Bodega, Despachos, Mensajero, Maquilas
- **Perfiles de usuario** editables con validaciones de seguridad
- **Gestión completa de usuarios** (crear, editar, eliminar, habilitar/deshabilitar)

### 📦 Gestión de Pedidos
- **Workflow de 7 etapas**: 
  1. En_Bodega
  2. Entregado_a_Despachos
  3. Recibido_por_Despachos
  4. Entregado_por_Despachos
  5. Recibido_por_Mensajero
  6. Entregado_a_Maquila
  7. Recibido_por_Maquila
- **Creación de pedidos** (solo Admin)
- **Edición de pedidos** (solo en estado inicial)
- **Eliminación de pedidos** (solo Admin)
- **Filtros avanzados** por número, estado y fecha

### 📊 Dashboard Personalizado
- **Vista por rol**: Cada usuario ve solo los pedidos que puede gestionar
- **Estadísticas en tiempo real**: Total de pedidos, pendientes, completados y usuarios activos
- **Acciones rápidas**: Botones contextuales según el rol y estado del pedido

### 📋 Historial Completo
- **Trazabilidad completa** de todas las acciones realizadas
- **Registro automático** de cada cambio de estado
- **Información detallada** de usuario, fecha y acción realizada
- **Formato especial** para pedidos creados en bodega

### 🎯 Roles y Permisos
- **Admin**: Control total del sistema, crear pedidos, gestionar usuarios
- **Bodega**: Marcar pedidos como entregados a despachos
- **Despachos**: Recibir de bodega y entregar a mensajeros
- **Mensajero**: Recoger de despachos y entregar a maquilas
- **Maquilas**: Confirmar recepción final de pedidos

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** con Express.js
- **MySQL** como base de datos
- **JWT** para autenticación
- **bcrypt** para encriptación de contraseñas
- **mysql2** para conexión a base de datos

### Frontend
- **Next.js 14** con TypeScript
- **Tailwind CSS** para estilos
- **React Hooks** para manejo de estado
- **Fetch API** para comunicación con backend

## 📁 Estructura del Proyecto

```
control-flujo-logistica/
├── Backend/                 # Servidor Node.js
│   ├── src/
│   │   ├── config/         # Configuración de BD
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── middleware/     # Autenticación y validaciones
│   │   ├── models/         # Modelos de datos
│   │   └── routes/         # Rutas de la API
│   ├── package.json
│   └── server.js
├── frontend/               # Aplicación Next.js
│   ├── src/
│   │   ├── app/           # Páginas de la aplicación
│   │   ├── components/    # Componentes reutilizables
│   │   └── lib/          # Utilidades y configuración
│   ├── package.json
│   └── next.config.ts
└── README.md
```

## 🗄️ Base de Datos

### Tablas Principales
- **USUARIOS**: Gestión de usuarios y roles
- **PEDIDOS**: Información de pedidos y estados
- **HISTORIAL_PEDIDOS**: Trazabilidad completa de acciones

### Relaciones
- Cada pedido tiene múltiples registros de historial
- Cada acción del historial está vinculada a un usuario
- Referencias de integridad para mantener consistencia

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v18 o superior)
- MySQL (v8 o superior)
- npm o yarn

### Backend
```bash
cd Backend
npm install
# Configurar variables de entorno en .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Variables de Entorno
```env
# Backend/.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=controlflujologistico
JWT_SECRET=tu_jwt_secret
PORT=3000
```

## 📱 Funcionalidades por Página

### 🏠 Inicio (`/inicio`)
- Dashboard personalizado por rol
- Estadísticas del sistema
- Pedidos disponibles para el usuario actual
- Acciones rápidas contextuales

### 📦 Pedidos (`/pedidos`)
- Lista completa de todos los pedidos
- Filtros por número, estado y fecha
- Acciones según rol del usuario
- Vista detallada con historial completo

### 👥 Usuarios (`/usuarios`) - Solo Admin
- Lista de todos los usuarios del sistema
- Crear nuevos usuarios con roles específicos
- Editar información de usuarios existentes
- Habilitar/deshabilitar usuarios
- Eliminar usuarios (con restricciones)

### 👤 Perfil (`/perfil`)
- Editar información personal
- Cambiar contraseña
- Vista de información del usuario actual

## 🔄 Flujo de Trabajo

1. **Admin crea un pedido** → Estado: `En_Bodega`
2. **Bodega entrega a despachos** → Estado: `Entregado_a_Despachos`
3. **Despachos recibe** → Estado: `Recibido_por_Despachos`
4. **Despachos entrega a mensajero** → Estado: `Entregado_por_Despachos`
5. **Mensajero recoge** → Estado: `Recibido_por_Mensajero`
6. **Mensajero entrega a maquila** → Estado: `Entregado_a_Maquila`
7. **Maquila confirma recepción** → Estado: `Recibido_por_Maquila` (COMPLETADO)

## 🛡️ Seguridad

- **Autenticación JWT** en todas las rutas protegidas
- **Validación de roles** en backend y frontend
- **Encriptación de contraseñas** con bcrypt
- **Protección contra eliminación accidental** del último admin
- **Validación de integridad** de datos en base de datos

## 📈 Características Avanzadas

- **Filtrado inteligente** de pedidos por fecha con formato correcto
- **Historial inmutable** para auditoría completa
- **Dashboard dinámico** que muestra solo información relevante
- **Gestión de estados** robusta con validaciones
- **Interfaz responsive** optimizada para diferentes dispositivos
- **Manejo de errores** comprehensivo con mensajes informativos

## 🎯 Estado Actual

✅ **Sistema de autenticación completo**  
✅ **Workflow de pedidos funcional**  
✅ **Dashboard personalizado por roles**  
✅ **Gestión completa de usuarios**  
✅ **Historial detallado y trazabilidad**  
✅ **Filtros y búsquedas funcionales**  
✅ **Interfaz de usuario intuitiva**  
✅ **Base de datos optimizada**  
✅ **Validaciones de seguridad**  
✅ **Documentación completa**  

## 👨‍💻 Desarrollo

Desarrollado con enfoque en:
- **Seguridad**: Autenticación robusta y validaciones
- **Usabilidad**: Interfaz intuitiva y responsive
- **Escalabilidad**: Arquitectura modular y extensible
- **Mantenibilidad**: Código limpio y documentado
- **Performance**: Consultas optimizadas y carga eficiente

---

**Versión**: 1.0.0  
**Última actualización**: Septiembre 2025  
**Estado**: Producción