import { useState } from "react"
import type { WeeklyRecord, WeeklyGoal } from "../types/weekly"
import { supabase } from "../lib/supabase"

export default function useWeekly() {

  const [weeklyTasks, setWeeklyTasks] = useState<WeeklyRecord[]>([])

  const weekDate = (date: "start" | "end") => {
    const today = new Date()

    const weekStart = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Tokyo"
    }).format(today)

    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + 6)

    const weekEnd = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Tokyo"
    }).format(endDate)

    if (date === "start") return weekStart
    else if (date === "end") return weekEnd
    else return ""
  }

  const [keepWeekStart, setKeepWeekStart] = useState<string>("")
  const [keepWeekEnd, setKeepWeekEnd] = useState<string>("")

  const getCurrentUser = async () => {
    const { data: {user}, error } = await supabase.auth.getUser()
    
    if (error) throw error
    if (!user) throw new Error("ログインしてください")
    return user
  }

  const addWeeklyTasks = async (text: string) => {
    try {
      if (text.trim() === "") throw alert("タスクを入力して下さい")

      if (keepWeekEnd < weekDate("start") || keepWeekStart === "" && keepWeekEnd === "") {
        setKeepWeekStart(weekDate("start"))
        setKeepWeekEnd(weekDate("end"))
      }

      const contentsDate = weeklyTasks.find(week => week.week === keepWeekStart)
      const orderIndex = contentsDate ? contentsDate.goals.length : 0
      const user = await getCurrentUser()

      if (!contentsDate) {
        const { data: planData, error: planError } = await supabase
          .from("weekly_plans")
          .insert({
            user_id: user.id,
            week_start: keepWeekStart,
            reflection: ""
          })
          .select().single()

        if (planError) throw planError

        const { data: taskData, error: taskError } = await supabase
          .from("weekly_tasks")
          .insert({
            user_id: user.id,
            plan_id: planData.id,
            text: text,
            order_index: orderIndex
          })
          .select().single()

        if (taskError) throw taskError

        const goal: WeeklyGoal = {
          id: taskData.id,
          title: text,
          completed: false,
          orderIndex: orderIndex
        }

        const task: WeeklyRecord = {
          week: keepWeekStart,
          goals: [goal],
          reflection: ""
        }

        setWeeklyTasks(prev => [...prev, task])
   
      } else {
        const { data: planData, error: planError } = await supabase
          .from("weekly_plans")
          .select()
          .eq("user_id", user.id)
          .eq("week_start", keepWeekStart)
          .single()

        if (planError) throw planError

        const { data: taskData, error: taskError } = await supabase
          .from("weekly_tasks")
          .insert({
            user_id: user.id,
            plan_id: planData.id,
            text: text,
            order_index: orderIndex
          })
          .select().single()

        if (taskError) throw taskError

        const goal: WeeklyGoal = {
          id: taskData.id,
          title: text,
          completed: false,
          orderIndex: orderIndex
        }

        setWeeklyTasks(prev => prev.map(week => 
          week.week === keepWeekStart ? 
          {
            ...week,
            goals: [...week.goals, goal]
          }
          : week
        ))
      }
    } catch(e) {
      console.error(e)
      alert("タスクの追加に失敗しました")
    }
  }

  return { 
    addWeeklyTasks,
    weeklyTasks,
    keepWeekStart
  }
}