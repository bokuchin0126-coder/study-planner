import { useState, useEffect } from "react"
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
        <p>{records.length}</p>
      </div>

      <div>
        <p>統計</p>
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