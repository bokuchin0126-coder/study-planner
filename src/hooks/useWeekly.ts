import { useState, useEffect } from "react"
import type { WeeklyRecord } from "../types/weekly"
import type { Task } from "../types/baseTask"
import { supabase } from "../lib/supabase"
import getCurrentUser from "../lib/auth"
import {
  createdFirstWeeklyTaskInDB,
  addWeeklyTaskInDB,
  updateWeeklyTaskTitleInDB,
  updateWeeklyTaskToggleInDB,
  updateWeeklyReflectionInDB,
  daleteWeeklyTaskInDB,
  getWeeklyRecords,
  getNextOrderIndex
} from "../api/weeklyApi"


export default function useWeekly() {

  const [weeklyRecords, setWeeklyRecords] = useState<WeeklyRecord[]>([])

  const weeklyDate = (date: "start" | "end", offset = 0) => {
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

  const addWeeklyRecord = async (text: string, startDate: string, endDate: string) => {
    try {
      if (text.trim() === "") throw alert("タスクを入力して下さい")

      const contentsDate = weeklyRecords.find(week => week.week === startDate)

      if (!contentsDate) {
        const orderIndex = 0

        const taskData = await createdFirstWeeklyTaskInDB(startDate, endDate, text, orderIndex)

        const task: Task = {
          id: taskData.id,
          title: text,
          completed: false,
          orderIndex: orderIndex
        }

        const weeklyRecord: WeeklyRecord = {
          week: startDate,
          tasks: [task],
          reflection: ""
        }

        setWeeklyRecords(prev => [...prev, weeklyRecord])
   
      } else {
        const orderIndex = await getNextOrderIndex(startDate)
        
        const taskData = await addWeeklyTaskInDB(startDate, text, orderIndex)

        const task: Task = {
          id: taskData.id,
          title: text,
          completed: false,
          orderIndex: orderIndex
        }

        setWeeklyRecords(prev => prev.map(week => 
          week.week === startDate ? 
          {
            ...week,
            tasks: [...week.tasks, task]
          }
          : week
        ))
      }
    } catch(e) {
      console.error(e)
      alert("タスクの追加に失敗しました")
    }
  }

  const updateWeeklyTaskTitle = async (id: string, text: string, date: string) => {
    try {
      if (text.trim() === "") throw alert("タスク名を入力してください")
      await updateWeeklyTaskTitleInDB(id, text)

      setWeeklyRecords(prev => prev.map(week => week.week === date ? 
        {
          ...week,
          tasks: week.tasks.map(task => (
            task.id === id ? {...task, title: text} : task
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
      await updateWeeklyTaskToggleInDB(id, completed)

      setWeeklyRecords(prev => prev.map(week => week.week === date ? 
        {
          ...week,
          tasks: week.tasks.map(task => (
            task.id === id ? {...task, completed: !completed} : task
          ))
        }
        : week
      ))
    } catch(e) {
      console.error(e)
      alert("タグの切り替えに失敗しました")
    }
  }

  const updateWeeklyRecordReflection = async (text: string, date: string) => {
    try {
      await updateWeeklyReflectionInDB(text, date)

      setWeeklyRecords(prev => prev.map(week => week.week === date ? 
        {
          ...week,
          reflection: text
        }
        : week
      ))
    } catch(e) {
      console.error(e)
      alert("振り返りテキストの更新に失敗しました")
    }
  }

  const deleteWeeklyTask = async (id: string, date: string) => {
    try {
      await daleteWeeklyTaskInDB(id)

      setWeeklyRecords(prev => prev.map(week => week.week === date ? 
        {
          ...week,
          tasks: week.tasks.filter(task => task.id !== id)
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
        const { plansData, tasksData } = await getWeeklyRecords(
          weeklyDate("start"), 
          weeklyDate("start", -1), 
          weeklyDate("start", 1)
        )
 
        const weeklyRecord: WeeklyRecord[] = plansData.map(plan => {
          const tasks = tasksData
          .filter(task => task.plan_id === plan.id)
          .map(task => ({
            id: task.id,
            title: task.text,
            completed: task.completed,
            orderIndex: task.order_index
          }))

          return {
            week: plan.week_start,
            tasks: tasks,
            reflection: plan.reflection
          }
        })

        setWeeklyRecords(weeklyRecord)
      } catch(e) {
        console.error(e)
        alert("データの取得に失敗しました")
      } 
    }
    fetch()
  }, [])

  return { 
    addWeeklyRecord,
    updateWeeklyTaskTitle,
    updateTaskToggle,
    updateWeeklyRecordReflection,
    deleteWeeklyTask,
    weeklyRecords,
    weeklyDate
  }
}