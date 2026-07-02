import { useState } from "react"
import { useAuth } from "../hooks/useAuth"

export default function SignupPage() {
  const { signUp } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSignUp = async () => {
    try {
        await signUp(email, password)
        alert("登録しました")
    } catch(e) {
        console.error(e)
        alert("登録失敗")
    }
  } 

  return (
    <>
      <h1>新規登録</h1>

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

      <button onClick={handleSignUp}>登録</button>
    </>
  )
}