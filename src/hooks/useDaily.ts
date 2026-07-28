import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import type { DailyRecord } from "../types/daily"
import getCurrentUser from "../lib/auth"
import type { Task } from "../types/baseTask"
import {
  createFirstDailyTaskInDB,
  addDailyTaskInDB,
  updateDailyTaskTitleInDB,
  updateDailyTaskToggleInDB,
  deleteDailyCopyTaskInDB,
  daleteDailyTaskInDB,
  updateDailyRecordReflectionInDB,
  carryOverDailyTasksInDB
} from "../api/dailyApi"

export default function useDaily() {

  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([])

  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo"
  }).format(new Date())

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const tomorrowDate = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo"
  }).format(tomorrow)

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const yesterdayDate = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo"
  }).format(yesterday)

  const [dateData, setDateData] = useState<string>(today)

  const todayPlan = dailyRecords.find(day => day.date === today)
  const tomorrowPlan = dailyRecords.find(day => day.date === tomorrowDate)
  const yesterdayPlan = dailyRecords.find(day => day.date === yesterdayDate)
  const carryTasks = todayPlan?.tasks.filter(task => !task.completed)

  const [todayTasks, setTodayTasks] = useState<Task[]>(todayPlan?.tasks ?? [])
  const [tomorrowTasks, setTomorrowTasks] = useState<Task[]>(tomorrowPlan?.tasks ?? [])

  const addDailyRecord = async (text: string, date: string) => {
    try {
      if (text.trim() === "") return alert("タスク名を入力して下さい")
      const contentsDate = dailyRecords.find(day => day.date === date)

      const orderIndex = todayPlan?.tasks.length ?? 0

      if (!contentsDate) {
        const taskData = await createFirstDailyTaskInDB(text, date, orderIndex)

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
        setDailyRecords(prev => [...prev, newTasks])

      } else {
        const taskData = await addDailyTaskInDB(text, date, orderIndex)
        
        const newTasks: Task = {
          id: taskData.id,
          title: text,
          completed: false,
          orderIndex: orderIndex
        }
        
        setDailyRecords(prev => prev.map(day =>
           day.date === date ? {
            ...day,
            tasks: [...day.tasks, newTasks]
          }
          : day
        ))
      }
    } catch(e) {
      console.error(e)
      alert("タスクの追加に失敗しました")
    }
  }

  const updateDailyTaskTitle = async (id: string, text: string, date: string) => {
    try {
      if (text.trim() === "") alert("タスク名を入力して下さい")
        
      await updateDailyTaskTitleInDB(id, text)

      setDailyRecords(prev => prev.map(day => day.date === date ?
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

  const updateDailyTaskToggle = async (id: string, completed: boolean, date: string) => {
    try {
      const taskData = await updateDailyTaskToggleInDB(id, completed)
      const deleteTask = await deleteDailyCopyTaskInDB(taskData.id)
      
      if (deleteTask && deleteTask.length > 0) {
        setDailyRecords(prev => prev.map(day => ({
          ...day,
          tasks: day.tasks.filter(task => 
            !deleteTask.some(
              deleted => deleted.id === task.id
            )
          )
        })))
      }

      setDailyRecords(prev => prev.map(day => day.date === date ?
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
      await daleteDailyTaskInDB(id)

      setDailyRecords(prev => prev.map(day => day.date === date ? 
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
 
  const updateDailyRecordReflection = async (text: string, date: string) => {
    try {
      await updateDailyRecordReflectionInDB(text, date)

      setDailyRecords(prev => prev.map(day => day.date === date ? 
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

  const carryOverRecords = async () => {
    try {
      if (!carryTasks || carryTasks.length === 0) return

      const orderIndex = todayPlan?.tasks.length ?? 0

      const taskData = await carryOverDailyTasksInDB(
        carryTasks,
        tomorrowDate,
        orderIndex
      )

      if (!taskData || taskData.length === 0) return

      if (today > dateData) {
        const newTasks = taskData.map(task => ({
          id: task.id,
          title: task.text,
          completed: false,
          orderIndex: task.order_index
        }))
  
        const exists = dailyRecords.some(
          day => day.date === tomorrowDate
        )
  
        if (exists) {
          setDailyRecords(prev =>
            prev.map(day =>
              day.date === tomorrowDate
                ? {
                    ...day,
                    tasks: [...day.tasks, ...newTasks]
                  }
                : day
            )
          )
        } else {
          setDailyRecords(prev => [
            ...prev,
            {
              date: tomorrowDate,
              tasks: newTasks,
              reflection: ""
            }
          ])
        }
        setDateData(today)
      }
    } catch (e) {
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
          .in("date", [today, tomorrowDate, yesterdayDate])

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
        console.log(dailyRecords)

        setDailyRecords(dailyRecords)
      } catch(e) {
        console.error(e)
        alert("データの取得に失敗しました")
      }
    }
    fetch()
  }, [])

  useEffect(() => {
    if (todayPlan) {
      setTodayTasks(todayPlan.tasks)
    }
  }, [todayPlan])

  useEffect(() => {
    if (tomorrowPlan) {
      setTomorrowTasks(tomorrowPlan.tasks)
    }
  }, [tomorrowPlan])


  return {
    dailyRecords,
    today,
    todayTasks,
    setTodayTasks,
    tomorrowTasks,
    setTomorrowTasks,
    tomorrowDate,
    todayPlan,
    tomorrowPlan,
    yesterdayPlan,
    addDailyRecord,
    updateDailyTaskTitle,
    updateDailyTaskToggle,
    deleteDailyTask,
    updateDailyRecordReflection,
    carryOverRecords
  }
}