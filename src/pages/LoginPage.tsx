import { useState, useEffect } from "react"
import { signIn } from "../api/authApi"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"


export default function LoginPage() {
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
      alert(
        "メールアドレスまたはパスワードが間違っています。\nアカウントをお持ちでない場合は新規登録してください。"
      )
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

      <div>
        <p>アカウントをお持ちでない方はこちら↓</p>
        <Link to="/signup">サインインへ</Link>
      </div>
    </>
  )
}