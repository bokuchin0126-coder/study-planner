import { useState, useEffect, useRef } from "react"
import type { LongTermRecord, CompletedTask } from "../types/longTerm"
import type { Task } from "../types/baseTask"
import { getNextOrderIndex } from "../api/orderIndexApi"
import {
  addLongTermTaskInDB,
  updateLongTermGoalInDB,
  updateLongTermEndDateInDB,
  updateLongTermStartDateInDB,
  updateLongTermReflectionInDB,
  updateLonTermToggleInDB,
  updateLongTermTaskTitleInDB,
  updateLongTermTaskToggleInDB,
  deleteLongTermTaskInDB,
  getCurrentLongTermPlanInDB,
  createInitialLongTermPlanInDB,
  getMonthlyPlansInLongTerm
} from "../api/longTermApi"


export default function useLongTerm() {
  const [longTermRecord, setLongTermRecord] = useState<LongTermRecord | null>(null)
  const [monthlyCompletedTasks, setMonthlyCompletedTasks] = useState<CompletedTask[]>([])

  const initializingRef = useRef(false)
  
  const addLongTermTask = async (text: string) => {
    try {
      if (!longTermRecord) throw alert("データがありませんでした")
      if (text.trim() === "") alert("タスク名を入力してください")

      const orderIndex = await getNextOrderIndex(
        "long_term_plans",
        "long_term_tasks",
        "start_date",
        longTermRecord.startDate
      )
      
      const taskData = await addLongTermTaskInDB(longTermRecord.id, text, orderIndex)

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

      await updateLongTermGoalInDB(text, longTermRecord.id)

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

      await updateLongTermEndDateInDB(date, longTermRecord.id)

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

      await updateLongTermStartDateInDB(date, longTermRecord.id)

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

      await updateLongTermReflectionInDB(text, longTermRecord.id)

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
      
      await updateLonTermToggleInDB(longTermRecord.completed, longTermRecord.id)

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

      await updateLongTermTaskTitleInDB(text, id)

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

      const targetTask = longTermRecord.tasks.find(task => task.id === id)
      if (!targetTask) throw alert("選択されたタスクはすでに消えたか、IDが変わっています")

      await updateLongTermTaskToggleInDB(targetTask.completed, id)

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

      await deleteLongTermTaskInDB(id)

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
      const { currentPlan, tasksData } = await getCurrentLongTermPlanInDB()

      if (currentPlan) {
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

        const data = await createInitialLongTermPlanInDB(formatDate(today), formatDate(end))

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
      const startPeriod = longTermRecord.startDate
      const endPeriod = longTermRecord.endDate

      const { plansData, tasksData } = await getMonthlyPlansInLongTerm(startPeriod, endPeriod)

      if (plansData.length === 0) {
        setMonthlyCompletedTasks([])
        return
      }

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