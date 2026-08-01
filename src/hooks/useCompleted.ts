import type { CompletedRecord, LongTermCompletedRecord } from "../types/completed"
import { useState } from "react"
import {
  getCompltedDailyDataInDB,
  getCompltedWeeklyDataInDB,
  getCompltedMonthlyDataInDB,
  getCompltedLongTermDataInDB
} from "../api/completedApi"


export default function useCompleted() {
  const [dailyCompletedRecords, setDailyCompletedRecords] = useState<CompletedRecord[]>([])
  const [weeklyCompletedRecords, setWeeklyCompletedRecords] = useState<CompletedRecord[]>([])
  const [monthlyCompletedRecords, setMonthlyCompletedRecords] = useState<CompletedRecord[]>([])
  const [longTermCompletedRecords, setLongTermCompletedRecords] = useState<LongTermCompletedRecord[]>([])
  
  const getCompltedDailyData = async () => {
    try {
      const { plansData, tasksData } = await getCompltedDailyDataInDB()

      if (!plansData) {
        setDailyCompletedRecords([])
        return
      }

      const completedRecrods: CompletedRecord[] = plansData.map(plan => {
        const tasks = tasksData 
          .filter(task => task.plan_id === plan.id)
          .map(task => ({
            id: task.id,
            title: task.text,
            completed: task.completed
          }))

        return {
          startDate: plan.date,
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

  const getCompltedWeeklyData = async () => {
    try {
      const { plansData, tasksData } = await getCompltedWeeklyDataInDB()

      if (!plansData) {
        setWeeklyCompletedRecords([])
        return
      }

      const completedRecords: CompletedRecord[] = plansData.map(plan => {
        const tasks = tasksData 
          .filter(task => task.plan_id === plan.id)
          .map(task => ({
            id: task.id,
            title: task.text,
            completed: task.completed
          }))

        return {
          startDate: plan.week_start,
          endDate: plan.week_end,
          tasks: tasks,
          reflection: plan.reflection
        }
      })

      setWeeklyCompletedRecords(completedRecords)
    } catch(e) {
      console.error(e)
      alert("データの取得に失敗しました")
    }
  }

  const getCompltedMonthlyData = async () => {
    try {
      const { plansData, tasksData } = await getCompltedMonthlyDataInDB()

      if (!plansData) {
        setMonthlyCompletedRecords([])
        return
      }

      const completedRecords: CompletedRecord[] = plansData.map(plan => {
        const tasks = tasksData 
          .filter(task => task.plan_id === plan.id)
          .map(task => ({
            id: task.id,
            title: task.text,
            completed: task.completed
          }))

        return {
          startDate: plan.month_start,
          endDate: plan.month_end,
          tasks: tasks,
          reflection: plan.reflection
        }
      })

      setMonthlyCompletedRecords(completedRecords)
    } catch(e) {
      console.error(e)
      alert("データの取得に失敗しました")
    }
  }

  const getCompltedLongTermData = async () => {
    try {
      const { plansData, tasksData } = await getCompltedLongTermDataInDB()

      if (!plansData) {
        setLongTermCompletedRecords([])
        return
      }

      const records = plansData.map(plan => {
        const tasks = tasksData
          .filter(task => task.plan_id === plan.id)
          .map(task => ({
            id: task.id,
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
    await getCompltedDailyData()
    await getCompltedWeeklyData()
    await getCompltedMonthlyData()
    await getCompltedLongTermData()
  }

  return {
    dailyCompletedRecords,
    weeklyCompletedRecords,
    monthlyCompletedRecords,
    longTermCompletedRecords,
    fetchAllCompletedRecords
  }
}