import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirect') as string || '/'

  if (!email || !password) {
    return redirect('/login?error=' + encodeURIComponent('Email and password are required'))
  }

  if (!locals.supabase) {
    return redirect('/login?error=' + encodeURIComponent('Authentication service unavailable'))
  }

  const { error } = await locals.supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/login?error=' + encodeURIComponent(error.message))
  }

  return redirect(redirectTo)
}
