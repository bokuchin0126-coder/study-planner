import { useState, useEffect } from "react" 
import { signIn, signInWithGithub, signInWithGoogle } from "../api/authApi" 
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

  const handleGithubSignIn = async () => {
    setError("")

    try {
      await signInWithGithub()
    } catch(e) {
      console.error(e)
      setError("GitHubでのログインに失敗しました。")
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")

    try {
      await signInWithGoogle()
    } catch(e) {
      console.error(e)
      setError("Googleでのログインに失敗しました。")
    }
  }

  const GithubIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.58 2 12.26c0 4.54 2.87 8.39 6.84 9.75.5.1.68-.22.68-.49v-1.72c-2.78.62-3.37-1.37-3.37-1.37-.46-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1 .07 1.53 1.07 1.53 1.07.9 1.58 2.35 1.12 2.92.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.15-4.56-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.1 9.1 0 0 1 12 7.08c.85 0 1.7.12 2.5.36 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.35 4.81-4.58 5.07.36.32.68.94.68 1.9v2.8c0 .27.18.59.69.49A10.27 10.27 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"
      />
    </svg>
  )

  const GoogleIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5Z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7 12.9 19.5C14.7 15 18.9 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.1 0 9.8-2 13.3-5.2l-6.1-5.2C29.7 35.1 27 36 24 36c-5.1 0-9.5-3.3-11.1-7.8l-6.6 5.1C9.7 39.7 16.3 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.4 4.2-4.1 5.6l.1-.1 6.1 5.2C36.9 39.2 44 34 44 24c0-1.2-.1-2.4-.4-3.5Z"
      />
    </svg>
  )
 
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

        <button
          type="button"
          className="auth-github-button"
          onClick={handleGithubSignIn}
        >
          <GithubIcon />
          <span>GitHubでログイン</span>
        </button>

        <button
          type="button"
          className="auth-google-button"
          onClick={handleGoogleSignIn}
        >
          <GoogleIcon />
          <span>Googleでログイン</span>
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