import { useState, useEffect } from "react"
import type { MonthlyRecord } from "../types/monthly"
import type { Task } from "../types/baseTask"
import { supabase } from "../lib/supabase"


export default function useMonthly() {
  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyRecord[]>([])

  const getCurrentUser = async () => {
    const { data: {user}, error } = await supabase.auth.getUser()
      
    if (error) throw error
    if (!user) throw new Error("ログインしてください")
    return user
  }

  const monthlyDate = (date: "start" | "end", offset = 0) => {
    const now = new Date()

    const target = new Date(now.getFullYear(), now.getMonth() + offset, 1)

    const year = target.getFullYear()
    const month = target.getMonth()

    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)
  
    const format = (d: Date) => new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Tokyo"
    }).format(d)
  
    if (date === "start") return format(monthStart)
    else if (date === "end") return format(monthEnd)
    else return ""
  }

  const addMonthlyRecord = async (text: string, date: string) => {
    try {
      const user = await getCurrentUser()
      const currentDate = monthlyRecords.find(month => month.month === date)
      const orderIndex = currentDate ? currentDate.tasks.length : 0

      if (!currentDate) {
        const { data: planData, error: planError } = await supabase
          .from("monthly_plans")
          .insert({
            user_id: user.id,
            month_start: date,
            reflection: ""
          })
          .select().single()

        if (planError) throw planError

        const { data: taskData, error: taskError } = await supabase
          .from("monthly_tasks")
          .insert({
            user_id: user.id,
            plan_id: planData.id,
            text: text,
            order_index: orderIndex
          })
          .select().single()

        if (taskError) throw taskError

        const task: Task = {
          id: taskData.id,
          title: text,
          completed: false,
          orderIndex: orderIndex
        }

        const monthlyRecord: MonthlyRecord = {
          month: date,
          tasks: [task],
          reflection: ""
        }

        setMonthlyRecords(prev => [...prev, monthlyRecord])

      } else {
        const { data: planData, error: planError } = await supabase
          .from("monthly_plans")
          .select()
          .eq("user_id", user.id)
          .eq("month_start", date)
          .single()

        if (planError) throw planError

        const { data: taskData, error: taskError } = await supabase
          .from("monthly_tasks")
          .insert({
            user_id: user.id,
            plan_id: planData.id,
            text: text,
            order_index: orderIndex
          })
          .select().single()

        if (taskError) throw taskError

        const task: Task = {
          id: taskData.id,
          title: text,
          completed: false,
          orderIndex: orderIndex
        }

        setMonthlyRecords(prev => prev.map(month => month.month === date ? 
          {
            ...month,
            tasks: [...month.tasks, task]  
          }
          : month
        ))
      }
    } catch(e) {
      console.error(e)
      alert("タスクの追加に失敗しました")
    }
  }

  const updateMonthlyTaskTitle = async (id: string, text: string, date: string) => {
    try {
      const user = await getCurrentUser()

      const { error } = await supabase
        .from("monthly_tasks")
        .update({
          text: text
        })
        .eq("user_id", user.id)
        .eq("id", id)

      if (error) throw error

      setMonthlyRecords(prev => prev.map(month => month.month === date ? 
        {
          ...month,
          tasks: month.tasks.map(task => (
            task.id === id ? {...task, title: text} : task
          ))
        }
        : month
      ))
    } catch(e) {
      console.error(e)
      alert("タスクの編集に失敗しました")
    }
  }

  const updateMonthlyTaskToggle = async (id: string, completed: boolean, date: string) => {
    try {
      const user = await getCurrentUser()

      const { error } = await supabase
        .from("monthly_tasks")
        .update({
          completed: !completed
        })
        .eq("user_id", user.id)
        .eq("id", id)

      if (error) throw error

      setMonthlyRecords(prev => prev.map(month => month.month === date ? 
        {
          ...month,
          tasks: month.tasks.map(task => (
            task.id === id ? {...task, completed: !completed} : task
          ))
        }
        : month
      ))
    } catch(e) {
      console.error(e)
      alert("タグの切り替えに失敗しました")
    }
  }

  const updateMonthlyRecordReflection = async (text: string, date: string) => {
    try {
      const user = await getCurrentUser()

      const { error } = await supabase
        .from("monthly_plans")
        .update({
          reflection: text
        })
        .eq("user_id", user.id)
        .eq("month_start", date)

      if (error) throw error

      setMonthlyRecords(prev => prev.map(month => month.month === date ? 
        {
          ...month,
          reflection: text
        }
        : month
      ))
    } catch(e) {
      console.error(e)
      alert("振り返りテキストの更新に失敗しました")
    }
  }

  const deleteMonthlyTask = async (id: string, date: string) => {
    try {
      const user = await getCurrentUser()

      const { error } = await supabase
        .from("monthly_tasks")
        .delete()
        .eq("user_id", user.id)
        .eq("id", id)
        
      if (error) throw error

      setMonthlyRecords(prev => prev.map(month => month.month === date ? 
        {
          ...month,
          tasks: month.tasks.filter(task => task.id !== id)
        }
        : month
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
          .from("monthly_plans")
          .select()
          .eq("user_id", user.id)
          .in("month_start", [monthlyDate("start", -1), monthlyDate("start"), monthlyDate("start", 1)])

        if (plansError) throw plansError

        const planIds = plansData.map(plan => plan.id)

        const { data: tasksData, error: tasksError } = await supabase
         .from("monthly_tasks")
         .select()
         .eq("user_id", user.id)
         .in("plan_id", planIds) 

        if (tasksError) throw tasksError

        const tasks: Task[] = tasksData?.map(task => ({
          id: task.id,
          title: task.text,
          completed: task.completed,
          orderIndex: task.order_index
        }))

        const monthlyRecord: MonthlyRecord[] = plansData.map(plan => ({
          month: plan.date,
          tasks: tasks,
          reflection: plan.reflection
        }))

        setMonthlyRecords(monthlyRecord)
      } catch(e) {
        console.error(e)
        alert("データの取得に失敗しました")
      }
    } 
    fetch()
  }, [])

  return {
    addMonthlyRecord,
    updateMonthlyTaskTitle,
    updateMonthlyTaskToggle,
    updateMonthlyRecordReflection,
    deleteMonthlyTask,
    monthlyDate,
    monthlyRecords
  }
}