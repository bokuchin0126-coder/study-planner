import { useState } from "react"
import { supabase } from "../lib/supabase"
import type { DailyRecord, DailyTask } from "../types/daily"


export function useDaily() {

  const [dailyTasks, setDailyTasks] = useState<DailyRecord[]>([])

  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo"
  }).format(new Date())

  const todayDate = dailyTasks.find(daily => daily.date === today)

  const addDailyTasks = async (text: string) => {
    try {
      if (text.trim() === "") return alert("タスク名を入力して下さい")

      const {
        data: {user},
        error: userError,
      } = await supabase.auth.getUser()
      

      if (userError) throw userError
      if (!user) return alert("ログインしてください")

      if (!todayDate) {

        const { data: planData, error: planError } = await supabase
          .from("daily_plans")
          .insert({
            user_id: user.id,
            date: today,
            reflection: ""
          })
          .select().single()

        if (planError) throw planError
        
        const { data: taskData, error: taskError } = await supabase
        .from("daily_tasks")
        .insert({
          user_id: user.id,
          plan_id: planData.id,
          text: text
        })
        .select().single()

        if (taskError) throw taskError

        const newTasks: DailyRecord = {
            date: today,
            tasks: [{
                id: taskData.id,
                title: text,
                completed: false
            }]
        }

        setDailyTasks(prev => [...prev, newTasks])

      } else {

        const { data: planData, error: planError } = await supabase
          .from("daily_plans")
          .select()
          .eq("user_id", user.id)
          .eq("date", today)
          .single()

        if (planError) throw planError
        
        const { data: taskData, error: taskError } = await supabase
          .from("daily_tasks")
          .insert({
            user_id: user.id,
            plan_id: planData.id,
            text: text
          })
          .select().single()
        
        if (taskError) throw taskError

        const newTasks: DailyTask = {
          id: taskData.id,
          title: text,
          completed: false
        }
        
        setDailyTasks(prev => prev.map(day =>
           day.date === today ? {
            ...day,
            tasks: [...day.tasks, newTasks]
          }
          : day
        ))
      }
    } catch(e) {
      console.error(e)
      alert("タスクの追加に失敗しました")
      return
    }
  }

  return {
    dailyTasks,
    todayDate,
    addDailyTasks
  }
}