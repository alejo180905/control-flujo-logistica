# 📦 Sistema de Control de Flujo Logístico - Versión Informal

¡Hola! 👋 Este es nuestro increíble sistema de logística que hemos estado desarrollando. Es súper completo y maneja todo el flujo de pedidos desde que salen de bodega hasta que llegan a las maquilas.

## 🎯 ¿Qué hace este sistema?

Básicamente, es como un "GPS" para pedidos. Imagínate que tienes un pedido y necesitas saber exactamente dónde está en cada momento del proceso. ¡Eso es lo que hace nuestro sistema!

### 🚀 Las cosas geniales que tiene:

#### 🔐 Login súper seguro
- Cada persona tiene su propio usuario y contraseña
- Hay 5 tipos de usuarios: Admin (el jefe), Bodega, Despachos, Mensajero y Maquilas
- Nadie puede ver o hacer cosas que no le corresponden

#### 📊 Dashboard que se adapta a cada quien
- **Si eres de Bodega**: Ves solo los pedidos que tienes que entregar
- **Si eres de Despachos**: Ves los que tienes que recibir o entregar a mensajeros
- **Si eres Mensajero**: Ves los disponibles para recoger y entregar
- **Si eres de Maquilas**: Ves los que te van a llegar
- **Si eres Admin**: Ves todo y puedes hacer todo

#### 📦 Seguimiento de pedidos paso a paso
1. **Bodega** crea el pedido → "Tengo un pedido listo"
2. **Bodega** lo marca como entregado → "Ya lo mandé a despachos"
3. **Despachos** lo recibe → "Ok, ya lo tengo"
4. **Despachos** se lo da al mensajero → "Listo, ya se lo di al mensajero Juan"
5. **Mensajero** confirma que lo recogió → "Sí, ya lo tengo"
6. **Mensajero** lo entrega en la maquila → "Ya lo dejé en la maquila XYZ"
7. **Maquila** confirma que lo recibió → "Perfecto, ya llegó" ✅ ¡COMPLETADO!

#### 📋 Historial súper detallado
- Cada vez que alguien hace algo, queda registrado
- Puedes ver quién hizo qué y cuándo exactamente
- Es como tener un "libro de vida" de cada pedido

#### 🔍 Búsquedas y filtros geniales
- Busca pedidos por número
- Filtra por estado (en qué etapa están)
- Filtra por fecha (súper útil para reportes)

## 🛠️ Tecnologías que usamos (para los nerds 🤓)

### Backend (el cerebro del sistema)
- **Node.js + Express**: Para hacer que todo funcione rápido
- **MySQL**: Base de datos súper confiable para guardar todo
- **JWT**: Para que nadie se haga pasar por otro
- **bcrypt**: Para que las contraseñas estén súper seguras

### Frontend (la cara bonita)
- **Next.js con TypeScript**: Para que sea rápido y moderno
- **Tailwind CSS**: Para que se vea hermoso
- **React**: Para que todo sea dinámico y responsive

## 📱 Las páginas principales

### 🏠 Inicio
- Es como tu "oficina virtual"
- Ves estadísticas cool: cuántos pedidos hay, cuántos están pendientes, etc.
- Solo aparecen los pedidos que TÚ puedes manejar
- Botones grandes para hacer acciones rápido

### 📦 Pedidos
- Lista de TODOS los pedidos (si tienes permisos)
- Filtros súper útiles
- Cada pedido tiene botones para las acciones que puedes hacer
- Click en cualquier pedido para ver su historial completo

### 👥 Usuarios (solo para Admins)
- Crear nuevos usuarios
- Editar info de usuarios existentes
- Activar/desactivar usuarios
- Eliminar usuarios (con restricciones para no meter la pata)

### 👤 Mi Perfil
- Cambiar tu info personal
- Cambiar contraseña
- Ver tu información actual

## 🎮 ¿Cómo usar el sistema? (Súper fácil)

### Si eres nuevo:
1. Pídele al Admin que te cree un usuario
2. Te dará tu usuario y contraseña
3. Entra al sistema
4. ¡Listo! Ya puedes trabajar

### Si ya tienes usuario:
1. Entra con tu usuario y contraseña
2. Ve a "Inicio" para ver tus tareas pendientes
3. Haz click en los botones para marcar acciones
4. Todo se registra automáticamente

### Si eres Admin:
- Puedes hacer TODO
- Crear pedidos nuevos
- Crear usuarios nuevos
- Ver estadísticas generales
- Eliminar cosas (con cuidado)

## 🔒 Seguridad (súper importante)

- **Nadie puede ver más de lo que le toca**: Si eres mensajero, no puedes ver funciones de admin
- **Contraseñas súper seguras**: Se guardan encriptadas, ni nosotros las podemos ver
- **No se puede eliminar al último admin**: Para que no se quede el sistema sin jefe
- **Todo queda registrado**: Para auditorías y control

## ✨ Cosas geniales que tiene

### 🚀 Es súper rápido
- Carga en segundos
- Las búsquedas son instantáneas
- No se traba ni se cuelga

### 📱 Funciona en todo
- Computadoras
- Tablets
- Celulares
- Se adapta automáticamente

### 🎯 Es intuitivo
- Botones grandes y claros
- Colores que significan algo (verde = bueno, rojo = atención)
- Mensajes claros cuando algo sale mal

### 📊 Estadísticas en tiempo real
- Ves cuántos pedidos tienes
- Cuántos están completados
- Cuántos usuarios están activos
- Todo se actualiza solito

## 🐛 Qué hemos arreglado recientemente

### ✅ Problemas solucionados:
- **Filtro de fechas**: Antes no funcionaba, ahora sí
- **Botón de eliminar usuarios**: Ahora funciona perfecto
- **Estadísticas del dashboard**: Mostraban 0, ahora muestran los números reales
- **Texto del historial**: El mensaje de "creado en bodega" se ve bien en todos los roles
- **Permisos de mensajeros**: Ahora pueden entregar a maquilas sin problemas

### 🔧 Mejoras que hicimos:
- **Dashboard personalizado**: Cada rol ve solo lo que necesita
- **Mejor manejo de errores**: Mensajes más claros cuando algo sale mal
- **Validaciones mejoradas**: Para evitar eliminar cosas importantes por error
- **Limpieza de código**: Quitamos archivos que ya no servían

## 🎉 Estado actual: ¡SÚPER ESTABLE!

Todo está funcionando al 100%:
- ✅ Login y permisos
- ✅ Crear y gestionar pedidos
- ✅ Workflow completo de 7 etapas
- ✅ Dashboard personalizado
- ✅ Historial detallado
- ✅ Gestión de usuarios
- ✅ Filtros y búsquedas
- ✅ Estadísticas en tiempo real
- ✅ Seguridad robusta

## 👨‍💻 Para desarrolladores

Si quieres tocar el código:

```bash
# Backend
cd Backend
npm install
npm run dev

# Frontend  
cd frontend
npm install
npm run dev
```

### Estructura súper organizada:
```
📁 Backend/
  📁 src/
    📁 controllers/ ← La lógica de todo
    📁 routes/ ← Las rutas de la API
    📁 middleware/ ← Validaciones y autenticación
    📁 config/ ← Configuración de BD
    
📁 frontend/
  📁 src/
    📁 app/ ← Las páginas
    📁 components/ ← Componentes reutilizables
    📁 lib/ ← Utilidades
```

## 🎯 ¿Qué sigue?

El sistema está completo y funcional, pero siempre se puede mejorar:
- Notificaciones push
- Reportes en PDF
- Gráficos más bonitos
- App móvil nativa
- Integración con WhatsApp

---

**💡 Tip**: Si algo no funciona como esperas, revisa que tengas los permisos correctos para tu rol. ¡La mayoría de "problemas" son por eso!

**🚀 Estado**: ¡Listo para producción!  
**📅 Última actualización**: Septiembre 2025  
**👥 Desarrollado por**: El increíble equipo de Control Flujo Logístico