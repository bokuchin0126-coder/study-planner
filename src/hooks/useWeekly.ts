import { useState } from "react"
import type { WeeklyRecord, WeeklyGoal } from "../types/weekly"
import { supabase } from "../lib/supabase"

export default function useWeekly() {

  const [weeklyTasks, setWeeklyTasks] = useState<WeeklyRecord[]>([])

  const weekDate = (date: "start" | "end") => {
    const today = new Date()
    const day = today.getDay()

    const monday = new Date(today)
    const diff = day === 0 ? -6 : 1 - day
    monday.setDate(today.getDate() + diff)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    const weekStart = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Tokyo"
    }).format(monday)

    const weekEnd = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Tokyo"
    }).format(sunday)

    if (date === "start") return weekStart
    else if (date === "end") return weekEnd
    else return ""
  }

  const getCurrentUser = async () => {
    const { data: {user}, error } = await supabase.auth.getUser()
    
    if (error) throw error
    if (!user) throw new Error("ログインしてください")
    return user
  }

  const addWeeklyTasks = async (text: string) => {
    try {
      if (text.trim() === "") throw alert("タスクを入力して下さい")

      let currentWeekStart = weekDate("start")

      const contentsDate = weeklyTasks.find(week => week.week === currentWeekStart)
      const orderIndex = contentsDate ? contentsDate.goals.length : 0
      const user = await getCurrentUser()

      if (!contentsDate) {
        const { data: planData, error: planError } = await supabase
          .from("weekly_plans")
          .insert({
            user_id: user.id,
            week_start: currentWeekStart,
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
          week: currentWeekStart,
          goals: [goal],
          reflection: ""
        }

        setWeeklyTasks(prev => [...prev, task])
   
      } else {
        const { data: planData, error: planError } = await supabase
          .from("weekly_plans")
          .select()
          .eq("user_id", user.id)
          .eq("week_start", currentWeekStart)
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
          week.week === currentWeekStart ? 
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

  const updateWeeklyTaskText = async (id: string, text: string) => {
    try {
      if (text.trim() === "") throw alert("タスク名を入力してください")
      const user = await getCurrentUser()

      const { error } = await supabase
        .from("weekly_tasks")
        .update({
          text: text
        })
        .eq("user_id", user.id)
        .eq("id", id)

      if (error) throw error

      setWeeklyTasks(prev => prev.map(week => week.week === weekDate("start") ? 
        {
          ...week,
          goals: week.goals.map(goal => (
            goal.id === id ? {...goal, title: text} : goal
          ))
        }
        : week
      ))
    } catch(e) {
      console.error(e)
      alert("タスク名の変更に失敗しました")
    }
  }

  const updateTaskToggle = async (id: string, completed: boolean) => {
    try {
      const user = await getCurrentUser()

      const { error } = await supabase
        .from("weekly_tasks")
        .update({
          completed: completed
        })
        .eq("user_id", user.id)
        .eq("id", id)

      if (error) throw error

      setWeeklyTasks(prev => prev.map(week => week.week === weekDate("start") ? 
        {
          ...week,
          goals: week.goals.map(goal => (
            goal.id === id ? {...goal, completed: !completed} : goal
          ))
        }
        : week
      ))
    } catch(e) {
      console.error(e)
      alert("タグの切り替えに失敗しました")
    }
  }

  

  return { 
    addWeeklyTasks,
    updateWeeklyTaskText,
    updateTaskToggle,
    weeklyTasks,
    weekDate
  }
}