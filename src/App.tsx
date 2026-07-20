import { Routes, Route, Navigate } from "react-router-dom"
import ProtectedRoute from "./routes/ProtectedRoute"
import SignupPage from "./pages/SignupPage"
import LoginPage from "./pages/LoginPage"
import DailyPage from "./pages/DailyPage"
import WeeklyPage from "./pages/WeeklyPage"
import MonthlyPage from "./pages/MonthlyPage"
import LongTermPage from "./pages/LongTermPage"


function App() {


  return (
    <Routes>
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/signin" element={<LoginPage />} />

      <Route element={<ProtectedRoute />} >
        <Route path="/daily" element={<DailyPage />} />
        <Route path="/weekly" element={<WeeklyPage />} />
        <Route path="/monthly" element={<MonthlyPage />} />
        <Route path="/longTerm" element={<LongTermPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/daily" replace />} />
    </Routes>
  )
}

export default App
