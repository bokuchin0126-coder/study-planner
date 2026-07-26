import type { CompletedRecord, LongTermCompletedRecord } from "../types/completed"
import { useState } from "react"
import { supabase } from "../lib/supabase"


export default function useCompleted() {
  const [dailyCompletedRecords, setDailyCompletedRecords] = useState<CompletedRecord[]>([])
  const [weeklyCompletedRecords, setWeeklyCompletedRecords] = useState<CompletedRecord[]>([])
  const [monthlyCompletedRecords, setMonthlyCompletedRecords] = useState<CompletedRecord[]>([])
  const [longTermCompletedRecords, setLongTermCompletedRecords] = useState<LongTermCompletedRecord[]>([])

  const getCurrentUser = async () => {
    const { data: {user}, error } = await supabase.auth.getUser()
      
    if (error) throw error
    if (!user) throw new Error("ログインしてください")
    return user
  }

  const fetchCompletedRecords = async (planTable: string, taskTable:string) => {
    try {
      const user = await getCurrentUser()

      const { data: plansData, error: plansError } = await supabase
        .from(planTable)
        .select("*")
        .eq("user_id", user.id)

      if (plansError) throw plansError

      const { data: tasksData, error: tasksError } = await supabase
        .from(taskTable)
        .select("*")
        .eq("user_id", user.id)
 
      if (tasksError) throw tasksError

      const completedRecords: CompletedRecord[] = plansData.map(plan => {
        const tasks = tasksData 
          .filter(task => task.plan_id === plan.id)
          .map(task => ({
            title: task.text,
            completed: task.completed
          }))

        return {
          startDate: plan.start_date,
          endDate: plan.end_date,
          tasks: tasks,
          reflection: plan.reflection
        }
      }) 
      return completedRecords

    } catch(e) {
      console.error(e)
      alert("データの取得に失敗しました")
    } 
  }

  const fetchDailyCompletedRecords = async () => {
    try {
      const user = await getCurrentUser()

      const { data: plansData, error: plansError } = await supabase
        .from("daily_plans")
        .select("*")
        .eq("user_id", user.id)

      if (plansError) throw plansError

      const { data: tasksData, error: tasksError } = await supabase
        .from("daily_tasks")
        .select("*")
        .eq("user_id", user.id)

      if (tasksError) throw tasksError

      const completedRecrods: CompletedRecord[] = plansData.map(plan => {
        const tasks = tasksData 
          .filter(task => task.plan_id === plan.id)
          .map(task => ({
            title: task.text,
            completed: task.completed
          }))

        return {
          startDate: plan.Date,
          endDate: "",
          tasks: tasks,
          reflection: plan.reflection
        }
      }) 

      setDailyCompletedRecords(completedRecrods)
    } catch(e) {
      console.error(e)
      alert("データの取得に失敗しました")
    }
  }

  const fetchWeeklyCompletedRecords = async () => {
    try {
      const records = await fetchCompletedRecords(
        "weekly_plans",
        "weekly_tasks"
      )
      if (!records) return

      setWeeklyCompletedRecords(records)
    } catch(e) {
      console.error(e)
      alert("データの取得に失敗しました")
    }
  }

  const fetchMonthlyCompletedRecords = async () => {
    try {
      const records = await fetchCompletedRecords(
        "monthly_plans",
        "monthly_tasks"
      )
      if (!records) return

      setMonthlyCompletedRecords(records)
    } catch(e) {
      console.error(e)
      alert("データの取得に失敗しました")
    }
  }

  const fetchLongTermCompletedRecords = async () => {
    try {
      const user = await getCurrentUser()

      const { data: plansData, error: plansError } = await supabase
        .from("long_term_plans")
        .select("*")
        .eq("user_id", user.id)

      if (plansError) throw plansError

      const { data: tasksData, error: tasksError } = await supabase
        .from("long_term_tasks")
        .select("*")
        .eq("user_id", user.id)

      if (tasksError) throw tasksError

      const records = plansData.map(plan => {
        const tasks = tasksData
          .filter(task => task.plan_id === plan.id)
          .map(task => ({
            title: task.text,
            completed: task.completed
          }))

        return {
          startDate: plan.start_date,
          endDate: plan.end_date,
          goal: plan.goal,
          reflection: plan.reflection,
          tasks: tasks,
          completed: plan.completed
        }
      })
      setLongTermCompletedRecords(records)
    } catch(e) {
      console.error(e)
      alert("データの取得に失敗しました")
    }
  }

  const fetchAllCompletedRecords = async () => {
    await fetchDailyCompletedRecords()
    await fetchWeeklyCompletedRecords()
    await fetchMonthlyCompletedRecords()
    await fetchLongTermCompletedRecords()
  }

  return {
    dailyCompletedRecords,
    weeklyCompletedRecords,
    monthlyCompletedRecords,
    longTermCompletedRecords,
    fetchAllCompletedRecords
  }
}