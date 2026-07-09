import { useState, useEffect } from "react"
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

  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo"
  }).format(new Date())

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const tomorrowDate = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo"
  }).format(tomorrow)

  const [dateData, setDateData] = useState<string>(today)

  const todayPlan = dailyTasks.find(day => day.date === today)
  const tomorrowPlan = dailyTasks.find(day => day.date === tomorrowDate)
  const carryTasks = todayPlan?.tasks.filter(task => !task.completed)


  const addDailyTasks = async (text: string, date: string) => {
    try {
      if (text.trim() === "") return alert("タスク名を入力して下さい")
      const contentsDate = dailyTasks.find(day => day.date === date)

      const user = await getCurrentUser()

      const orderIndex = dailyTasks.length

      if (!contentsDate) {

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
          text: text,
          order_index: orderIndex
        })
        .select().single()

        if (taskError) throw taskError

        const newTasks: DailyRecord = {
            date: date,
            tasks: [{
                id: taskData.id,
                title: text,
                completed: false,
                orderIndex: orderIndex
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
            text: text,
            order_index: orderIndex
          })
          .select().single()
        
        if (taskError) throw taskError

        const newTasks: DailyTask = {
          id: taskData.id,
          title: text,
          completed: false,
          orderIndex: orderIndex
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

      const { data: taskData, error: taskError } = await supabase
        .from("daily_tasks")
        .update({
          completed: !completed
        })
        .eq("user_id", user.id)
        .eq("id", id)
        .select().single()

      if (taskError) throw taskError

      const { data: deleteTask, error: deleteError } = await supabase
        .from("daily_tasks")
        .delete()
        .eq("user_id", user.id)
        .eq("source_task_id", taskData.id)
        .select()

      if (deleteError) throw deleteError

      if (deleteTask.length > 0) {
        setDailyTasks(prev => prev.map(day => ({
          ...day,
          tasks: day.tasks.filter(task => 
            !deleteTask.some(
              deleted => deleted.id === task.id
            )
          )
        })))
      }

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

  const carryOverTasks = async () => {
    try {
      if (!carryTasks) return  
      if (carryTasks.length === 0) return

      const user = await getCurrentUser()

      const { data: tomorrowPlanData } = await supabase
        .from("daily_plans")
        .select()
        .eq("user_id", user.id)
        .eq("date", tomorrowDate)
        .maybeSingle()

      if (!tomorrowPlanData) {
        const { data: planData, error: planError } = await supabase
          .from("daily_plans")
          .insert({
            user_id: user.id,
            date: tomorrowDate,
            reflection: ""
          })
          .select().single()

        if (planError) throw planError

        const { data: existsTasks, error: existsError } = await supabase
          .from("daily_tasks")
          .select("source_task_id")
          .eq("plan_id", planData.id)

        if (existsError) throw existsError

        const filteredTasks = carryTasks.filter(task =>
          !existsTasks.some(
            copied => copied.source_task_id === task.id
          )
        )

        if (filteredTasks.length === 0) return 

        const insertTasks = filteredTasks.map(task => ({
          user_id: user.id,
          plan_id: planData.id,
          text: task.title,
          source_task_id: task.id
        }))

        const { data: taskData, error: taskError } = await supabase
          .from("daily_tasks")
          .insert(insertTasks)
          .select()

        if (taskError) throw taskError

        if (today > dateData) {
          const newTasks = taskData.map(task => ({
            id: task.id,
            title: task.text,
            completed: false,
            orderIndex: task.order_index
          }))

          const copyDate = {
            date: tomorrowDate,
            tasks: newTasks,
            reflection: ""
          }

          setDailyTasks(prev => [...prev, copyDate])
          setDateData(today)
        }

      } else {
        const { data: planData, error: planError } = await supabase
          .from("daily_plans")
          .select()
          .eq("user_id", user.id)
          .eq("date", tomorrowDate)
          .single()

        if (planError) throw planError

        const { data: existsTasks, error: existsError } = await supabase
          .from("daily_tasks")
          .select("source_task_id")
          .eq("plan_id", planData.id)

        if (existsError) throw existsError

        const filteredTasks = carryTasks.filter(task =>
          !existsTasks.some(
            copied => copied.source_task_id === task.id
          )
        )

        if (filteredTasks.length === 0) return

        const insertTasks = filteredTasks.map(task => ({
          user_id: user.id,
          plan_id: planData.id,
          text: task.title,
          source_task_id: task.id
        }))

        const { data: taskData, error: taskError } = await supabase
          .from("daily_tasks")
          .insert(insertTasks)
          .select()

        if (taskError) throw taskError

        if (today > dateData) {
          const newTasks = taskData.map(task => ({
            id: task.id,
            title: task.text,
            completed: false,
            orderIndex: task.order_index
          }))
  
          setDailyTasks(prev => prev.map(day => day.date === tomorrowDate ?
            {
              ...day,
              tasks: [...day.tasks, ...newTasks]
            }
            : day
          ))
          setDateData(today)
        }
      }
    } catch(e) {
      console.error(e)
      alert("タスクのコピーに失敗しました")
    }
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const user = await getCurrentUser()

        const { data: planData, error: planError } = await supabase
          .from("daily_plans")
          .select()
          .eq("user_id", user.id)
          .in("date", [today, tomorrowDate])

        if (planError) throw planError
        const planIds = planData.map(plan => plan.id)

        const { data: tasksData, error: tasksError } = await supabase
          .from("daily_tasks")
          .select()
          .eq("user_id", user.id)
          .in("plan_id", planIds)

        if (tasksError) throw tasksError

        const taskFilter = tasksData.filter(task => task.source_task_id === null)

        const dailyRecords = planData.map(plan => {
          const tasks = taskFilter
            .filter(task => task.plan_id === plan.id)
            .map(task => ({
              id: task.id,
              title: task.text,
              completed: task.completed,
              orderIndex: task.order_index
            }))

          return {
            date: plan.date,
            tasks: tasks,
            reflection: plan.reflection,
          }
        })

        setDailyTasks(dailyRecords)
      } catch(e) {
        console.error(e)
        alert("データの取得に失敗しました")
      }
    }
    fetch()
  }, [])

  return {
    dailyTasks,
    today,
    tomorrowDate,
    todayPlan,
    tomorrowPlan,
    addDailyTasks,
    updateDailyTaskTitle,
    updateDailyTasksToggle,
    deleteDailyTask,
    updateDailyTaskReflection,
    carryOverTasks
  }
}