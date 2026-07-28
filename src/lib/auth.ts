import { supabase } from "../lib/supabase"

export default async function getCurrentUser() {
  const { data: {user}, error } = await supabase.auth.getUser()
    
  if (error) throw error
  if (!user) throw new Error("ログインしてください")
  return user
}