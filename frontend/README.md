# Frontend - Sistema de Control de Flujo Logístico

Aplicación web moderna construida con Next.js 14 y TypeScript para la gestión integral de flujo logístico con interfaz intuitiva y responsive.

## 🚀 Características

### 🎨 Interfaz de Usuario
- **Next.js 14** con App Router
- **TypeScript** para desarrollo type-safe
- **Tailwind CSS** para estilos modernos y responsive
- **Componentes reutilizables** y modulares
- **Diseño responsive** optimizado para todos los dispositivos

### 🔐 Autenticación y Seguridad
- **JWT Authentication** integrada
- **Rutas protegidas** con middleware de autenticación
- **Gestión de sesiones** automática
- **Control de acceso** basado en roles
- **Redirección automática** para usuarios no autenticados

### 📊 Dashboard Personalizado
- **Vista específica por rol** de usuario
- **Estadísticas en tiempo real** del sistema
- **Pedidos disponibles** según permisos del usuario
- **Acciones contextuales** dinámicas
- **Actualización automática** de datos

### 📦 Gestión de Pedidos
- **Lista completa** de pedidos con paginación
- **Filtros avanzados** por número, estado y fecha
- **Vista detallada** con historial completo
- **Acciones workflow** según rol del usuario
- **Estados visuales** con badges y colores

### 👥 Administración de Usuarios
- **CRUD completo** de usuarios (solo Admin)
- **Formulario de creación** con validaciones
- **Edición de perfiles** de usuarios
- **Activación/desactivación** de cuentas
- **Eliminación segura** con confirmaciones

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── inicio/            # Página de inicio personalizada
│   │   ├── login/             # Autenticación
│   │   ├── pedidos/           # Gestión de pedidos
│   │   │   ├── [id]/          # Vista detallada de pedido
│   │   │   └── nuevo/         # Crear nuevo pedido
│   │   ├── perfil/            # Perfil de usuario
│   │   ├── usuarios/          # Gestión de usuarios
│   │   │   ├── [id]/          # Editar usuario
│   │   │   └── nuevo/         # Crear usuario
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página principal
│   ├── components/            # Componentes reutilizables
│   │   ├── Navigation.tsx     # Barra de navegación
│   │   ├── EstadoBadge.tsx    # Badge de estados
│   │   ├── PedidoActions.tsx  # Acciones de pedidos
│   │   └── DataTable.tsx      # Tabla de datos
│   ├── lib/                   # Utilidades y configuración
│   │   └── api.ts            # Cliente API
│   └── middleware.ts          # Middleware de Next.js
├── public/                    # Recursos estáticos
├── tailwind.config.js         # Configuración de Tailwind
├── next.config.ts             # Configuración de Next.js
└── package.json
```

## 🛠️ Tecnologías

### Core Framework
- **Next.js 14** con App Router
- **React 18** con Server Components
- **TypeScript 5** para type safety
- **Node.js** para runtime

### Estilos y UI
- **Tailwind CSS 3** para estilos utilitarios
- **Heroicons** para iconografía
- **Responsive Design** mobile-first
- **Dark Mode** support (configurable)

### Estado y Datos
- **React Hooks** (useState, useEffect, useRouter)
- **Fetch API** nativa para comunicación HTTP
- **JWT Storage** en cookies
- **Client-side state** management

### Desarrollo
- **ESLint** para linting
- **PostCSS** para procesamiento CSS
- **Hot Reload** para desarrollo
- **TypeScript** strict mode

## 📱 Páginas y Funcionalidades

### 🏠 Página de Inicio (`/inicio`)
**Funcionalidad**: Dashboard personalizado por rol
```typescript
// Componentes principales
- Estadísticas del sistema (cards de métricas)
- Lista de pedidos disponibles según rol
- Acciones rápidas contextuales
- Botón de actualización manual

// Estados gestionados
- Usuario actual con rol
- Pedidos filtrados por rol
- Loading states
- Estadísticas en tiempo real
```

### 🔐 Login (`/login`)
**Funcionalidad**: Autenticación de usuarios
```typescript
// Características
- Formulario de login con validaciones
- Manejo de errores de autenticación
- Redirección automática post-login
- Almacenamiento seguro de JWT

// Validaciones
- Campos requeridos
- Formato de usuario válido
- Feedback visual de errores
```

### 📦 Gestión de Pedidos (`/pedidos`)
**Funcionalidad**: CRUD y gestión completa de pedidos
```typescript
// Características principales
- Lista paginada de todos los pedidos
- Filtros dinámicos (número, estado, fecha)
- Vista de tabla responsive
- Acciones contextuales por rol
- Navegación a vista detallada

// Filtros implementados
- Por número de pedido (búsqueda parcial)
- Por estado (dropdown con todos los estados)
- Por fecha (selector de fecha con comparación exacta)
- Botón de limpiar filtros
```

### 📋 Vista Detallada de Pedido (`/pedidos/[id]`)
**Funcionalidad**: Historial completo y acciones específicas
```typescript
// Información mostrada
- Datos básicos del pedido
- Historial cronológico completo
- Acciones disponibles según rol
- Navegación de regreso

// Características especiales
- Formato especial para creación en BODEGA
- Timestamps localizados en español
- Estados visuales con colores
- Acciones workflow contextuales
```

### 👥 Gestión de Usuarios (`/usuarios`) - Solo Admin
**Funcionalidad**: CRUD completo de usuarios
```typescript
// Lista de usuarios
- Tabla con información completa
- Estados activo/inactivo visuales
- Acciones de editar por usuario
- Botón de crear nuevo usuario

// Creación de usuarios (/usuarios/nuevo)
- Formulario completo con validaciones
- Selección de roles disponibles
- Información descriptiva de cada rol
- Validaciones client-side y server-side

// Edición de usuarios (/usuarios/[id])
- Vista de información del usuario
- Botón de activar/desactivar
- Botón de eliminar con confirmación
- Navegación de regreso
```

### 👤 Perfil de Usuario (`/perfil`)
**Funcionalidad**: Gestión de perfil personal
```typescript
// Características
- Edición de información personal
- Cambio de contraseña
- Vista de rol actual
- Validaciones de seguridad
```

## 🔧 Componentes Principales

### Navigation.tsx
**Propósito**: Barra de navegación responsive con control de acceso
```typescript
// Características
- Menú responsive (móvil/desktop)
- Enlaces contextuales según rol
- Información del usuario logueado
- Botón de logout con confirmación
- Indicador de página activa
```

### PedidoActions.tsx
**Propósito**: Botones de acciones dinámicas para pedidos
```typescript
interface PedidoActionsProps {
  pedido: Pedido
  userRole: string
  userName: string
  onActionComplete: () => void
}

// Funcionalidad
- Botones contextuales según estado y rol
- Llamadas a API para acciones workflow
- Estados de loading durante operaciones
- Callback para refrescar datos
- Manejo de errores con alertas
```

### EstadoBadge.tsx
**Propósito**: Visualización de estados con colores
```typescript
// Estados soportados
- En_Bodega: Amarillo
- Entregado_a_Despachos: Azul
- Recibido_por_Despachos: Azul
- Entregado_por_Despachos: Naranja
- Recibido_por_Mensajero: Púrpura
- Entregado_a_Maquila: Naranja
- Recibido_por_Maquila: Verde (completado)
```

## 🔄 Flujo de Autenticación

### 1. Login Process
```typescript
// Flujo completo
1. Usuario ingresa credenciales
2. Validación client-side
3. Llamada a API /api/usuarios/login
4. Almacenamiento de JWT en cookie
5. Decodificación de token para datos de usuario
6. Redirección a /inicio
7. Carga de dashboard personalizado
```

### 2. Route Protection
```typescript
// Middleware de protección
- Verificación de token en cada página
- Redirección automática a /login si no hay token
- Decodificación de rol para permisos
- Manejo de tokens expirados
```

### 3. Logout Process
```typescript
// Limpieza de sesión
1. Confirmación de logout
2. Eliminación de cookie JWT
3. Limpieza de estado local
4. Redirección a /login
```

## 🎨 Sistema de Estilos

### Tailwind CSS Configuration
```javascript
// tailwind.config.js - Configuración personalizada
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores personalizados para estados
        'estado-bodega': '#FEF3C7',
        'estado-despachos': '#DBEAFE',
        'estado-mensajero': '#E0E7FF',
        'estado-maquilas': '#D1FAE5',
      }
    }
  }
}
```

### Responsive Design
```css
/* Breakpoints utilizados */
sm: 640px   /* Tablets */
md: 768px   /* Desktop pequeño */
lg: 1024px  /* Desktop */
xl: 1280px  /* Desktop grande */

/* Ejemplo de implementación */
<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
  {/* Cards responsive */}
</div>
```

## 📊 Gestión de Estado

### Local State con Hooks
```typescript
// Patrón típico en componentes
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')
const [data, setData] = useState([])
const [filters, setFilters] = useState({
  numero: '',
  estado: '',
  fecha: ''
})

// Efectos para carga de datos
useEffect(() => {
  fetchData()
}, [dependencies])
```

### API Integration
```typescript
// Cliente API centralizado
const apiCall = async (endpoint: string, options?: RequestInit) => {
  const token = getCookie('token')
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers
    }
  })
  
  if (!response.ok) {
    throw new Error(await response.text())
  }
  
  return response.json()
}
```

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18.0.0 o superior
- npm o yarn
- Backend API ejecutándose

### Instalación
```bash
# Clonar el proyecto
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno (opcional)
cp .env.example .env.local

# Iniciar en modo desarrollo
npm run dev

# Aplicación disponible en http://localhost:3000
```

### Scripts Disponibles
```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # Linting con ESLint
npm run type-check   # Verificación de tipos TypeScript
```

### Variables de Entorno
```env
# .env.local (opcional)
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Control Flujo Logístico"
```

## 🔒 Seguridad Frontend

### JWT Token Management
```typescript
// Almacenamiento seguro en cookies
document.cookie = `token=${jwt}; path=/; secure; samesite=strict`

// Validación en cada request
const token = document.cookie
  .split(';')
  .find(c => c.trim().startsWith('token='))
  ?.split('=')[1]

// Auto-logout en token expirado
if (!token || isTokenExpired(token)) {
  router.push('/login')
}
```

### Input Validation
```typescript
// Validaciones client-side
const validateForm = (data: FormData) => {
  const errors: string[] = []
  
  if (!data.nombre.trim()) errors.push('Nombre requerido')
  if (!data.usuario.trim()) errors.push('Usuario requerido')
  if (data.password.length < 6) errors.push('Contraseña muy corta')
  
  return errors
}
```

### Role-based UI
```typescript
// Renderizado condicional por rol
{userRole === 'Admin' && (
  <button onClick={handleAdminAction}>
    Acción de Admin
  </button>
)}

// Navegación condicional
const getNavItems = (role: string) => {
  const items = [
    { href: '/inicio', label: 'Inicio' },
    { href: '/pedidos', label: 'Pedidos' }
  ]
  
  if (role === 'Admin') {
    items.push({ href: '/usuarios', label: 'Usuarios' })
  }
  
  return items
}
```

## 📱 Responsive Design

### Mobile-First Approach
```typescript
// Componente de navegación responsive
<nav className="hidden md:flex space-x-8">
  {/* Desktop menu */}
</nav>

<div className="md:hidden">
  {/* Mobile menu button */}
  <button onClick={toggleMobileMenu}>
    <svg className="h-6 w-6">...</svg>
  </button>
</div>

{/* Mobile menu */}
{isMobileMenuOpen && (
  <div className="md:hidden">
    {/* Mobile navigation */}
  </div>
)}
```

### Responsive Tables
```typescript
// Tabla que se adapta a móviles
<div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Número
        </th>
        <th className="hidden sm:table-cell px-6 py-3">
          Estado
        </th>
        <th className="hidden lg:table-cell px-6 py-3">
          Fecha
        </th>
      </tr>
    </thead>
  </table>
</div>
```

## 🔍 Testing y Quality

### TypeScript Strict Mode
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true
  }
}
```

### ESLint Configuration
```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "prefer-const": "error",
    "no-var": "error",
    "no-console": "warn"
  }
}
```

## 📈 Performance

### Next.js Optimizations
- **Static Generation** para páginas que no cambian
- **Server Components** para renderizado eficiente
- **Image Optimization** automática de Next.js
- **Code Splitting** automático por rutas

### Bundle Analysis
```bash
# Analizar bundle de producción
npm run build
npm run analyze
```

### Loading States
```typescript
// Estados de carga consistentes
{loading ? (
  <div className="text-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    <p className="mt-2 text-gray-600">Cargando...</p>
  </div>
) : (
  <ComponenteConDatos />
)}
```

## 🔄 Versionado y Changelog

### v1.0.0 (Septiembre 2025)
- ✅ **Autenticación JWT** completa
- ✅ **Dashboard personalizado** por roles
- ✅ **Gestión completa de pedidos** con workflow
- ✅ **Administración de usuarios** (CRUD completo)
- ✅ **Filtros avanzados** funcionales
- ✅ **Interfaz responsive** optimizada
- ✅ **Componentes reutilizables** modulares
- ✅ **Manejo de errores** comprehensivo
- ✅ **Validaciones client-side** robustas
- ✅ **TypeScript** strict mode
- ✅ **Documentación completa**

---

**Estado**: Producción ✅  
**Framework**: Next.js 14 + TypeScript  
**Última actualización**: Septiembre 2025  
**Mantenedor**: Equipo de Control Flujo Logístico
