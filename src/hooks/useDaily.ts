import { useState, useEffect, useRef } from "react"
import type { DailyRecord, DailyTaskRow } from "../types/daily"
import type { Task } from "../types/baseTask"
import { getNextOrderIndex } from "../api/orderIndexApi"
import { getCurrentUser } from "../api/authApi"
import {
  createFirstDailyTaskInDB,
  addDailyTaskInDB,
  getDailyPlanByDateInDB,
  updateDailyTaskTitleInDB,
  updateDailyTaskToggleInDB,
  deleteDailyCopyTaskInDB,
  daleteDailyTaskInDB,
  updateDailyRecordReflectionInDB,
  carryOverDailyTasksInDB,
  getDailyRecords,
  activateCarryOverTasks
} from "../api/dailyApi"

export default function useDaily() {

  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([])
  const addingDatesRef = useRef<Set<string>>(new Set())

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

  const todayPlan = dailyRecords.find(day => day.date === today)
  const tomorrowPlan = dailyRecords.find(day => day.date === tomorrowDate)
  const yesterdayPlan = dailyRecords.find(day => day.date === yesterdayDate)

  const [todayTasks, setTodayTasks] = useState<Task[]>(todayPlan?.tasks ?? [])
  const [tomorrowTasks, setTomorrowTasks] = useState<Task[]>(tomorrowPlan?.tasks ?? [])

  const addDailyRecord = async (text: string, date: string) => {
    if (text.trim() === "") return alert("タスク名を入力して下さい")

    if (addingDatesRef.current.has(date)) return

    addingDatesRef.current.add(date)

    try {
      const user = await getCurrentUser()
      const contentsDateId = await getDailyPlanByDateInDB(date, user.id)

      if (!contentsDateId) {
        const orderIndex = 0
        
        const taskData = await createFirstDailyTaskInDB(text, date, orderIndex, user.id)

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
        return taskData

      } else {
        const orderIndex = await getNextOrderIndex(
          "daily_tasks", 
          contentsDateId,
          user.id
        )

        const taskData = await addDailyTaskInDB(text, contentsDateId, orderIndex, user.id)
        
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
        return taskData

      }
    } catch(e) {
      console.error(e)
      alert("タスクの追加に失敗しました")
    } finally {
      addingDatesRef.current.delete(date)
    }
  }

  const updateDailyTaskTitle = async (id: string, text: string, date: string) => {
    try {
      if (text.trim() === "") alert("タスク名を入力して下さい")
      
      const user = await getCurrentUser()
      await updateDailyTaskTitleInDB(id, text, user.id)

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
      const user = await getCurrentUser()

      await updateDailyTaskToggleInDB(id, completed, user.id)
      const deleteTask = await deleteDailyCopyTaskInDB(id, user.id)
      
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
      const user = await getCurrentUser()

      await deleteDailyCopyTaskInDB(id, user.id)
      await daleteDailyTaskInDB(id, user.id)

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
      const user = await getCurrentUser()
      await updateDailyRecordReflectionInDB(text, date, user.id)

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

  const carryOverRecords = async (task: DailyTaskRow) => {
    try {
      if (!task) return
      const user = await getCurrentUser()

      const dataId = await getDailyPlanByDateInDB(tomorrowDate, user.id)

      if (!dataId) {
        await carryOverDailyTasksInDB(
          task,
          tomorrowDate,
          0,
          user.id
        )
        return
      }

      const orderIndex = await getNextOrderIndex(
          "daily_tasks", 
          dataId,
          user.id
        )

      await carryOverDailyTasksInDB(
        task,
        tomorrowDate,
        orderIndex,
        user.id
      )
  
    } catch (e) {
      console.error(e)
      alert("タスクのコピーに失敗しました")
    }
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const user = await getCurrentUser()
        await activateCarryOverTasks(today, user.id)
        
        const {plansData, tasksData} = await getDailyRecords(today, tomorrowDate, yesterdayDate, user.id)
        const taskFilter = tasksData.filter(task => task.source_task_id === null)

        const dailyRecords = plansData.map(plan => {
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