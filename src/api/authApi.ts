import { supabase } from "../lib/supabase"


export async function getCurrentUser() {
  const { data: {user}, error } = await supabase.auth.getUser()
    
  if (error) throw error
  if (!user) throw new Error("ログインしてください")
  return user
}

export async function signUp(email: string, password: string) {
  const { error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) throw error
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) throw error
}

export async function deleteAccount() {
  const { error } = await supabase.functions.invoke("delete-account")

  if (error) throw error

  await supabase.auth.signOut()
}