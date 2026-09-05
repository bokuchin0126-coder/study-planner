import { useState } from "react" 
import { signUp } from "../api/authApi" 
import { Link, useNavigate } from "react-router-dom" 
import "../css/auth.css"
 
 
export default function SignupPage() { 
  const [email, setEmail] = useState<string>("") 
  const [password, setPassword] = useState<string>("") 
  const [error, setError] = useState<string>("")
  const navigate = useNavigate() 

  const handleSignUp = async () => { 
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
      await signUp(email, password) 

      alert("登録しました") 

      navigate("/signin", { 
        replace: true 
      }) 

    } catch (e) { 
      console.log(e)

      const message =
        e && typeof e === "object" && "message" in e
          ? String(e.message)
          : ""

      if (
        message.includes("already registered") ||
        message.includes("already exists") ||
        message.includes("User already registered")
      ) {
        setError("このメールアドレスはすでに登録されています。")
      } else {
        setError("登録に失敗しました。もう一度お試しください。")
      }

    } 
  } 
 
 
  return (
  <main className="auth-page">
    <section className="auth-card">
      <h1 className="auth-title">新規登録</h1>

      <form
        className="auth-form"
        onSubmit={(e) => {
          e.preventDefault()
          handleSignUp()
        }}
      >
        <div className="auth-field">
          <label htmlFor="signup-email">
            メールアドレス
          </label>

          <input
            id="signup-email"
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="auth-field">
          <label htmlFor="signup-password">
            パスワード
          </label>

          <input
            id="signup-password"
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
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
          登録
        </button>
      </form>

      <div className="auth-switch">
        <p>
          すでにアカウントをお持ちの方はこちら
        </p>

        <Link to="/signin">
          ログインへ
        </Link>
      </div>
    </section>
  </main>
  )
}