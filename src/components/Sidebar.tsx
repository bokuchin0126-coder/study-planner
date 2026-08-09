import { Link } from "react-router-dom"

export default function Sidebar() {
  return (
    <aside>
      <h2>Study Planner</h2>

      <nav>
        <ul>
          <li>
            <Link to="/daily">デイリー</Link>
          </li>

          <li>
            <Link to="/weekly">ウィークリー</Link>
          </li>

          <li>
            <Link to="/monthly">マンスリー</Link>
          </li>

          <li>
            <Link to="/longTerm">長期</Link>
          </li>

          <li>
            <Link to="/completed">完了履歴</Link>
          </li>

          <li>
            <Link to="/settings">設定</Link>
          </li>
        </ul>
      </nav>
    </aside>
  )
}