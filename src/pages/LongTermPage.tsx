import useLongTerm from "../hooks/useLongTerm"
import { useState, useEffect, useRef } from "react"
import type { Task } from "../types/baseTask"
import handleDragEnd from "../utils/dragAndDrop"
import Sidebar from "../components/Sidebar"
import TaskItem from "../components/TaskItem"
import { useOutsideClick } from "../hooks/useOutsideClick"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import {
  Target,
  CalendarDays,
  ListTodo,
  NotebookPen,
  Trophy,
  Flag
} from "lucide-react"
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
    fetchCompletedTasks,
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

  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState<boolean>(false)

  const [editingType, setEditingType] = useState<"start" | "end" | null>(null)

  const [startYear, setStartYear] = useState<number>(new Date().getFullYear())
  const [startMonth, setStartMonth] = useState<number>(new Date().getMonth() + 1)
  const [startDay, setStartDay] = useState<number>(new Date().getDate())

  const [endYear, setEndYear] = useState<number>(new Date().getFullYear())
  const [endMonth, setEndMonth] = useState<number>(new Date().getMonth() + 1)
  const [endDay, setEndDay] = useState<number>(new Date().getDate())

  const [expandadTaskId, setExpandadTaskId] = useState<string | null>(null)
  const expandadTaskRef = useRef<HTMLParagraphElement>(null)

  useOutsideClick(expandadTaskRef, () => {
    setExpandadTaskId(null)
  })

  const addRef = useRef<HTMLDivElement | null>(null)
  const editRef = useRef<HTMLDivElement | null>(null)
    
  useOutsideClick(addRef, () => {
    setShowAdd(false)
    setAddText("")
  })
    
  useOutsideClick(editRef, () => {
    setEditingId(null)
    setEditText("")
  })

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

  const handleDatePickerClose = async () => {
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

  useOutsideClick(pickerRef, () => {
    handleDatePickerClose()
  })

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
    if (!longTermRecord) return
    setLongTermTasks(longTermRecord.tasks)
  }, [longTermRecord?.tasks])

  useEffect(() => {
     if (!longTermRecord) return
    fetchCompletedTasks()
  }, [longTermRecord])

  return (
  <div className="long-term-page">
    <Sidebar />

    <main className="content">

      <section className="section goal-section">

        <div className="section-header">

          <div className="section-header-main">
            <Target size={22} strokeWidth={1.8} />
            <h2>目標</h2>
          </div>

          <div className="section-description">
            この期間で達成したいこと
          </div>

        </div>

        <input
          className="goal-input"
          value={goalText}
          onChange={(e) =>
            setGoalText(e.target.value)
          }
          placeholder="目標を入力..."
          onBlur={async () =>
            await updateLongTermGoal(goalText)
          }
        />
      </section>


      <section className="section period-section">

        <div className="section-header">

          <div className="section-header-main">
            <CalendarDays size={22} strokeWidth={1.8} />
            <h2>期間</h2>
          </div>

          <div className="section-description">
            長期目標に取り組む期間
          </div>
          
        </div>

        <div className="period-picker">

          <div className="period-date">
            <button
              className="date-button"
              onClick={() => {
                setEditingType("start")
              }}
            >
              {displayStartDate}
            </button>

            {editingType === "start" && (
              <div
                className="date-picker"
                ref={pickerRef}
              >
                <div className="year-list">
                  {Array.from(
                    { length: 30 },
                    (_, i) => (
                      <div
                        key={i}
                        className="date-option"
                        onClick={() =>
                          setStartYear(lastYear + i)
                        }
                      >
                        {lastYear + i}年
                      </div>
                    )
                  )}
                </div>

                <div className="month-list">
                  {Array.from(
                    { length: 12 },
                    (_, i) => (
                      <div
                        key={i}
                        className="date-option"
                        onClick={() =>
                          setStartMonth(i + 1)
                        }
                      >
                        {i + 1}月
                      </div>
                    )
                  )}
                </div>

                <div className="day-list">
                  {Array.from(
                    { length: startDaysInMonth },
                    (_, i) => (
                      <div
                        key={i}
                        className="date-option"
                        onClick={() =>
                          setStartDay(i + 1)
                        }
                      >
                        {i + 1}日
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>


          <span className="period-separator">
            〜
          </span>


          {/* End Date */}
          <div className="period-date">
            <button
              className="date-button"
              onClick={() => {
                setEditingType("end")
              }}
            >
              {displayEndDate}
            </button>

            {editingType === "end" && (
              <div
                className="date-picker"
                ref={pickerRef}
              >
                <div className="year-list">
                  {Array.from(
                    {
                      length:
                        lastYear +
                        30 -
                        endFirstYear +
                        1,
                    },
                    (_, i) => {
                      const year =
                        endFirstYear + i

                      return (
                        <div
                          key={year}
                          className="date-option"
                          onClick={() =>
                            setEndYear(year)
                          }
                        >
                          {year}年
                        </div>
                      )
                    }
                  )}
                </div>

                <div className="month-list">
                  {Array.from(
                    {
                      length:
                        12 -
                        endFirstMonth +
                        1,
                    },
                    (_, i) => {
                      const month =
                        endFirstMonth + i

                      return (
                        <div
                          key={month}
                          className="date-option"
                          onClick={() =>
                            setEndMonth(month)
                          }
                        >
                          {month}月
                        </div>
                      )
                    }
                  )}
                </div>

                <div className="day-list">
                  {Array.from(
                    {
                      length:
                        endDaysInMonth -
                        endFirstDay +
                        1,
                    },
                    (_, i) => {
                      const day =
                        endFirstDay + i

                      return (
                        <div
                          key={day}
                          className="date-option"
                          onClick={() =>
                            setEndDay(day)
                          }
                        >
                          {day}日
                        </div>
                      )
                    }
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </section>


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
        <section className="section task-section">

          <div className="section-header">

            <div className="section-header-main">
              <ListTodo size={22} strokeWidth={1.8} />
              <h2>タスク</h2>
            </div>

          </div>

          <SortableContext
            items={longTermTasks}
            strategy={verticalListSortingStrategy}
          >
            <div className="task-list">

              {longTermTasks.length === 0 && (
                <p className="section-message">
                  タスクがありません
                  <br />
                  「新しいタスクを追加」から始められます。
                </p>
              )}

              {longTermTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  id={task.id}
                >
                  <div className="task-row">
                    <button
                      className={`task-toggle ${
                        task.completed ? "task-completed" : ""
                      }`}    
                      onClick={() =>
                        updateLongTermTaskToggle(task.id)
                      }
                    >
                      {task.completed ? "✓" : ""}
                    </button>
 
                    {editingId === task.id ? (
                      <div
                        className="task-edit"
                        ref={editRef}
                      >
                        <input
                          value={editText}
                          autoFocus
                          onChange={(e) =>
                            setEditText(e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              updateLongTermTaskTitle(
                                task.id,
                                editText
                              )
                              setEditText("")
                              setEditingId("")
                            }
                          }}
                        />
  
                        <button
                          className="task-action"
                          onClick={() => {
                            updateLongTermTaskTitle(
                              task.id,
                              editText
                            )
                            setEditText("")
                            setEditingId("")
                          }}
                        >
                          保存
                        </button>
                      </div>
                    ) : (
                      <div className="task-content">
                        <p
                          ref={
                            expandadTaskId === task.id
                              ? expandadTaskRef
                              : null
                          }
                          className={`task-title ${
                            expandadTaskId === task.id
                              ? "task-title-expanded"
                              : ""
                          } ${
                            task.completed
                              ? "task-completed"
                              : ""
                          }`}
                          onClick={() => {
                            setExpandadTaskId(
                              expandadTaskId === task.id
                                ? null
                                : task.id
                            )
                          }}
                        >
                          {task.title}
                        </p>
  
                        <button
                          className="task-action"
                          onClick={() => {
                            setEditingId(task.id)
                            setEditText(task.title)
                          }}
                        >
                          編集
                        </button>
                      </div>
                    )}
  
                    <button
                      className="task-delete"
                      onClick={() =>
                        deleteLongTermTask(task.id)
                      }
                    >
                      削除
                    </button>
                  </div>
                </TaskItem>
              ))}

            </div>
          </SortableContext>

          <div className="task-add">
            {showAdd ? (
              <div
                className="task-add-form"
                ref={addRef}
              >
                <input
                  className="task-add-input"
                  value={addText}
                  autoFocus
                  placeholder="タスクを入力..."
                  onChange={(e) =>
                    setAddText(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const text = addText
                      setAddText("")
                      addLongTermTask(text)
                      setShowAdd(false)
                    }
                  }}
                />

                <button
                  className="task-add-button"
                  onClick={() => {
                    const text = addText
                    setAddText("")
                    addLongTermTask(text)
                    setShowAdd(false)
                  }}
                >
                  追加
                </button>
              </div>
            ) : (
              <button
                className="add-task-button"
                onClick={() =>
                  setShowAdd(true)
                }
              >
                新しいタスクを追加
              </button>
            )}
          </div>

        </section>
      </DndContext>


      <section className="section reflection-section">

        <div className="section-header">

          <div className="section-header-main">
            <NotebookPen size={22} strokeWidth={1.8} />
            <h2>振り返り</h2>
          </div>
        </div>

        <textarea
          className="reflection-input"
          placeholder="振り返りを入力..."
          onBlur={() =>
            updateLongTermReflection(
              reflectionText
            )
          }
          value={reflectionText}
          onChange={(
            e: React.ChangeEvent<HTMLTextAreaElement>
          ) =>
            setReflectionText(e.target.value)
          }
        />

      </section>


      <section className="section completed-task-section">

        <div className="section-header">

          <div className="section-header-main">
            <Trophy size={22} strokeWidth={1.8} />  
            <h2>達成したタスク</h2>
          </div>

          <div className="section-description">
            この長期目標の期間中に達成した月タスク
          </div>
        </div>

        {Object.entries(groupedTasks).length > 0 ? (
          <div className="completed-task-groups">

            {Object.entries(groupedTasks).map(
              ([month, tasks]) => (
                <div
                  className="completed-task-group"
                  key={month}
                >
                  <h3 className="completed-task-month">
                    {new Date(month).getFullYear()}年
                    {new Date(month).getMonth() + 1}月
                  </h3>

                  {tasks.length === 0 ? (
                    <p className="section-message">
                      この期間中に達成したMonthlyタスクはありません
                    </p>
                  ) : (
                    <ul className="completed-task-list">
                      {tasks.map((task) => (
                        <li key={task}>
                          {task}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            )}

          </div>
        ) : (
          <p className="section-message">
            この期間中に達成したMonthlyタスクはありません
          </p>
        )}

      </section>


      <section className="section completion-section">

        <div className="section-header">

          <div className="section-header-main">
            <Flag size={22} strokeWidth={1.8} />
            <h2>目標を完了する</h2>
          </div>

          <div className="section-description">
            長期目標の達成状況を確定します
          </div>

        </div>

        <button
          className="completion-button"
          onClick={async () => {
            const isConfirmed = window.confirm(
              "達成にすると今の長期目標の画面はなくなり、新しい長期目標の画面へと更新されますがよろしいですか？"
            )

            if (!isConfirmed) return

            await updateLongTermToggle()
            await initializeLongTermPlan()
          }}
        >
          完了
        </button>

      </section>

    </main>
  </div>
)

 
}