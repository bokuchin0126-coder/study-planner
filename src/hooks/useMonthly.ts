import { useState, useEffect } from "react"
import type { MonthlyRecord } from "../types/monthly"
import type { Task } from "../types/baseTask"
import { getCurrentUser } from "../api/authApi"
import { getNextOrderIndex } from "../api/orderIndexApi"
import {
  getMonthlyPlanByDateInDB,
  createdFirstMonthlyTaskInDB,
  addMonthlyTaskInDB,
  updateMonthlyTaskTitleInDB,
  updateMonthlyTaskToggleInDB,
  updateMonthlyReflectionInDB,
  deleteMonthlyTaskInDB,
  getMonthlyRecords
} from "../api/monthlyApi"


 
export default function useMonthly() {
  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyRecord[]>([])
  
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
      if (text.trim() === "") throw alert("タスク名を入力してください")
      const user = await getCurrentUser()
      const currentDateId = await getMonthlyPlanByDateInDB(date, user.id)

      const startDate = new Date(date)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
      endDate.setDate(0)

      const monthEnd = endDate.toISOString().split("T")[0]

      if (!currentDateId) {
        const orderIndex = 0
        const taskData = await createdFirstMonthlyTaskInDB(date, monthEnd, text, orderIndex, user.id)

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
        const orderIndex = await getNextOrderIndex(
          "monthly_plans", 
          "monthly_tasks", 
          "month_start", 
          date,
          user.id
        )
        const taskData = await addMonthlyTaskInDB(text, orderIndex, currentDateId, user.id)

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
      await updateMonthlyTaskTitleInDB(id, text, user.id)

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
      await updateMonthlyTaskToggleInDB(id, completed, user.id)

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
      await updateMonthlyReflectionInDB(text, date, user.id)

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
      await deleteMonthlyTaskInDB(id, user.id)

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
        const { plansData, tasksData } = await getMonthlyRecords(
          monthlyDate("start"),
          monthlyDate("start", -1),
          monthlyDate("start", 1),
          user.id
        )

        const tasks: Task[] = tasksData?.map(task => ({
          id: task.id,
          title: task.text,
          completed: task.completed,
          orderIndex: task.order_index
        }))

        const monthlyRecord: MonthlyRecord[] = plansData.map(plan => ({
          month: plan.month_start,
          tasks: tasks.filter(task =>
            tasksData.find( t =>
              t.id === task.id &&
              t.plan_id === plan.id
            )
          ),
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