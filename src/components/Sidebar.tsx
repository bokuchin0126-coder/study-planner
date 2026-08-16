import { Link, useLocation } from "react-router-dom" 

const navigationItems = [ 
  { path: "/daily", label: "デイリー" }, 
  { path: "/weekly", label: "ウィークリー" }, 
  { path: "/monthly", label: "マンスリー" }, 
  { path: "/longTerm", label: "長期目標" }, 
  { path: "/completed", label: "完了履歴" }, 
  { path: "/settings", label: "設定" }, 
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