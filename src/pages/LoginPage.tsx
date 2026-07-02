import { useState } from "react"
import { useAuth } from "../hooks/useAuth"


export default function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSignIn = async () => {
    try {
        await signIn(email, password)
        alert("登録しました")
    } catch (e) {
        console.error(e)
        alert("ログイン失敗")
    }
  }
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
    </>
  )
}