import { Link, useLocation } from "react-router-dom" 
import "../css/sidebar.css"

const navigationItems = [
  { path: "/daily", label: "▣  日" },
  { path: "/weekly", label: "▤  週" },
  { path: "/monthly", label: "▦  月" },
  { path: "/longTerm", label: "◇  長期" },
  { path: "/completed", label: "◷  達成履歴" },
  { path: "/settings", label: "⚙  設定" },
]

export default function Sidebar() { 
  const location = useLocation() 

  return ( 
    <aside className="sidebar"> 
      <Link to="/daily" className="sidebar-logo"> 
        Study Planner 
      </Link> 

      <nav className="sidebar-nav"> 
        <ul> 
          {navigationItems.map((item) => ( 
            <li key={item.path}> 
              <Link 
                to={item.path} 
                className={ 
                  location.pathname === item.path 
                    ? "sidebar-link active" 
                    : "sidebar-link" 
                } 
              > 
                {item.label} 
              </Link> 
            </li> 
          ))} 
        </ul> 
      </nav> 
    </aside> 
  ) 
} 