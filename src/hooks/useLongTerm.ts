import { useState, useEffect } from "react"
import type { longTermRecord } from "../types/longTerm"
import type { Task } from "../types/baseTask"
import { supabase } from "../lib/supabase"


export default function useLongTerm() {

  const today = new Date()
  const format = (date: Date) => 
    new  Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Tokyo"
  }).format(date)

  const defaultStartDate = format(today)

  const end = new Date(today)
  end.setMonth(end.getMonth() + 6)

  const defaultEndDate = format(end)

  const [longTermRecords, setLongTermRecords] = useState<longTermRecord[]>([{
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    goal: "",
    reflection: "",
    completed: false,
    tasks: []
  }])

  const [startDate, setStartDate] = useState<string>(defaultStartDate)
  const [endDate, setEndDate] = useState<string>(defaultEndDate)

  const getCurrentUser = async () => {
    const { data: {user}, error } = await supabase.auth.getUser()
        
    if (error) throw error
    if (!user) throw new Error("ログインしてください")
    return user
  }

  const addLongTermTasks = (text: string) => {
    try {
      const draft = localStorage.getItem("longTermDraft")
      const orderIndex = longTermRecords[0].tasks.length
  
      if (draft) {
        setLongTermRecords(JSON.parse(draft))
      }

      const insertTask: Task = {
        id: crypto.randomUUID(),
        title: text,
        completed: false,
        orderIndex: orderIndex
      }

      setLongTermRecords(prev => [{
        ...prev[0],
        tasks: [...prev[0].tasks, insertTask]
      }])
    } catch(e) {
      console.error(e)
      alert("タスクの追加に失敗しました")
    }
  }

  const updateLongTermGoal = (text: string) => {
    try {
      const draft = localStorage.getItem("longTermDraft")

      if (draft) {
        setLongTermRecords(JSON.parse(draft))
      }
      setLongTermRecords(prev => [{
        ...prev[0],
        goal: text
      }])
    } catch(e) {
      console.error(e)
      alert("目標の追加に失敗しました")
    }
  }

  const updateLongTermStartDate = (date: string) => {
    try {
      const draft = localStorage.getItem("longTermDraft")
      
      if (draft) {
        setLongTermRecords(JSON.parse(draft))
      }
      setLongTermRecords(prev => [{
        ...prev[0],
        startDate: date
      }])
      setStartDate(date)

    } catch(e) {
      console.error(e)
      alert("開始日の更新に失敗しました")
    }
  }

  const updateLongTermEndDate = (date: string) => {
    try {
      const draft = localStorage.getItem("longTermDraft")
      
      if (draft) {
        setLongTermRecords(JSON.parse(draft))
      }
      setLongTermRecords(prev => [{
        ...prev[0],
        endDate: date
      }])
      setEndDate(date)

    } catch(e) {
      console.error(e)
      alert("開始日の更新に失敗しました")
    }
  }

  const updateLongTermReflection = (text: string) => {
    try {
      const draft = localStorage.getItem("longTermDraft")
      
      if (draft) {
        setLongTermRecords(JSON.parse(draft))
      }
      setLongTermRecords(prev => [{
        ...prev[0],
        reflection: text
      }])
    } catch(e) {
      console.error(e) 
      alert("振り返りの更新に失敗しました")
    }
  }

  const updateLongTermToggle = () => {
    try {
      const draft = localStorage.getItem("longTermDraft")
      
      if (draft) {
        setLongTermRecords(JSON.parse(draft))
      }
      setLongTermRecords(prev => [{
        ...prev[0],
        completed: !prev[0].completed
      }])
    } catch(e) {
      console.error(e)
      alert("タグの切り替えに失敗しました")
    }
  }

  const updateLongTermTaskTitle = (id: string, text: string) => {
    try {
      const draft = localStorage.getItem("longTermDraft")
      
      if (draft) {
        setLongTermRecords(JSON.parse(draft))
      }
      setLongTermRecords(prev => [{
        ...prev[0],
        tasks: prev[0].tasks.map(task => (
          task.id === id ? {...task, title: text} : task
        ))
      }])
    } catch(e) {
      console.error(e)
      alert("タスク名の更新に失敗しました")
    }
  }

  const updateLongTermTaskToggle = (id: string) => {
    try {
      const draft = localStorage.getItem("longTermDraft")
      
      if (draft) {
        setLongTermRecords(JSON.parse(draft))
      }
      setLongTermRecords(prev => [{
        ...prev[0],
        tasks: prev[0].tasks.map(task => (
          task.id === id ? {...task, completed: !task.completed} : task
        ))
      }])
    } catch(e) {
      console.error(e)
      alert("タスク名の更新に失敗しました")
    }
  }

  const saveLongTermPlan = async () => {
    try {
      const user = await getCurrentUser()

      const planPayload = {
        user_id: user.id,
        start_date: longTermRecords[0].startDate,
        end_date: longTermRecords[0].endDate,
        goal: longTermRecords[0].goal,
        completed: longTermRecords[0].completed,
        reflection: longTermRecords[0].reflection
      }

      const { data: planData, error: planError } = await supabase
        .from("long_term_plans")
        .insert(planPayload)
        .select().single()

      if (planError) throw planError

      const taskPayload = longTermRecords[0].tasks.map(task => ({
        user_id: user.id,
        id: task.id,
        plan_id: planData.id,
        text: task.title,
        completed: task.completed,
        order_index: task.orderIndex
      }))

      if (taskPayload.length > 0) {
        const { error: tasksError } = await supabase
        .from("long_term_tasks")
        .insert(taskPayload)

        if (tasksError) throw tasksError
      }

      localStorage.removeItem("longTermDraft")
      setLongTermRecords([])
      
    } catch(e) {
      console.error(e)
      alert("データの保存に失敗しました")
    }
  }

  const loadLongTermPlan = async () => {
    try {
      const user = await getCurrentUser()

      const { data: planData, error: planError } = await supabase
        .from("long_term_plans")
        .select()
        .eq("user_id", user.id)
        .eq("start_date", startDate)
        .eq("end_date", endDate)
        .single()

      if (planError) throw planError

      const { data: tasksData, error: tasksError} = await supabase
        .from("long_term_tasks")
        .select()
        .eq("user_id", user.id)
        .eq("plan_id", planData.id)

      if (tasksError) throw tasksError

      const tasks: Task[] =  tasksData.map(task =>  ({
        id: task.id,
        title: task.text,
        completed: task.completed,
        orderIndex: task.order_index
      }))

      const longTermRecord: longTermRecord = {
        startDate: planData.start_date,
        endDate: planData.end_date,
        goal: planData.goal,
        completed: planData.completed,
        reflection: planData.reflection,
        tasks: tasks
      }

      setLongTermRecords([longTermRecord])
    } catch(e) {
      console.error(e)
      alert("データの取得に失敗しました")
    }
  }

  useEffect(() => {
    localStorage.setItem("longTermDraft",JSON.stringify(longTermRecords))
  }, [longTermRecords])

 

  return {
    addLongTermTasks,
    updateLongTermGoal,
    updateLongTermStartDate,
    updateLongTermEndDate,
    updateLongTermReflection,
    updateLongTermToggle,
    updateLongTermTaskTitle,
    updateLongTermTaskToggle,
    saveLongTermPlan,
    loadLongTermPlan
  }
}