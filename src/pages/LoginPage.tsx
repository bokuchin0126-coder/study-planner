import { useState, useEffect } from "react" 
import { signIn } from "../api/authApi" 
import { Link, useNavigate } from "react-router-dom" 
import { supabase } from "../lib/supabase" 
 
 
export default function LoginPage() { 
  const [email, setEmail] = useState<string>("") 
  const [password, setPassword] = useState<string>("") 
  const [error, setError] = useState<string>("")
  const navigate = useNavigate() 
 
  const handleSignIn = async () => { 
    setError("")

    if (email.trim() === "") { 
      setError("メールアドレスを入力してください。") 
      return
    } 

    if (password.trim() === "") { 
      setError("パスワードを入力してください。") 
      return
    }

    try { 
      await signIn(email, password)
 
      navigate("/daily", { 
        replace: true 
      }) 

    } catch (e) { 
      console.error(e) 

      setPassword("")
      setError("メールアドレスまたはパスワードが正しくありません。")
    } 
  } 
 
  useEffect(() => { 
    const checkUser = async () => { 
      const { 
        data: { user } 
      } = await supabase.auth.getUser() 
 
      if (user) { 
        navigate("/daily", {
          replace: true
        }) 
      } 
    } 
 
    checkUser() 
  }, []) 
 
 
  return (
  <main className="auth-page">
    <section className="auth-card">
      <h1 className="auth-title">ログイン</h1>

      <form
        className="auth-form"
        onSubmit={(e) => {
          e.preventDefault()
          handleSignIn()
        }}
      >
        <div className="auth-field">
          <label htmlFor="login-email">
            メールアドレス
          </label>

          <input
            id="login-email"
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="auth-field">
          <label htmlFor="login-password">
            パスワード
          </label>

          <input
            id="login-password"
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="auth-error">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="auth-submit-button"
        >
          ログイン
        </button>
      </form>

      <div className="auth-switch">
        <p>
          アカウントをお持ちでない方はこちら
        </p>

        <Link to="/signup">
          新規登録へ
        </Link>
      </div>
    </section>
  </main>
  )
 
} 