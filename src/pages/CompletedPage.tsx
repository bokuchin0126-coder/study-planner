import { useState, useEffect } from "react"
import type { LongTermCompletedRecord } from "../types/completed"
import useCompleted from "../hooks/useCompleted"
import { Link } from "react-router-dom"


export default function CompletedPage() {
  const {
    dailyCompletedRecords,
    weeklyCompletedRecords,
    monthlyCompletedRecords,
    longTermCompletedRecords,
    fetchAllCompletedRecords
  } = useCompleted()

  const [recordType, setRecordType] = useState<"day" | "week" | "month" | "longTerm">("day")

  const records = 
    recordType === "day" ? dailyCompletedRecords :
    recordType === "week" ? weeklyCompletedRecords :
    recordType === "month" ? monthlyCompletedRecords : longTermCompletedRecords

  const recordTasks = records.map(record => record.tasks)

  const getTotalRate = () => {
    const rate = records.map(record => {
      const total = record.tasks.length
      const completed = record.tasks.filter(task => task.completed).length
      const rate = total === 0 ? 0 : Math.round((completed / total) * 100)
      return rate
    })
    return rate
  }

  const getSubRate = () => {
    if (recordType === "day" || recordType === "week") {
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      const monthRecords = records.filter(record => {
        const date = new Date(record.startDate)

        return (
          date.getFullYear() === currentYear &&
          date.getMonth() === currentMonth
        )
      })

      const total = monthRecords.reduce(
        (sum, record) => sum + record.tasks.length,
        0
      )

      const completed = monthRecords.reduce(
        (sum, record) =>
          sum + record.tasks.filter(task => task.completed).length,
        0
      )
  
      return total === 0
        ? 0
        : Math.round((completed / total) * 100)
    }
  
    if (recordType === "month") {
      const currentYear = new Date().getFullYear()
  
      const yearRecords = records.filter(record =>
        new Date(record.startDate).getFullYear() === currentYear
      )
  
      const total = yearRecords.reduce(
        (sum, record) => sum + record.tasks.length,
        0
      )
  
      const completed = yearRecords.reduce(
        (sum, record) =>
          sum + record.tasks.filter(task => task.completed).length,
        0
      )
  
      return total === 0
        ? 0
        : Math.round((completed / total) * 100)
    }
  
    if (recordType === "longTerm") {
      const record = longTermCompletedRecords.find(record => !record.completed)
  
      if (!record) return 100
  
      const start = new Date(record.startDate).getTime()
      const end = new Date(record.endDate).getTime()
      const now = Date.now()
  
      if (now <= start) return 0
      if (now >= end) return 100
  
      return Math.round(((now - start) / (end - start)) * 100)
    }
  
    return 0
  }

  const getSubRateTitle = () => {
    switch (recordType) {
      case "day" :
      case "week" :
        return "今月の達成率"

      case "month" :
        return "今年の達成率"

      case "longTerm" :
        return "進捗率"
    }
  }
  
  useEffect(() => {
    fetchAllCompletedRecords()
  }, [])
 
  return (
    <>
    <div>
      <div>
        <p>表示対象</p>
        <select 
          value={recordType}
          onChange={(e) => setRecordType(
            e.target.value as "day" | "week" | "month" | "longTerm"
          )}
        >
          <option value="day">日</option>
          <option value="week">週</option>
          <option value="month">月</option>
          <option value="longTerm">長期</option>
        </select>

      </div>

      <div>
        <p>統計</p>
        <div>
          <p>総達成率</p>
          {recordTasks.length === 0 ? "タスクがありません" : <p>{getTotalRate()}%</p>}
        </div>

        <div>
          <p>{getSubRateTitle()}</p>
          {recordTasks.length === 0 ? "タスクがありません" : <p>{getSubRate()}%</p>}
        </div>
      </div>

      <div>
        <p>タスク一覧</p>
      </div>

      <div>
        <Link to="daily">デイリーへ</Link>
        <Link to="/weekly">ウィークリーへ</Link>
        <Link to="/monthly">マンリーへ</Link>
        <Link to="/longTerm">長期へ</Link>
      </div>
    </div>
    </>
  )
}