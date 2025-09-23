import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Verificar si la ruta requiere autenticación
  const isAuthRequired = !request.nextUrl.pathname.startsWith('/login')

  // Obtener el token del localStorage
  const token = request.cookies.get('token')

  // Si la ruta requiere autenticación y no hay token, redirigir al login
  if (isAuthRequired && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si hay token y el usuario intenta acceder al login, redirigir al dashboard
  if (!isAuthRequired && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Configurar las rutas que usarán este middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/orders/:path*',
    '/users/:path*',
    '/login'
  ]
}