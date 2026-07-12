import { useState, useEffect } from "react"
import type { WeeklyRecord, WeeklyGoal } from "../types/weekly"
import { supabase } from "../lib/supabase"

export default function useWeekly() {

  const [weeklyTasks, setWeeklyTasks] = useState<WeeklyRecord[]>([])

  const getCurrentUser = async () => {
    const { data: {user}, error } = await supabase.auth.getUser()
    
    if (error) throw error
    if (!user) throw new Error("ログインしてください")
    return user
  }

  const weekDate = (date: "start" | "end", offset = 0) => {
    const today = new Date()
    const day = today.getDay()
  
    const monday = new Date(today)
    const diff = day === 0 ? -6 : 1 - day
    monday.setDate(today.getDate() + diff + offset * 7)
  
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

  const addWeeklyTasks = async (text: string, date: string) => {
    try {
      if (text.trim() === "") throw alert("タスクを入力して下さい")

      const contentsDate = weeklyTasks.find(week => week.week === date)
      const orderIndex = contentsDate ? contentsDate.goals.length : 0
      const user = await getCurrentUser()

      if (!contentsDate) {
        const { data: planData, error: planError } = await supabase
          .from("weekly_plans")
          .insert({
            user_id: user.id,
            week_start: date,
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
          week: date,
          goals: [goal],
          reflection: ""
        }

        setWeeklyTasks(prev => [...prev, task])
   
      } else {
        const { data: planData, error: planError } = await supabase
          .from("weekly_plans")
          .select()
          .eq("user_id", user.id)
          .eq("week_start", date)
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
          week.week === date ? 
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

  const updateWeeklyTaskText = async (id: string, text: string, date: string) => {
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

      setWeeklyTasks(prev => prev.map(week => week.week === date ? 
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

  const updateTaskToggle = async (id: string, completed: boolean, date: string) => {
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

      setWeeklyTasks(prev => prev.map(week => week.week === date ? 
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

  const updateWeeklyTaskReflection = async (text: string, date: string) => {
    try {
      const user = await getCurrentUser()

      const { error } = await supabase
        .from("weekly_plans")
        .update({
          reflection: text
        })
        .eq("user_id", user.id)
        .eq("week_start", date)

      if (error) throw error

      setWeeklyTasks(prev => prev.map(week => week.week === date ? 
        {
          ...week,
          reflection: text
        }
        : week
      ))
    } catch(e) {
      console.error(e)
      alert("振り返りの編集に失敗しました")
    }
  }

  const deleteWeeklyTask = async (id: string, date: string) => {
    try {
      const user = await getCurrentUser()

      const { error } = await supabase
        .from("weekly_tasks")
        .delete()
        .eq("user_id", user.id)
        .eq("id", id)

      if (error) throw error

      setWeeklyTasks(prev => prev.map(week => week.week === date ? 
        {
          ...week,
          goals: week.goals.filter(goal => goal.id !== id)
        }
        : week
      ))
    } catch(e) {
      console.error(e)
      alert("タスクの削除に失敗しました")
    }
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const user = await getCurrentUser()

        const { data: plansData, error: plansError } = await supabase
          .from("weekly_plans")
          .select()
          .eq("user_id", user.id)
          .in("week_start", [weekDate("start"), weekDate("start", -1), weekDate("start", 1)])

        if (plansError) throw plansError
        const planIds = plansData.map(plan => plan.id)

        const { data: tasksData, error: tasksError } = await supabase
          .from("weekly_tasks")
          .select()
          .eq("user_id", user.id)
          .in("plan_id", planIds)

        if (tasksError) throw tasksError

        const weeklyRecord: WeeklyRecord[] = plansData.map(plan => {
          const goals = tasksData
          .filter(task => task.plan_id === plan.id)
          .map(task => ({
            id: task.id,
            title: task.text,
            completed: task.completed,
            orderIndex: task.order_index
          }))

          return {
            week: plan.week_start,
            goals: goals,
            reflection: plan.reflection
          }
        })

        setWeeklyTasks(weeklyRecord)
      } catch(e) {
        console.error(e)
        alert("データの取得に失敗しました")
      } 
    }
    fetch()
  }, [])

  return { 
    addWeeklyTasks,
    updateWeeklyTaskText,
    updateTaskToggle,
    updateWeeklyTaskReflection,
    deleteWeeklyTask,
    weeklyTasks,
    weekDate
  }
}