import { 
  signOut, 
  deleteAccount, 
} from "../api/authApi" 
import { useNavigate } from "react-router-dom" 
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
    <> 
      <Sidebar /> 

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