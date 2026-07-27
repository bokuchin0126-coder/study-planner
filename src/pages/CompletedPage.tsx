import { useState, useEffect } from "react"
import type { LongTermCompletedRecord } from "../types/completed"
import useCompleted from "../hooks/useCompleted"
import { Link } from "react-router-dom"
import Sidebar from "../components/Sidebar"


export default function CompletedPage() {
  const {
    dailyCompletedRecords,
    weeklyCompletedRecords,
    monthlyCompletedRecords,
    longTermCompletedRecords,
    fetchAllCompletedRecords
  } = useCompleted()

  const [recordType, setRecordType] = useState<"day" | "week" | "month" | "longTerm">("day")
  const [visibleCount, setVisibleCount] = useState(3)

  const records = 
    recordType === "day" ? dailyCompletedRecords :
    recordType === "week" ? weeklyCompletedRecords :
    recordType === "month" ? monthlyCompletedRecords : longTermCompletedRecords

  const recordTasks = records.map(record => record.tasks)
  const completedLomgTermRecord = longTermCompletedRecords.find(record => record.completed)

  const getTotalRate = () => {
    const total = filteredRecords.reduce(
      (sum, record) => sum + record.tasks.length,
      0
    )

    const completed = filteredRecords.reduce(
      (sum, record) =>
        sum + record.tasks.filter(task => task.completed).length,
      0
    )

    return total === 0
      ? 0
      : Math.round((completed / total) * 100)
  }

  const getSubRate = () => {
    if (recordType === "day" || recordType === "week") {
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      const monthRecords = filteredRecords.filter(record => {
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

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const filteredRecords = records.filter(record => {
    const date = new Date(record.startDate)
    date.setHours(0, 0, 0, 0)

    return date <= today
  })

  const sortedRecords = [...filteredRecords].sort(
    (a, b) =>
      new Date(b.startDate).getTime() -
      new Date(a.startDate).getTime()
  )

  const sortedLongTermRecords = [...longTermCompletedRecords].sort(
    (a, b) =>
      new Date(b.startDate).getTime() -
      new Date(a.startDate).getTime()
  )

  const displayedRecords = sortedRecords.slice(0, visibleCount)
  const displayedLongTermRecords = sortedLongTermRecords.slice(0, visibleCount)

  const displayedRecordsByYear = displayedRecords.reduce(
    (acc, record) => {
      const year = new Date(record.startDate).getFullYear()

      if (!acc[year]) {
        acc[year] = []
      }

      acc[year].push(record)

      return acc
    },
    {} as Record<number, typeof displayedRecords>
  )

  const displayedLongTermRecordsByYear =
    displayedLongTermRecords.reduce(
      (acc, record) => {
        const year = new Date(record.startDate).getFullYear()

        if (!acc[year]) {
          acc[year] = []
        }

        acc[year].push(record)

        return acc
      },
    {} as Record<number, typeof displayedLongTermRecords>
  )

  const groupByMonth = (records: typeof sortedRecords) => {
    return records.reduce(
      (acc, record) => {
        const month = new Date(record.startDate).getMonth()

        if (!acc[month]) {
          acc[month] = []
        }

        acc[month].push(record)

        return acc
      },
      {} as Record<number, typeof records>
    )
  }
  
  useEffect(() => {
    fetchAllCompletedRecords()
  }, [])

  useEffect(() => {
    setVisibleCount(3)
  }, [recordType])
 
  return (
    <>
    <div>
      <div>
        <Sidebar />
      </div>

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

        {recordType !== "longTerm" ? (
          <>
            {Object.entries(displayedRecordsByYear).map(([year, yearRecords]) => (
              <div key={year}>
                <h2>{year}年</h2>

                {Object.entries(groupByMonth(yearRecords)).map(
                  ([month, monthRecords]) => (
                    <div key={month}>
                      <h3>{Number(month) + 1}月</h3>

                      {monthRecords.map(record => {
                        const completed = record.tasks.filter(
                          task => task.completed
                       ).length
   
                        return (
                         <div key={record.startDate}>
                             <p>
                              {record.startDate}
                              {record.endDate && ` ～ ${record.endDate}`}
                           </p>
    
                            <p>達成 {completed} / {record.tasks.length}</p>
    
                            <p>達成したタスク</p>
                            <ul>
                              {record.tasks
                                .filter(task => task.completed)
                                .map(task => (
                                  <li key={task.id}>
                                    {task.title}
                                  </li>
                                ))
                              }
                            </ul>
    
                            <p>振り返り</p>
                            <p>{record.reflection}</p>
                          </div>
                        )
                      })}
                    </div>
                  )
                )}
              </div>
            ))}
            {visibleCount < sortedRecords.length && (
              <button onClick={() => setVisibleCount(prev => prev + 3)}>
                もっと見る
              </button>
            )}
          </>
        ) : (
          <>
            {longTermCompletedRecords.find(record => !record.completed) && (
              <div>
                <h2>現在進行中</h2>
   
                {(() => {
                  const record = longTermCompletedRecords.find(
                    record => !record.completed
                  )!
   
                  const completed = record.tasks.filter(
                    task => task.completed
                    ).length
 
                  return (
                    <>
                      <p>
                        {record.startDate} ～ {record.endDate}
                      </p>
 
                      <p>目標</p>
                      <p>{record.goal}</p>

                      <p>達成 {completed} / {record.tasks.length}</p>

                      <p>達成したタスク</p>
                      <ul>
                        {record.tasks
                          .filter(task => task.completed)
                          .map(task => (
                            <li key={task.title}>
                              {task.title}
                            </li>
                          ))}
                      </ul>

                      <p>振り返り</p>
                      <p>{record.reflection}</p>
                    </>
                 )
                 })()}
             </div>
             )}

            {completedLomgTermRecord &&
              <div>
                <h2>達成履歴</h2>

                {Object.entries(displayedLongTermRecordsByYear).map(([year, yearRecords]) => (
                  <div key={year}>
                    <h3>{year}年</h3>
      
                    {yearRecords
                      .filter(record => record.completed)
                      .map(record => {
                        const completed = record.tasks.filter(
                          task => task.completed
                        ).length
  
                        return (
                          <div key={record.startDate}>
                            <p>
                              {record.startDate} ～ {record.endDate}
                            </p>
    
                            <p>目標</p>
                            <p>{record.goal}</p>
        
                            <p>達成 {completed} / {record.tasks.length}</p>
   
                            <p>達成したタスク</p>
                            <ul>
                              {record.tasks
                                .filter(task => task.completed)
                                .map(task => (
                                  <li key={task.title}>
                                    {task.title}
                                  </li>
                                ))}
                            </ul>
        
                            <p>振り返り</p>
                            <p>{record.reflection}</p>
                          </div>
                        )
                      })
                    }
                  </div>
                ))}
                {visibleCount < sortedLongTermRecords.length && (
                  <button onClick={() => setVisibleCount(prev => prev + 3)}>
                    もっと見る
                  </button>
                )}
              </div>
            }
          </>
        )}
      </div>

    </div>
    </>
  )
}