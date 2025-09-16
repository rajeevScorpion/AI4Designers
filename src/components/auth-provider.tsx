'use client'

import { SupabaseClient } from '@supabase/supabase-js'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode
} from 'react'

import { Database } from '@/shared/supabase'

type SupabaseContext = {
  supabase: SupabaseClient<Database>
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export default function SupabaseProvider({
  children,
}: {
  children: ReactNode
}) {
  const [supabase] = useState(() => createBrowserSupabaseClient<Database>())

  return (
    <Context.Provider value={{ supabase }}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return context
}