import { supabase } from './supabase'

export async function reauthenticate(currentPassword: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) throw new Error('Not authenticated')
  const { error } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword })
  if (error) throw new Error('Current password is incorrect')
}

export async function changeEmail(currentPassword: string, newEmail: string): Promise<void> {
  await reauthenticate(currentPassword)
  const { error } = await supabase.auth.updateUser({ email: newEmail })
  if (error) throw error
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await reauthenticate(currentPassword)
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function deleteAccount(currentPassword: string): Promise<void> {
  await reauthenticate(currentPassword)
  const { error } = await supabase.functions.invoke('delete-account')
  if (error) throw error
  await supabase.auth.signOut()
}

export async function sendPasswordReset(email: string): Promise<void> {
  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
  if (error) throw error
}

export async function signInWithProvider(provider: 'google'): Promise<void> {
  const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined
  const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
  if (error) throw error
}