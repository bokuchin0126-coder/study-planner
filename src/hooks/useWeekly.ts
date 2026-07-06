import { useState } from "react"
import type { WeeklyRecord } from "../types/weekly"
import { supabase } from "../lib/supabase"

export default function useWeekly() {

  const [weeklyTasks, setWeeklyTasks] = useState<WeeklyRecord[]>([])

  const getCurrentUser = async () => {
    const { data: {user}, error } = await supabase.auth.getUser()
    
    if (error) throw error
    if (!user) throw new Error("ログインしてください")
    return user
  }

  const addWeeklyTasks = async (text: string, date: string) => {
    try {
      if (text.trim() === "") throw alert("タスクを入力して下さい")
      const contentsDate = weeklyTasks.find(week => week.week === date)
      const user = await getCurrentUser()

      if (!contentsDate) {
        

      } else {

      }
    } catch(e) {
      console.error(e)
    }
  }
}