import { useEffect, useMemo, useState } from "react"
import useCompleted from "../hooks/useCompleted"
import Sidebar from "../components/Sidebar"
import { groupByYear, groupByMonth } from "../utils/completed/group"
import {
  calculateRate,
  getCurrentMonthRate,
  getCurrentYearRate,
  getLongTermProgress,
} from "../utils/completed/rate"
import {
  Search,
  BarChart3,
  ListChecks
} from "lucide-react"
import type {
  CompletedRecord,
  LongTermCompletedRecord,
} from "../types/completed"
import "../css/completed.css"


type RecordType = "day" | "week" | "month" | "longTerm"
type LongTermFilter = "all" | "active" | "completed"


export default function CompletedPage() {
  const {
    dailyCompletedRecords,
    weeklyCompletedRecords,
    monthlyCompletedRecords,
    longTermCompletedRecords,
    fetchAllCompletedRecords,
  } = useCompleted()


  const [recordType, setRecordType] = useState<RecordType>("day")
  const [searchText, setSearchText] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [longTermFilter, setLongTermFilter] =
    useState<LongTermFilter>("all")
  const [visibleCount, setVisibleCount] = useState<number>(3)


  useEffect(() => {
    fetchAllCompletedRecords()
  }, [])


  useEffect(() => {
    setVisibleCount(3)
    setSearchText("")
    setSelectedYear("all")
    setSelectedMonth("all")
    setLongTermFilter("all")
  }, [recordType])


  const records: CompletedRecord[] =
    recordType === "day"
      ? dailyCompletedRecords
      : recordType === "week"
        ? weeklyCompletedRecords
        : monthlyCompletedRecords


  const today = new Date()
  today.setHours(0, 0, 0, 0)


  const availableYears = useMemo(() => {
    const targetRecords =
      recordType === "longTerm"
        ? longTermCompletedRecords
        : records

    return Array.from(
      new Set(
        targetRecords.map(record =>
          new Date(record.startDate).getFullYear()
        )
      )
    ).sort((a, b) => b - a)
  }, [
    recordType,
    records,
    longTermCompletedRecords,
  ])

  const availableMonths = useMemo(() => {
    const targetRecords =
      recordType === "longTerm"
        ? longTermCompletedRecords
        : records

    return Array.from(
      new Set(
        targetRecords.map(record =>
          new Date(record.startDate).getMonth() + 1
        )
      )
    ).sort((a, b) => b - a)
  }, [
    recordType,
    records,
    longTermCompletedRecords
  ])


  const matchesSearch = (
    record: CompletedRecord | LongTermCompletedRecord
  ) => {
    const keyword = searchText.trim().toLowerCase()

    if (!keyword) return true

    const taskText = record.tasks
      .map(task => task.title)
      .join(" ")
      .toLowerCase()

    const reflectionText = record.reflection.toLowerCase()

    const dateText =
      `${record.startDate} ${record.endDate}`.toLowerCase()

    const goalText =
      "goal" in record
        ? record.goal.toLowerCase()
        : ""

    return (
      taskText.includes(keyword) ||
      reflectionText.includes(keyword) ||
      dateText.includes(keyword) ||
      goalText.includes(keyword)
    )
  }

  const matchesYear = (
    record: CompletedRecord | LongTermCompletedRecord
  ) => {
    if (selectedYear === "all") return true

    return (
      new Date(record.startDate).getFullYear() ===
      Number(selectedYear)
    )
  }

  const matchesMonth = (
    record: CompletedRecord | LongTermCompletedRecord
  ) => {
    if (selectedMonth === "all") return true

    return (
      new Date(record.startDate).getMonth() + 1 ===
      Number(selectedMonth)
    )
  }

  const filteredRecords = useMemo(() => {
    return records
      .filter(record => {
        const date = new Date(record.startDate)
        date.setHours(0, 0, 0, 0)

        return date <= today
      })
      .filter(matchesSearch)
      .filter(matchesYear)
      .filter(matchesMonth)
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() -
          new Date(a.startDate).getTime()
      )
  }, [
    records,
    searchText,
    selectedYear,
    selectedMonth
  ])


  const filteredLongTermRecords = useMemo(() => {
    return longTermCompletedRecords
      .filter(matchesSearch)
      .filter(matchesYear)
      .filter(record => {
        if (longTermFilter === "active") {
          return !record.completed
        }

        if (longTermFilter === "completed") {
          return record.completed
        }

        return true
      })
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() -
          new Date(a.startDate).getTime()
      )
  }, [
    longTermCompletedRecords,
    searchText,
    selectedYear,
    longTermFilter,
  ])

  const displayedRecords = filteredRecords.slice(
    0,
    visibleCount
  )

  const displayedLongTermRecords =
    filteredLongTermRecords.slice(
      0,
      visibleCount
    )

  const displayedRecordsByYear =
    groupByYear(displayedRecords)

  const displayedLongTermRecordsByYear =
    groupByYear(displayedLongTermRecords)

  const totalRate = calculateRate(
    recordType === "longTerm"
      ? filteredLongTermRecords
      : filteredRecords
  )

  const subRate =
    recordType === "day" || recordType === "week"
      ? getCurrentMonthRate(filteredRecords)
      : recordType === "month"
        ? getCurrentYearRate(filteredRecords)
        : getLongTermProgress(longTermCompletedRecords)

  const subRateTitle =
    recordType === "day" || recordType === "week"
      ? "今月の達成率"
      : recordType === "month"
        ? "今年の達成率"
        : "進捗率"

  const targetRecordsCount =
    recordType === "longTerm"
      ? filteredLongTermRecords.length
      : filteredRecords.length

  const targetRecords =
    recordType === "longTerm"
      ? filteredLongTermRecords
      : filteredRecords

  const totalTaskCount = targetRecords.reduce(
    (total, record) => total + record.tasks.length, 0
  )

  const completedTaskCount = targetRecords.reduce(
    (total, record) => total + record.tasks.filter(
      task => task.completed
    ).length, 0
  )

  const progressMessage =
    totalRate >= 90
      ? "素晴らしいペースです！この調子で取り組みを続けましょう。"
      : totalRate >= 70
        ? "順調に進んでいます！この調子をキープしましょう。"
        : totalRate >= 50
          ? "着実に進んでいます。できることから一つずつ進めましょう。"
          : "まずは一つずつ取り組んでいきましょう"

  const hasMore =
    visibleCount < targetRecordsCount

  const recordTypeLabel =
    recordType === "day"
      ? "日"
      : recordType === "week"
        ? "週"
        : recordType === "month"
          ? "月"
          : "長期"

  return (
    <div className="completed-page">
      <Sidebar />

      <main className="completed-content">

        <div className="completed-layout">

          <div className="completed-left">

            <header className="completed-header">
              <h1>完了履歴</h1>
              <p>
                これまでに取り組んだタスクと
                <br />
                振り返りを確認できます
              </p>
            </header>

            <section className="completed-section completed-filter-section">

              <div className="completed-section-header">
                <Search
                  size={22}
                  strokeWidth={1.8}
                />
                <h2>履歴を探す</h2>
              </div>

              <div className="completed-filters">

                <div className="completed-filter-row">

                  <div className="completed-filter">
                    <label htmlFor="record-type">
                      表示対象
                    </label>

                    <select
                      id="record-type"
                      value={recordType}
                      onChange={(e) =>
                        setRecordType(
                          e.target.value as RecordType
                        )
                      }
                    >
                      <option value="day">日</option>
                      <option value="week">週</option>
                      <option value="month">月</option>
                      <option value="longTerm">長期</option>
                    </select>
                  </div>


                  <div className="completed-filter">
                    <label htmlFor="long-term-filter">
                      状態
                    </label>

                    <select
                      id="long-term-filter"
                      value={longTermFilter}
                      onChange={(e) =>
                        setLongTermFilter(
                          e.target.value as LongTermFilter
                        )
                      }
                    >
                      <option value="all">
                        すべて
                      </option>

                      <option value="active">
                        進行中
                      </option>

                      <option value="completed">
                        達成済み
                      </option>
                    </select>
                  </div>

                </div>


                <div className="completed-filter-row">

                  <div className="completed-filter">
                    <label htmlFor="year-filter">
                      年
                    </label>

                    <select
                      id="year-filter"
                      value={selectedYear}
                      onChange={(e) =>
                        setSelectedYear(e.target.value)
                      }
                    >
                      <option value="all">
                        すべて
                      </option>

                      {availableYears.map(year => (
                        <option
                          key={year}
                          value={year}
                        >
                          {year}年
                        </option>
                      ))}
                    </select>
                  </div>


                  <div className="completed-filter">
                    <label htmlFor="month-filter">
                      月
                    </label>

                    <select
                      id="month-filter"
                      value={selectedMonth}
                      onChange={(e) =>
                        setSelectedMonth(e.target.value)
                      }
                    >
                      <option value="all">
                        すべて
                      </option>

                      {Array.from(
                        { length: 12 },
                        (_, index) => (
                          <option
                            key={index + 1}
                            value={index + 1}
                          >
                            {index + 1}月
                          </option>
                        )
                      )}
                    </select>
                  </div>

                </div>


                {/* 3段目：キーワード */}
                <div className="completed-search">

                  <label htmlFor="completed-search">
                    キーワード
                  </label>

                  <input
                    id="completed-search"
                    type="text"
                    value={searchText}
                    placeholder="タスク・振り返りなどを検索..."
                    onChange={(e) =>
                      setSearchText(e.target.value)
                    }
                  />

                </div>

              </div>


              {/* フィルターリセット */}
              {(
                searchText ||
                selectedYear !== "all" ||
                selectedMonth !== "all" ||
                longTermFilter !== "all"
              ) && (
                  <button
                    className="completed-filter-reset"
                    onClick={() => {
                      setSearchText("")
                      setSelectedYear("all")
                      setSelectedMonth("all")
                      setLongTermFilter("all")
                    }}
                  >
                    フィルターをリセット
                  </button>
                )}


            </section>


            <section className="completed-section completed-statistics-section">

              <div className="completed-section-header">
                <BarChart3
                  size={22}
                  strokeWidth={1.8}
                />

                <div>
                  <h2>統計</h2>

                  <p>
                    {recordTypeLabel}の履歴
                    {targetRecordsCount}件
                  </p>
                </div>
              </div>


              <div className="completed-statistics">

                <div className="completed-stat">

                  <p>総達成率</p>

                  {targetRecordsCount === 0 ? (
                    <strong>-</strong>
                  ) : (
                    <>
                      <strong>
                        {totalRate}%
                      </strong>

                      <div className="completed-stat-bar">
                        <div
                          className="completed-stat-bar-fill"
                          style={{
                            width: `${totalRate}%`
                          }}
                        />
                      </div>

                      <span className="completed-stat-detail">
                        {completedTaskCount} / {totalTaskCount} タスク
                      </span>
                    </>
                  )}

                </div>

                <div className="completed-stat">

                  <p>{subRateTitle}</p>

                  {targetRecordsCount === 0 ? (
                    <strong>-</strong>
                  ) : (
                    <>
                      <strong>
                        {subRate}%
                      </strong>

                      <div className="completed-stat-bar">
                        <div
                          className="completed-stat-bar-fill"
                          style={{
                            width: `${subRate}%`
                          }}
                        />
                      </div>
                    </>
                  )}

                </div>

              </div>

              {targetRecordsCount > 0 && (
                <div className="completed-progress-message">

                  <span className="completed-progress-message-icon">
                    ★
                  </span>

                  <p>
                    {progressMessage}
                  </p>

                </div>
              )}

            </section>

          </div>


          <section className="completed-section completed-history-section">

            <div className="completed-section-header completed-history-header">

              <ListChecks
                size={22}
                strokeWidth={1.8}
              />

              <h2>タスク一覧</h2>

              {recordType !== "longTerm" && (
                <div className="completed-history-filters">

                  <select
                    value={selectedYear}
                    onChange={(e) =>
                      setSelectedYear(e.target.value)
                    }
                    aria-label="年"
                  >
                    <option value="all">
                      すべての年
                    </option>

                    {availableYears.map(year => (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}年
                      </option>
                    ))}
                  </select>


                  <select
                    value={selectedMonth}
                    onChange={(e) =>
                      setSelectedMonth(e.target.value)
                    }
                    aria-label="月"
                  >
                    <option value="all">
                      すべての月
                    </option>

                    {availableMonths.map(month => (
                      <option
                        key={month}
                        value={month}
                      >
                        {month}月
                      </option>
                    ))}
                  </select>

                </div>
              )}

            </div>


            <div className="completed-history-scroll">

              {recordType !== "longTerm" ? (

                <>
                  {displayedRecords.length > 0 ? (

                    Object.entries(displayedRecordsByYear)
                      .sort(
                        ([a], [b]) =>
                          Number(b) - Number(a)
                      )
                      .map(
                        ([year, yearRecords]) => (

                          <div
                            className="completed-year-group"
                            key={year}
                          >

                            {Object.entries(
                              groupByMonth(yearRecords)
                            )
                              .sort(
                                ([a], [b]) =>
                                  Number(b) - Number(a)
                              )
                              .map(
                                ([month, monthRecords]) => (

                                  <div
                                    className="completed-month-group"
                                    key={`${year}-${month}`}
                                  >

                                    <div className="completed-month-heading">
                                      <span>
                                        {year}年 {Number(month) + 1}月
                                      </span>
                                    </div>


                                    <div className="completed-timeline">

                                      {monthRecords
                                        .sort(
                                          (a, b) =>
                                            new Date(
                                              b.startDate
                                            ).getTime() -
                                            new Date(
                                              a.startDate
                                            ).getTime()
                                        )
                                        .map(record => {

                                          const completedCount =
                                            record.tasks.filter(
                                              task =>
                                                task.completed
                                            ).length

                                          const isFullyCompleted =
                                            record.tasks.length > 0 &&
                                            completedCount ===
                                            record.tasks.length


                                          return (
                                            <article
                                              className="completed-record"
                                              key={record.startDate}
                                            >

                                              <div className="completed-record-timeline">

                                                <div
                                                  className={
                                                    isFullyCompleted
                                                      ? "completed-timeline-marker completed"
                                                      : "completed-timeline-marker"
                                                  }
                                                >
                                                  {isFullyCompleted
                                                    ? "✓"
                                                    : ""}
                                                </div>

                                              </div>

                                              <div className="completed-record-main">

                                                <div className="completed-record-header">

                                                  <div>
                                                    <p className="completed-record-date">
                                                      {record.startDate}
                                                      {" "}
                                                      {record.endDate &&
                                                        `～ ${record.endDate}`}
                                                    </p>

                                                    <span className="completed-record-progress">
                                                      達成 {completedCount} / {record.tasks.length}
                                                    </span>
                                                  </div>

                                                </div>

                                                <div className="completed-record-content">

                                                  {/* タスク */}
                                                  <div className="completed-record-tasks">

                                                    <h5>
                                                      達成したタスク
                                                    </h5>

                                                    {record.tasks.some(
                                                      task =>
                                                        task.completed
                                                    ) ? (

                                                      <ul>
                                                        {record.tasks
                                                          .filter(
                                                            task =>
                                                              task.completed
                                                          )
                                                          .map(task => (

                                                            <li
                                                              key={task.id}
                                                            >
                                                              <span className="completed-task-dot" />
                                                              <span>
                                                                {task.title}
                                                              </span>
                                                            </li>

                                                          ))}
                                                      </ul>

                                                    ) : (

                                                      <p>
                                                        達成したタスクはありません
                                                      </p>

                                                    )}

                                                  </div>

                                                  <div className="completed-record-reflection">

                                                    <h5>
                                                      振り返り
                                                    </h5>

                                                    {record.reflection ? (
                                                      <p>
                                                        {record.reflection}
                                                      </p>
                                                    ) : (
                                                      <p>
                                                        振り返りはありません
                                                      </p>
                                                    )}

                                                  </div>

                                                </div>

                                              </div>

                                            </article>
                                          )
                                        })}

                                    </div>

                                  </div>

                                )
                              )}

                          </div>

                        )
                      )

                  ) : (

                    <div className="completed-empty">
                      <p>
                        条件に一致する履歴がありません
                      </p>

                      <p>
                        検索条件やフィルターを変更してみてください
                      </p>
                    </div>

                  )}


                  {hasMore && (
                    <button
                      className="completed-load-more"
                      onClick={() =>
                        setVisibleCount(
                          prev => prev + 3
                        )
                      }
                    >
                      もっと見る
                    </button>
                  )}

                </>

              ) : (

                <>
                  {displayedLongTermRecords.length > 0 ? (

                    Object.entries(
                      displayedLongTermRecordsByYear
                    )
                      .sort(
                        ([a], [b]) =>
                          Number(b) - Number(a)
                      )
                      .map(
                        ([year, yearRecords]) => (

                          <div
                            className="completed-year-group"
                            key={year}
                          >

                            <div className="completed-month-heading">
                              <span>
                                {year}年
                              </span>
                            </div>

                            <div className="completed-timeline">

                              {yearRecords.map(record => {

                                const completedCount =
                                  record.tasks.filter(
                                    task =>
                                      task.completed
                                  ).length

                                const isFullyCompleted =
                                  record.tasks.length > 0 &&
                                  completedCount ===
                                  record.tasks.length

                                return (
                                  <article
                                    className="completed-record completed-long-term-record"
                                    key={record.startDate}
                                  >

                                    <div className="completed-record-timeline">

                                      <div
                                        className={
                                          isFullyCompleted
                                            ? "completed-timeline-marker completed"
                                            : "completed-timeline-marker"
                                        }
                                      >
                                        {isFullyCompleted
                                          ? "✓"
                                          : ""}
                                      </div>

                                    </div>


                                    <div className="completed-record-main">

                                      <div className="completed-record-header">

                                        <div>

                                          <p className="completed-record-date">
                                            {record.startDate}
                                            {" ～ "}
                                            {record.endDate}
                                          </p>

                                          <span className="completed-record-progress">
                                            {record.completed
                                              ? "達成済み"
                                              : "進行中"}
                                          </span>

                                        </div>

                                      </div>

                                      <div className="completed-record-content">

                                        <div>
                                          <h5>
                                            目標
                                          </h5>

                                          <p>
                                            {record.goal}
                                          </p>
                                        </div>

                                        <div>
                                          <h5>
                                            達成状況
                                          </h5>

                                          <p>
                                            達成{" "}
                                            {completedCount}{" "}
                                            /{" "}
                                            {record.tasks.length}
                                          </p>
                                        </div>

                                        <div className="completed-record-tasks">

                                          <h5>
                                            達成したタスク
                                          </h5>

                                          {record.tasks.some(
                                            task =>
                                              task.completed
                                          ) ? (

                                            <ul>
                                              {record.tasks
                                                .filter(
                                                  task =>
                                                    task.completed
                                                )
                                                .map(task => (

                                                  <li
                                                    key={task.id}
                                                  >
                                                    <span className="completed-task-dot" />

                                                    <span>
                                                      {task.title}
                                                    </span>
                                                  </li>

                                                ))}
                                            </ul>

                                          ) : (

                                            <p>
                                              達成したタスクはありません
                                            </p>

                                          )}

                                        </div>

                                        <div className="completed-record-reflection">

                                          <h5>
                                            振り返り
                                          </h5>

                                          {record.reflection ? (
                                            <p>
                                              {record.reflection}
                                            </p>
                                          ) : (
                                            <p>
                                              振り返りはありません
                                            </p>
                                          )}

                                        </div>

                                      </div>

                                    </div>

                                  </article>
                                )
                              })}

                            </div>

                          </div>

                        )
                      )

                  ) : (

                    <div className="completed-empty">

                      <p>
                        条件に一致する長期目標がありません
                      </p>

                      <p>
                        検索条件やフィルターを変更してみてください
                      </p>

                    </div>

                  )}


                  {hasMore && (
                    <button
                      className="completed-load-more"
                      onClick={() =>
                        setVisibleCount(
                          prev => prev + 3
                        )
                      }
                    >
                      もっと見る
                    </button>
                  )}

                </>

              )}

            </div>

          </section>

        </div>

      </main>
    </div>
  )

}