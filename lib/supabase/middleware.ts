import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register'
  
  if (user) {
    // Fetch user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = (profile as any)?.role || 'customer'
    
    // Redirect logged-in users away from auth routes
    if (isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = role === 'business_owner' ? '/business/dashboard' : '/customer/dashboard'
      return NextResponse.redirect(url)
    }

    // Role-based protection
    if (request.nextUrl.pathname.startsWith('/business') && role !== 'business_owner') {
      const url = request.nextUrl.clone()
      url.pathname = '/customer/dashboard'
      return NextResponse.redirect(url)
    }
    
    if (request.nextUrl.pathname.startsWith('/customer') && role !== 'customer') {
      const url = request.nextUrl.clone()
      url.pathname = '/business/dashboard'
      return NextResponse.redirect(url)
    }
  } else {
    // Unauthenticated protection
    if (request.nextUrl.pathname.startsWith('/business') || request.nextUrl.pathname.startsWith('/customer')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
