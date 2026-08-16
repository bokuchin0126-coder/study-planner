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
import type { 
  CompletedRecord, 
  LongTermCompletedRecord, 
} from "../types/completed" 
 
 
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
 
 
  const filteredRecords = useMemo(() => { 
    return records 
      .filter(record => { 
        const date = new Date(record.startDate) 
        date.setHours(0, 0, 0, 0) 
 
        return date <= today 
      }) 
      .filter(matchesSearch)
      .filter(matchesYear) 
      .sort( 
        (a, b) => 
          new Date(b.startDate).getTime() -
          new Date(a.startDate).getTime() 
      ) 
  }, [
    records, 
    searchText, 
    selectedYear, 
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
 
 
        <header className="completed-header"> 
          <h1>完了履歴</h1> 
          <p> 
            これまでに取り組んだタスクと振り返りを確認できます 
          </p> 
        </header> 

 
        <section className="completed-section completed-filter-section"> 
 
 
          <div className="completed-section-header"> 
            <h2>履歴を探す</h2> 
          </div> 
 
 
          <div className="completed-filters"> 
 
 
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
 
 
            {recordType === "longTerm" && ( 
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
            )} 
 
 
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
 
 
          {(searchText || 
            selectedYear !== "all" || 
            (recordType === "longTerm" && 
              longTermFilter !== "all")) && ( 
            <button 
              className="completed-filter-reset" 
              onClick={() => { 
                setSearchText("") 
                setSelectedYear("all") 
                setLongTermFilter("all")
              }} 
            > 
              フィルターをリセット
            </button> 
          )} 
 
 
        </section> 
 
 
        <section className="completed-section completed-statistics-section"> 
 
 
          <div className="completed-section-header"> 
            <h2>統計</h2> 
            <p> 
              {recordTypeLabel}の履歴 
              {targetRecordsCount}件 
            </p> 
          </div> 
 
 
          <div className="completed-statistics"> 
 
 
            <div className="completed-stat"> 
              <p>総達成率</p> 
 
              {targetRecordsCount === 0 ? ( 
                <strong>-</strong> 
              ) : ( 
                <strong>{totalRate}%</strong> 
              )} 
            </div> 
 
 
            <div className="completed-stat"> 
              <p>{subRateTitle}</p> 
 
              {targetRecordsCount === 0 ? ( 
                <strong>-</strong> 
              ) : ( 
                <strong>{subRate}%</strong> 
              )} 
            </div> 
 
 
          </div> 
 
 
        </section> 
 
 
        <section className="completed-section completed-history-section"> 
 
 
          <div className="completed-section-header"> 
            <h2>タスク一覧</h2> 
          </div> 
 
 
          {recordType !== "longTerm" ? ( 
            <> 
 
 
              {displayedRecords.length > 0 ? ( 
                Object.entries(displayedRecordsByYear).map( 
                  ([year, yearRecords]) => ( 
                    <div 
                      className="completed-year-group" 
                      key={year} 
                    > 
                      <h3>{year}年</h3> 
 
 
                      {Object.entries( 
                        groupByMonth(yearRecords) 
                      ).map(
                        ([month, monthRecords]) => ( 
                          <div 
                            className="completed-month-group" 
                            key={month} 
                          > 
                            <h4> 
                              {Number(month) + 1}月 
                            </h4> 
 
 
                            {monthRecords.map(record => { 
                              const completedCount = 
                                record.tasks.filter( 
                                  task => 
                                    task.completed 
                                ).length 
 
 
                              return ( 
                                <article 
                                  className="completed-record" 
                                  key={ 
                                    record.startDate 
                                  } 
                                > 
 
 
                                  <div className="completed-record-header"> 
                                    <div> 
                                      <p className="completed-record-date"> 
                                        {record.startDate} 
 
                                        {record.endDate && 
                                          ` ～ ${record.endDate}`} 
                                      </p> 
 
                                      <p className="completed-record-progress"> 
                                        達成{" "} 
                                        {completedCount}{" "} 
                                        /{" "} 
                                        {record.tasks.length} 
                                      </p> 
                                    </div> 
                                  </div> 
 
 
                                  <div className="completed-record-content"> 
 
 
                                    <div> 
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

                                                key={ 
                                                  task.id 
                                                } 
                                              > 
                                                {task.title} 
                                              </li> 
                                            ))} 
                                        </ul> 
                                      ) : ( 
                                        <p> 
                                          達成したタスクはありません 
                                        </p> 
                                      )} 
                                    </div> 
 
 
                                    <div> 
                                      <h5> 
                                        振り返り 
                                      </h5> 
 
                                      {record.reflection ? ( 
                                        <p> 
                                          { 
                                            record.reflection 
                                          } 
                                        </p> 
                                      ) : ( 
                                        <p> 
                                          振り返りはありません 
                                        </p> 
                                      )} 
                                    </div> 
 
 
                                  </div> 
 
 
                                </article> 
                              ) 
                            })} 
 
 
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
                ).map( 
                  ([year, yearRecords]) => ( 
                    <div 
                      className="completed-year-group" 
                      key={year} 
                    > 
                      <h3>{year}年</h3> 
 
 
                      {yearRecords.map(record => { 
                        const completedCount = 
                          record.tasks.filter( 
                            task => 
                              task.completed 
                          ).length 

 
                        return ( 
                          <article 
                            className="completed-record completed-long-term-record" 
                            key={record.startDate} 
                          > 
 
 
                            <div className="completed-record-header"> 
                              <div> 
                                <p className="completed-record-date"> 
                                  {record.startDate} 
                                  {" ～ "} 
                                  {record.endDate} 
                                </p> 
 
 
                                <p className="completed-record-status"> 
                                  {record.completed 
                                    ? "達成済み" 
                                    : "進行中"} 
                                </p> 
                              </div> 
                            </div> 
 
 
                            <div className="completed-record-content"> 
 
 
                              <div> 
                                <h5>目標</h5>
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
 
 
                              <div> 
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
                                          key={ 
                                            task.id 
                                          } 
                                        > 
                                          {task.title} 
                                        </li> 
                                      ))} 
                                  </ul> 
                                ) : ( 
                                  <p> 
                                    達成したタスクはありません 
                                  </p> 
                                )} 
                              </div> 
 
 
                              <div> 
                                <h5> 
                                 振り返り 
                               </h5> 

                               {record.reflection ? ( 
                                  <p> 
                                    { 
                                      record.reflection 
                                    } 
                                  </p> 
                                ) : ( 
                                  <p> 
                                    振り返りはありません 
                                  </p> 
                                )} 
                              </div> 

 
                            </div> 
 

                          </article> 
                        ) 
                      })} 

 
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
 
 
        </section> 
 
 
      </main> 
    </div> 
  ) 
}