import { Link, useLocation } from "react-router-dom" 
import {
  CalendarDays,
  List,
  Table2,
  Diamond,
  History,
  Settings,
} from "lucide-react";

import "../css/sidebar.css"

const navigationItems = [
  { path: "/daily", label: "日", icon: CalendarDays },
  { path: "/weekly", label: "週", icon: List },
  { path: "/monthly", label: "月", icon: Table2 },
  { path: "/longTerm", label: "長期", icon: Diamond },
  { path: "/completed", label: "達成履歴", icon: History },
  { path: "/settings", label: "設定", icon: Settings },
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
          {navigationItems.map((item) =>  {
            const Icon = item.icon

            return (
              <li key={item.path}> 
                <Link 
                  to={item.path} 
                  className={ 
                    location.pathname === item.path 
                      ? "sidebar-link active" 
                      : "sidebar-link" 
                  } 
                > 
                  <Icon size={20} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </Link> 
              </li> 
            )
          })} 
        </ul> 
      </nav> 
    </aside> 
  ) 
} 