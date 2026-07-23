import { useState, useEffect, useRef } from "react"
import type { LongTermRecord, CompletedTask } from "../types/longTerm"
import type { Task } from "../types/baseTask"
import { supabase } from "../lib/supabase"


export default function useLongTerm() {
  const [longTermRecord, setLongTermRecord] = useState<LongTermRecord | null>(null)
  const [monthlyCompletedTasks, setMonthlyCompletedTasks] = useState<CompletedTask[]>([])

  const initializingRef = useRef(false)

  const getCurrentUser = async () => {
    const { data: {user}, error } = await supabase.auth.getUser()
      
    if (error) throw error
    if (!user) throw new Error("ログインしてください")
    return user
  }
  
  const addLongTermTask = async (text: string) => {
    try {
      if (!longTermRecord) throw alert("データがありませんでした")
      if (text.trim() === "") alert("タスク名を入力してください")

      const user = await getCurrentUser()
      const orderIndex = longTermRecord.tasks.length

      const { data: planData, error: planError } = await supabase
        .from("long_term_plans")
        .select()
        .eq("user_id", user.id)
        .eq("id", longTermRecord.id)
        .single()

      if (planError) throw planError

      const { data: taskData, error: taskError } = await supabase
        .from("long_term_tasks")
        .insert({
          user_id: user.id,
          text: text,
          plan_id: planData.id,
          order_index: orderIndex
        })
        .select().single()

      if (taskError) throw taskError

      setLongTermRecord(prev => {
        if (!prev) return null

        return {
          ...prev,
          tasks: [...prev.tasks, {
            id: taskData.id,
            title: text,
            completed: false,
            orderIndex: orderIndex
          }]
        }
      })
    } catch(e) {
      console.error(e)
      alert("タスクの追加に失敗しました")
    }
  }

  const updateLongTermGoal = async (text: string) => {
    try {
      if (!longTermRecord) throw alert("データがありませんでした")
      if (text.trim() === "") alert("目標を 入力してください")

      const user = await getCurrentUser()

      const { error } = await supabase
        .from("long_term_plans")
        .update({
          goal: text
        })
        .eq("user_id", user.id)
        .eq("id", longTermRecord.id)

      setLongTermRecord(prev => {
        if (!prev) return null

        return {
          ...prev,
          goal: text
        }
      })
    } catch(e) {
      console.error(e)
      alert("目標の更新に失敗しました")
    }
  }

  const updateLongTermEndDate = async (date: string) => {
    try {
      if (!longTermRecord) throw alert("データがありませんでした")
      const user = await getCurrentUser()
      
      const { error } = await supabase
        .from("long_term_plans")
        .update({
          end_date: date
        })
        .eq("user_id", user.id)
        .eq("id", longTermRecord.id)

      if (error) throw error

      setLongTermRecord(prev => {
        if (!prev) return null

        return {
          ...prev,
          endDate: date
        }
      })
    } catch(e) {
      console.error(e)
      alert("終了日付の更新に失敗しました")
    }
  }

  const updateLongTermStartDate = async (date: string) => {
    try {
      if (!longTermRecord) throw alert("データがありませんでした")
      const user = await getCurrentUser()

      const { error } = await supabase
        .from("long_term_plans")
        .update({
          start_date: date
        })
        .eq("user_id", user.id)
        .eq("id", longTermRecord.id)

      if (error) throw error

      setLongTermRecord(prev => {
        if (!prev) return null

        return {
          ...prev,
          startDate: date
        }
      })
    } catch(e) {
      console.error(e)
      alert("開始日の更新に失敗しました")
    }
  }

  const updateLongTermReflection = async (text: string) => {
    try {
      if (!longTermRecord) throw alert("データがありませんでした")

      const user = await getCurrentUser()

      const { error } = await supabase
        .from("long_term_plans")
        .update({
          reflection: text
        })
        .eq("user_id", user.id)
        .eq("id", longTermRecord.id)

      if (error) throw error

      setLongTermRecord(prev => {
        if (!prev) return null

        return {
          ...prev,
          reflection: text
        }
      })
    } catch(e) {
      console.error(e)
      alert("振り返りの更新に失敗しました")
    }
  }

  const updateLongTermToggle = async () => {
    try {
      if (!longTermRecord) throw alert("データがありませんでした")
      const user = await getCurrentUser()

      const { error } = await supabase
        .from("long_term_plans")
        .update({
          completed: !longTermRecord.completed
        })
        .eq("user_id", user.id)
        .eq("id", longTermRecord.id)

      if (error) throw error

      setLongTermRecord(prev => {
        if (!prev) return null

        return {
          ...prev,
          completed: !prev.completed
        }
      })
    } catch(e) {
      console.error(e)
      alert("タグの更新に失敗しました")
    }
  }

  const updateLongTermTaskTitle = async (id: string, text: string) => {
    try {
      if (!longTermRecord) throw alert("データがありませんでした")
      if (text.trim() === "") alert("タスク名を入力してください")

      const user = await getCurrentUser()

      const { error } = await supabase
        .from("long_term_tasks")
        .update({
          text: text
        })
        .eq("user_id", user.id)
        .eq("id", id)

      if (error) throw error

      setLongTermRecord(prev => {
        if (!prev) return null

        return {
          ...prev,
          tasks: prev.tasks.map(task => task.id === id ? 
            {
              ...task,
              title: text
            }
            : task
          )
        }
      })
    } catch(e) {
      console.error(e)
      alert("タスク名の更新に失敗しました")
    }
  }

  const updateLongTermTaskToggle = async (id: string) => {
    try {
      if (!longTermRecord) throw alert("データがありませんでした")
      const user = await getCurrentUser()
      const targetTask = longTermRecord.tasks.find(task => task.id === id)
      if (!targetTask) throw alert("選択されたタスクはすでに消えたか、IDが変わっています")

      const { error } = await supabase
        .from("long_term_tasks")
        .update({
          completed: !targetTask.completed
        })
        .eq("user_id", user.id)
        .eq("id", id)

      if (error) throw error

      setLongTermRecord(prev => {
        if (!prev) return null

        return {
          ...prev,
          tasks: prev.tasks.map(task => task.id === id ? 
            {
              ...task,
              completed: !targetTask.completed
            }
            : task
          )
        }
      })
    } catch(e) {
      console.error(e)
      alert("タグの更新に失敗しました")
    }
  }

  const deleteLongTermTask = async (id: string) => {
    try {
      if (!longTermRecord) throw alert("データがありませんでした")
      const user = await getCurrentUser()

      const { error } = await supabase
        .from("long_term_tasks")
        .delete()
        .eq("user_id", user.id)
        .eq("id", id)

      if (error) throw error

      setLongTermRecord(prev => {
        if (!prev) return null

        return {
          ...prev,
          tasks: prev.tasks.filter(task => task.id !== id)
        }
      })
    } catch(e) {
      console.error(e)
      alert("タスクの削除に失敗しました")
    }
  }
 
  const initializeLongTermPlan = async () => {
    if (initializingRef.current) return
    initializingRef.current = true

    try {
      const user = await getCurrentUser()

      const { data: currentPlan, error: currentPlanError } = await supabase
        .from("long_term_plans")
        .select()
        .eq("user_id", user.id)
        .eq("completed", false)
        .maybeSingle()

      if (currentPlanError) throw currentPlanError

      if (currentPlan) {
        const { data: tasksData, error: tasksError } = await supabase
          .from("long_term_tasks")
          .select()
          .eq("user_id", user.id)
          .eq("plan_id", currentPlan.id)

        if (tasksError) throw tasksError

        const tasks: Task[] = tasksData.map(task => ({
          id: task.id,
          title: task.text,
          completed: task.completed,
          orderIndex: task.order_index
        }))

        setLongTermRecord({
          id: currentPlan.id,
          startDate: currentPlan.start_date,
          endDate: currentPlan.end_date,
          tasks: tasks,
          reflection: currentPlan.reflection,
          goal: currentPlan.goal,
          completed: currentPlan.completed
        })
      } else {
        const today = new Date()
        const end = new Date(today)
        end.setMonth(end.getMonth() + 6)
        
        const formatDate = (date: Date) => date.toISOString().split("T")[0]
        const { data, error} = await supabase
          .from("long_term_plans")
          .insert({
            user_id: user.id,
            start_date: formatDate(today),
            end_date: formatDate(end),
            reflection: "",
            goal: ""
          })
          .select().single()

        if (error) throw error

        setLongTermRecord({
          id: data.id,
          startDate: formatDate(today),
          endDate: formatDate(end),
          tasks: [],
          reflection: "",
          goal: "",
          completed: false
        })
      }
    } catch(e) {
      console.error(e)
      alert("データの取得か、初期データの作成に失敗しました")
    } finally {
      initializingRef.current = false
    }
  }

  const fetchCompletedTasks = async () => {
    if (!longTermRecord) return
    try {
      const user = await getCurrentUser()

      const startPeriod = longTermRecord.startDate
      const endPeriod = longTermRecord.endDate

      const { data: plansData, error: plansError } = await supabase
        .from("monthly_plans")
        .select()
        .eq("user_id", user.id)
        .gte("month_start", startPeriod)
        .lte("month_start", endPeriod)

      if (plansError) throw plansError
      const planIds = plansData.map(plan => plan.id)

      if (planIds.length === 0) {
        setMonthlyCompletedTasks([])
        return
      }

      const { data: tasksData, error: tasksError } = await supabase
        .from("monthly_tasks")
        .select()
        .eq("user_id", user.id)
        .in("plan_id", planIds)

      if (tasksError) throw tasksError

      const planMap = new Map(plansData.map(plan => 
      [plan.id, plan.month_start]
      ))

      const completedTasks = (tasksData ?? [])
        .filter(task => task.completed)
        .map(task => ({
          month: planMap.get(task.plan_id),
          text: task.text
        }))

      setMonthlyCompletedTasks(completedTasks)
      
    } catch(e) {
      console.error(e)
      alert("データの取得に失敗しました")
    }
  }

  useEffect(() => {
    initializeLongTermPlan()
  }, [])

  return {
    longTermRecord,
    monthlyCompletedTasks,
    fetchCompletedTasks,
    addLongTermTask,
    updateLongTermGoal,
    updateLongTermStartDate,
    updateLongTermEndDate,
    updateLongTermReflection,
    updateLongTermToggle,
    updateLongTermTaskTitle,
    updateLongTermTaskToggle,
    deleteLongTermTask,
    initializeLongTermPlan
  }
}