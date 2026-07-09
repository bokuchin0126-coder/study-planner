import { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"


export default function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
 
  const handleSignIn = async () => {
    try {
      if (email.trim() === "") return alert("メールアドレスを入力してください。")
      if (password.trim() === "") return alert("パスワードを入力してください")
        
      await signIn(email, password)

      navigate("/daily", {
        replace: true
      })

    } catch (e) {
      console.error(e)
      alert("ログイン失敗")
      return

    } finally {
      setEmail("")
      setPassword("")
    }
  }

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: {user}
      } = await supabase.auth.getUser()

      if (user) {
        navigate("/daily", { replace: true })
      }

    }
    checkUser()
  }, [])


  return (
    <>
      <h1>ログイン</h1>

      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleSignIn}>ログイン</button>

      <Link to="/signup">サインインへ</Link>
    </>
  )
}