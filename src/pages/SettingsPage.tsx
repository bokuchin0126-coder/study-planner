import { 
  getCurrentUser,
  signOut, 
  deleteAccount, 
} from "../api/authApi" 
import {
  Mail,
  LogOut,
  Trash2
} from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom" 
import Sidebar from "../components/Sidebar" 
import "../css/setting.css"
 
 
export default function SettingsPage() { 
  const navigate = useNavigate() 

  const [accountEmail, setAccountEmail] = useState<string>("")

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const user = await getCurrentUser()
        setAccountEmail(user.email ?? "")
      } catch (error) {
        console.error(error)
      }
    }

    loadAccount()
  }, [])

 
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
      "本当にアカウントを削除しますか？\n\nアカウントと関連するデータは削除され、この操作は取り消せません。" 
    ) 

    if (!confirmed) { 
      return 
    } 

    try { 
      await deleteAccount() 
      alert("アカウントを削除しました") 

      navigate("/signup", { 
        replace: true 
      }) 

    } catch (error) { 
      console.error(error) 
      alert("アカウントの削除に失敗しました") 
    }
  }

  return (
  <div className="settings-page">
    <Sidebar />

    <main className="settings-content">
      <h1 className="settings-page-title">
        設定
      </h1>

      <section className="settings-section">
        <h2 className="settings-section-title">
          アカウント情報
        </h2>

        <div className="settings-account-info">
          <div className="settings-account-label">
            <Mail size={18} />
            <span>メールアドレス</span>
          </div>

          <span className="settings-account-email">
            {accountEmail}
          </span>
        </div>
      </section>

      <section className="settings-section">
        <h2 className="settings-section-title">
          アカウント管理
        </h2>

        <div className="settings-action">
          <div className="settings-action-info">
            <div className="settings-action-title">
              <LogOut size={18} />
              <h3>ログアウト</h3>
            </div>

            <p>
              現在のアカウントからログアウトします。
            </p>
          </div>

          <button
            className="settings-button"
            onClick={handleSignOut}
          >
            ログアウト
          </button>
        </div>
      </section>

      <section className="settings-section settings-danger">
        <h2 className="settings-section-title">
          危険な操作
        </h2>

        <div className="settings-action">
          <div className="settings-action-info">
            <div className="settings-action-title">
              <Trash2 size={18} />
              <h3>アカウント削除</h3>
            </div>

            <p>
              アカウントと関連するデータを削除します。
              この操作は取り消せません。
            </p>
          </div>

          <button
            className="settings-button"
            onClick={handleDeleteAccount}
          >
            アカウントを削除
          </button>
        </div>
      </section>
    </main>
  </div>
  )

} 