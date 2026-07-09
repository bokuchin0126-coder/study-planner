import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { Navigate, Outlet } from "react-router-dom"

export default function ProtectedRoute() {
  const [loading, setLoading] = useState<boolean>(true)
  const [isLogin, setIsLogin] = useState<boolean>(false)

  useEffect(() => {
    const checkUser = async () => {
        const {
            data: {user}
        } = await supabase.auth.getUser()

        setIsLogin(!!user)
        setLoading(false)
    }
    checkUser()
  }, [])

  if (loading) return <p>Loading...</p>

  return isLogin
    ? <Outlet />
    : <Navigate to="/signin" replace />
}