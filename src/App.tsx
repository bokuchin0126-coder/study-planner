import { useState } from "react"
import { supabase } from "./lib/supabase"
import SignupPage from "./pages/SignupPage"
import LoginPage from "./pages/LoginPage"


function App() {


  return (
    <>
      <SignupPage />
      <LoginPage />
    </>
  )
}

export default App
