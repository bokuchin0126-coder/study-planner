import { useState } from "react"
import { supabase } from "../lib/supabase"
import type { DailyRecord, DailyTask } from "../types/daily"


export function useDaily() {

  const getCurrentUser = async () => {
    const { data: {user}, error } = await supabase.auth.getUser()
    
    if (error) throw error
    if (!user) throw new Error("ログインしてください")
    return user
  }

  const [dailyTasks, setDailyTasks] = useState<DailyRecord[]>([])


  const addDailyTasks = async (text: string, date: string) => {
    try {
      if (text.trim() === "") return alert("タスク名を入力して下さい")

      const user = await getCurrentUser()
      const currentDate = dailyTasks.find(day => day.date === date)

      if (!currentDate) {

        const { data: planData, error: planError } = await supabase
          .from("daily_plans")
          .insert({
            user_id: user.id,
            date: date,
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
            date: date,
            tasks: [{
                id: taskData.id,
                title: text,
                completed: false
            }],
            reflection: ""
        }

        setDailyTasks(prev => [...prev, newTasks])

      } else {

        const { data: planData, error: planError } = await supabase
          .from("daily_plans")
          .select()
          .eq("user_id", user.id)
          .eq("date", date)
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
           day.date === date ? {
            ...day,
            tasks: [...day.tasks, newTasks]
          }
          : day
        ))
      }
    } catch(e: any) {
      console.error(e)
      alert(e.message)
    }
  }

  const updateDailyTaskTitle = async (id: string, text: string, date: string) => {
    try {
      if (text.trim() === "") alert("タスク名を入力して下さい")

      const user = await getCurrentUser()

      const { error } = await supabase
        .from("daily_tasks")
        .update({
          text: text
        })
        .eq("user_id", user.id)
        .eq("id", id)

      if (error) throw error

      setDailyTasks(prev => prev.map(day => day.date === date ?
        {
          ...day,
          tasks: day.tasks.map(task =>
            task.id === id ? {...task, title: text} 
            : task
          )
        }
        : day
      ))
    } catch(e) {
      console.error(e)
      alert("タスク名の変更に失敗しました")
    }
  }

  const updateDailyTasksToggle = async (id: string, completed: boolean, date: string) => {
    try {
      const user = await getCurrentUser()

      const { error } = await supabase
        .from("daily_tasks")
        .update({
          completed: !completed
        })
        .eq("user_id", user.id)
        .eq("id", id)

      setDailyTasks(prev => prev.map(day => day.date === date ?
        {
          ...day,
          tasks: day.tasks.map(task => 
            task.id === id ? {...task, completed: !completed} : task
          )
        }
        : day
      ))
    } catch(e) {
      console.error(e)
      alert("タグ切り替えに失敗しました")
    }
  }

  const deleteDailyTask = async (id: string, date: string) => {
    try {
      const user = await getCurrentUser()

      const { error } = await supabase
        .from("daily_tasks")
        .delete()
        .eq("user_id", user.id)
        .eq("id", id)

      setDailyTasks(prev => prev.map(day => day.date === date ? 
        {
          ...day,
          tasks: day.tasks.filter(task => task.id !== id)
        }
        : day
      ))
    } catch(e) {
      console.error(e)
      alert("タスクの削除に失敗しました")
    }
  }

  const updateDailyTaskReflection = async (text: string, date: string) => {
    try {
      const user = await getCurrentUser()

      const { error } = await supabase
        .from("daily_plans")
        .update({
          reflectioin: text
        })
        .eq("user_id", user.id)
        .eq("date", date)

        setDailyTasks(prev => prev.map(day => day.date === date ? 
          {
            ...day,
            reflection: text
          }
          : day
        ))
    } catch(e) {
      console.error(e)
      alert("振り返りの更新に失敗しました")
    }
  }

  return {
    dailyTasks,
    addDailyTasks,
    updateDailyTaskTitle,
    updateDailyTasksToggle,
    deleteDailyTask,
    updateDailyTaskReflection
  }
}