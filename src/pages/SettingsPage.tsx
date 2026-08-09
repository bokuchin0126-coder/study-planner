import {
  signOut,
  deleteAccount,
} from "../api/authApi"
import { Link, useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"

export default function SettingsPage() {
  
  const navigate = useNavigate()

  const handleSignOut = async () => {
    const confirmed = window.confirm(
      "本当にログアウトしますか？"
    )

    if (!confirmed) {
      return
    }
    try {
      await signOut()
      navigate("/signin", {
        replace: true
      })
    } catch (error) {
      console.error(error)
      alert("ログアウトに失敗しました")
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "本当にアカウントを削除しますか？\nこの操作は取り消せません。"
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteAccount()
      navigate("/signup", {
        replace: true
      })
      alert("アカウントを削除しました")
    } catch (error) {
      console.error(error)
      alert("アカウントの削除に失敗しました")
    }
  }

  return (
    <>
      <div>
        <Sidebar />
      </div>
      
      <div>
        <h2>ログアウト</h2>
        <button onClick={handleSignOut}>
          ログアウト
        </button>
      </div>

      <div>
        <h2>アカウント削除</h2>
        <button onClick={handleDeleteAccount}>
          アカウントを削除
        </button>
      </div>
    </>
  )
}