import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

// Hardcoded bypass while premium subscriptions aren't wired up yet.
// TODO: replace with a real plan/subscription check once payments are implemented.
const PREMIUM_BYPASS_EMAILS = new Set(['planetdefender67@gmail.com'])

export function isPremiumUser(user: Pick<User, 'email'> | null | undefined): boolean {
  if (!user?.email) return false
  return PREMIUM_BYPASS_EMAILS.has(user.email.toLowerCase())
}

export function useIsPremium(): boolean {
  const [premium, setPremium] = useState(false)

  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (active) setPremium(isPremiumUser(user))
    })
    return () => { active = false }
  }, [])

  return premium
}
