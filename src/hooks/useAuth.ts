import { supabase } from "../lib/supabase"


export function useAuth() {

    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password
        })

        if (error) throw error
    }

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) throw error
    }

    return {
        signUp,
        signIn
    }
}