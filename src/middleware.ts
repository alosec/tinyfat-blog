import { defineMiddleware } from 'astro:middleware'
import { createSupabaseServerClient } from './lib/supabase'

export const onRequest = defineMiddleware(async (context, next) => {
  const { locals, cookies, request } = context

  // Create Supabase client and populate locals for all routes
  try {
    locals.supabase = createSupabaseServerClient(cookies, request)

    // Get verified user from Supabase
    const { data: { user }, error } = await locals.supabase.auth.getUser()

    if (error || !user) {
      locals.user = null
    } else {
      locals.user = user
    }
  } catch (e) {
    // If Supabase client creation fails, treat as no user
    locals.supabase = null
    locals.user = null
  }

  return next()
})
