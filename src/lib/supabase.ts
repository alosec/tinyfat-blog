import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { AstroCookies } from 'astro'
import { createServerClient, parseCookieHeader } from '@supabase/ssr'

// Client-side Supabase client (for non-auth operations if needed)
let _supabase: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL,
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY
    )
  }
  return _supabase
}

// Server-side Supabase client for API routes
export function createSupabaseServerClient(cookies: AstroCookies, request?: Request) {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          if (request) {
            const cookieHeader = request.headers.get('cookie') || ''
            return parseCookieHeader(cookieHeader)
          }
          return []
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, options)
          })
        },
      },
    }
  )
}
