import useLongTerm from "../hooks/useLongTerm"
import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import type { Task } from "../types/baseTask"
import handleDragEnd from "../utils/dragAndDrop"
import TaskItem from "../components/TaskItem"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import "../css/longTerm.css"


export default function LongTermPage() {
  const {
    longTermRecord,
    monthlyCompletedTasks,
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
  } = useLongTerm()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
      distance: 8,
      },
    })
  )

  const [longTermTasks, setLongTermTasks] = useState<Task[]>(longTermRecord?.tasks ?? [])

  const [addText, setAddText] = useState<string>("")
  const [editText, setEditText] = useState<string>("")
  const [goalText, setGoalText] = useState<string>("")
  const [reflectionText, setReflectionText] = useState<string>("")

  const [editingId, setEditingId] = useState<string>("")
  const [showAdd, setShowAdd] = useState<boolean>(false)

  const [editingType, setEditingType] = useState<"start" | "end" | null>(null)

  const [startYear, setStartYear] = useState<number>(new Date().getFullYear())
  const [startMonth, setStartMonth] = useState<number>(new Date().getMonth() + 1)
  const [startDay, setStartDay] = useState<number>(new Date().getDate())

  const [endYear, setEndYear] = useState<number>(new Date().getFullYear())
  const [endMonth, setEndMonth] = useState<number>(new Date().getMonth() + 1)
  const [endDay, setEndDay] = useState<number>(new Date().getDate())

  const saveStartDate = `${startYear}-${String(startMonth).padStart(2, "0")}-${String(startDay).padStart(2, "0")}`
  const saveEndDate = `${endYear}-${String(endMonth).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`

  const displayStartDate = `${startYear}年 ${startMonth}月 ${startDay}日`
  const displayEndDate = `${endYear}年 ${endMonth}月 ${endDay}日`

  const pickerRef = useRef<HTMLDivElement | null>(null)
  const lastYear = new Date().getFullYear() - 1

  const startDaysInMonth = new Date(startYear, startMonth, 0).getDate()

  const endDaysInMonth = new Date(endYear, endMonth, 0).getDate()
  const endFirstYear = startYear
  const endFirstMonth = endYear === startYear ? startMonth : 1
  const endFirstDay = endYear === startYear && endMonth === startMonth ? startDay : 1

  const startDate = new Date(startYear, startMonth - 1, startDay)
  const endDate = new Date(endYear, endMonth - 1, endDay)

  const groupedTasks = monthlyCompletedTasks.reduce((groups, task) => {
    const month = task.month

    if (!groups[month]) {
      groups[month] = []
    }
    groups[month].push(task.text)

    return groups
  }, {} as Record<string, string[]>)

  useEffect(() => {
    const maxStartDay = new Date(startYear, startMonth, 0).getDate()

    if (startDay > maxStartDay) {
      setStartDay(maxStartDay)
    }
  }, [startYear, startMonth, startDay])

  useEffect(() => {
    const maxEndDay = new Date(endYear, endMonth, 0).getDate()

    if (endDay > maxEndDay) {
      setEndDay(maxEndDay)
    }
  }, [endYear, endMonth, endDay])

  useEffect(() => {
    if (!longTermRecord) return

    setGoalText(longTermRecord.goal)
    setReflectionText(longTermRecord.reflection)

    const [startYear, startMonth, startDay] = longTermRecord.startDate.split("-").map(Number)

    const [endYear, endMonth, endDay] = longTermRecord.endDate.split("-").map(Number)

    setStartYear(startYear)
    setStartMonth(startMonth)
    setStartDay(startDay)

    setEndYear(endYear)
    setEndMonth(endMonth)
    setEndDay(endDay)
  }, [longTermRecord])

  useEffect(() => {
    const handleClickOutside = async (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node)
      ) {
        if (editingType === "start") {
          if (endDate < startDate) {
            const correctedEndDate =
              `${startYear}-${String(startMonth).padStart(2, "0")}-${String(startDay).padStart(2, "0")}`

            setEndYear(startYear)
            setEndMonth(startMonth)
            setEndDay(startDay)
  
            await updateLongTermEndDate(correctedEndDate)
          }

          await updateLongTermStartDate(saveStartDate)
        } else if (editingType === "end") {
          await updateLongTermEndDate(saveEndDate)
        }
  
        setEditingType(null)
      }
    }
  
    document.addEventListener("mousedown", handleClickOutside)
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [
    editingType,
    saveStartDate,
    saveEndDate,
    startDate,
    endDate,
    startYear,
    startMonth,
    startDay,
    updateLongTermStartDate,
    updateLongTermEndDate
  ])

  useEffect(() => {
    if (!longTermRecord) return
    setLongTermTasks(longTermRecord.tasks)
  }, [longTermRecord?.tasks])

  return (
    <>
      <div>
        <div>
          <h2>目標</h2>
          <input
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            placeholder="目標を入力..."
            onBlur={async () => await updateLongTermGoal(goalText)}
          />
        </div>

        <div>
          <h2>期間</h2>

          <div>
            <button onClick={() => {setEditingType("start")}}>
              {displayStartDate}
            </button>

            {editingType === "start" && (
              <div className="date-picker" ref={pickerRef}>
                
                <div className="year-list">

                  {Array.from({ length: 30}, (_, i) => (
                    <div key={i} onClick={() => setStartYear(lastYear + i)}>
                      {lastYear + i}年
                    </div>
                  ))}

                </div>

                <div className="month-list">

                  {Array.from({ length: 12}, (_, i) => (
                    <div key={i} onClick={() => setStartMonth(i + 1)}>
                      {i + 1}月
                    </div>
                  ))}
                  
                </div>

                <div className="day-list">

                  {Array.from({ length: startDaysInMonth}, (_, i) => (
                    <div key={i} onClick={() => setStartDay(i + 1)}>
                      {i + 1}日
                    </div>
                  ))}
                  
                </div>

              </div>
            )}

            ~

            <button onClick={() => {setEditingType("end")}}>
              {displayEndDate}
            </button>

            {editingType === "end" && (
              <div className="date-picker" ref={pickerRef}>

                <div className="year-list">

                  {Array.from({ length: lastYear + 30 - endFirstYear + 1 },(_, i) => {
                    const year = endFirstYear + i
                    return (
                      <div key={year} onClick={() => setEndYear(year)}>
                        {year}年
                      </div>
                    )
                  })}

                </div>

                <div className="month-list">

                  {Array.from({ length: 12 - endFirstMonth + 1 },(_, i) => {
                    const month = endFirstMonth + i

                    return (
                      <div key={month} onClick={() => setEndMonth(month)}>
                        {month}月
                      </div>
                    )
                  })}
                  
                </div>

                <div className="day-list">

                  {Array.from({length: endDaysInMonth - endFirstDay + 1},(_, i) => {
                    const day = endFirstDay + i

                    return (
                      <div key={day} onClick={() => setEndDay(day)}>
                        {day}日
                      </div>
                    )
                  })}
              
                </div>
              </div>
            )}
          </div>
        </div>

        <DndContext
          sensors={sensors}
          onDragEnd={(event) =>
            handleDragEnd(
              event,
              longTermTasks,
              "long_term_tasks",
              setLongTermTasks
            )
          }
        >
          <div>
            <h2>タスク</h2>

            <SortableContext
              items={longTermTasks}
              strategy={verticalListSortingStrategy}
            >

              {longTermTasks.map(task => 
                <TaskItem
                  key={task.id}
                  id={task.id}  
                >

                  <button onClick={() => updateLongTermTaskToggle(task.id)}>
                    {task.completed ? "☑" : "□"}
                  </button>

                  {editingId === task.id ? 
                    <div>
                      <input
                        value={editText}
                        autoFocus
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateLongTermTaskTitle(task.id, editText)
                            setEditText("")
                            setEditingId("")
                          }
                        }}
                      />
                      <button onClick={() => {
                        updateLongTermTaskTitle(task.id, editText)
                        setEditText("")
                        setEditingId("")
                      }}>
                        保存
                      </button>
                    </div>
                  :
                    <div>
                      {task.title}
                      <button onClick={() => {
                        setEditingId(task.id),
                        setEditText(task.title)
                      }}>
                        編集
                      </button>
                    </div>
                  }
                  <button onClick={() => deleteLongTermTask(task.id)}>
                    削除
                  </button>
                </TaskItem>
              )}
            </SortableContext>
    
            {showAdd ?
              <div>
                <input
                  value={addText}
                  autoFocus
                  onChange={(e) => setAddText(e.target.value)}
                  placeholder="タスクを入力"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addLongTermTask(addText)
                      setAddText("")
                      setShowAdd(false)
                    }
                  }}
                />
                <button onClick={() => {
                  addLongTermTask(addText),
                  setAddText("")
                  setShowAdd(false)
                }}>
                  追加
                </button>
              </div>
            :
              <button onClick={() => setShowAdd(true)}>
                 新しいタスクを追加＋
              </button>
            }
          </div>
        </DndContext>

        <div>
          <h2>振り返り</h2>
          <textarea
            placeholder="振り返りを入力..."
            onBlur={() => updateLongTermReflection(reflectionText)}
            value={reflectionText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReflectionText(e.target.value)}
          />
        </div>

        <div>
          <h2>達成したタスク</h2>
          {Object.entries(groupedTasks).map(([month, tasks]) => (
            <div key={month}>
              <h3>
                {new Date(month).getFullYear()}年
                {new Date(month).getMonth() + 1}月
              </h3>
              {tasks.length === 0 && <p>この期間中に達成したmonthlyTaskはありません</p>}

              {tasks.map(task => (
                <div key={task}>
                  {task}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div>
          <button onClick={async () => {
            const isConfirmed = window.confirm(
              "達成にすると今の長期目標の画面はなくなり、新しい長期目標の画面へと更新されますがよろしいですか？"
            )
            if (!isConfirmed) return

            await updateLongTermToggle()
            await initializeLongTermPlan()
          }}>
            完了
          </button>
        </div>
        
        <div>
          <Link to="/daily">デイリーへ</Link>
          <Link to="/weekly">ウィークリーへ</Link>
          <Link to="/monthly">マンリーへ</Link>
        </div>
      </div>
    </>
  )
}