import useMonthly from "../hooks/useMonthly"
import useWeekly from "../hooks/useWeekly"
import type { WeeklyRecord } from "../types/weekly"
import type { Task } from "../types/baseTask"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import handleDragEnd from "../utils/dragAndDrop"
import TaskItem from "../components/TaskItem"
import { DndContext } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"


export default function MonthlyPage() {
  const {
    addMonthlyRecord,
    updateMonthlyTaskTitle,
    updateMonthlyTaskToggle,
    updateMonthlyRecordReflection,
    deleteMonthlyTask,
    monthlyDate,
    monthlyRecords
  } = useMonthly()

  const {weeklyRecords} = useWeekly()

  const [addText, setAddText] = useState<string>("")
  const [editText, setEditText] = useState<string>("")
  const [reflectionText, setReflectionText] = useState<string>("")

  const [monthShowAdd, setMonthShowAdd] = useState<boolean>(false)
  const [nextMonthShowAdd, setNextMonthShowAdd] = useState<boolean>(false)
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [editingId, setEditingId] = useState<string>("")

  const monthStart = monthlyDate("start")
  const monthEnd = monthlyDate("end")
  const nextMonthStart = monthlyDate("start", 1)
  const lastMonthStart = monthlyDate("start", -1)

  const month = monthlyRecords.find(month => month.month === monthStart)
  const nextMonth = monthlyRecords.find(month => month.month === nextMonthStart)
  const lastMonth = monthlyRecords.find(month => month.month === lastMonthStart)
  
  const completedLastMonthTasks = lastMonth?.tasks.filter(task => task.completed)

  const thisMonthWeeklyPlans = weeklyRecords.filter((week: WeeklyRecord) => monthStart <= week.week && week.week <= monthEnd )
  const completedThisMonthWeeklyPlans = thisMonthWeeklyPlans.map((week: WeeklyRecord) => ({
    week: week.week,
    tasks: week.tasks.filter(task => task.completed)
  })).sort(
    (a, b) => new Date(a.week).getTime() - new Date(b.week).getTime()
  )

  const getWeekNumber = (weekStart: string) => {
    const weekDate = new Date(weekStart)
    const firstDay = new Date(monthStart)
    const firstWeekMonday = new Date(firstDay)

    while (firstWeekMonday.getDay() !== 1) {
      firstWeekMonday.setDate(firstWeekMonday.getDate() - 1)
    }
    const diff = weekDate.getTime() - firstWeekMonday.getTime()
    const days = diff / (1000 * 60 * 60 * 24)

    return Math.floor(days / 7) + 1
  }
  
  const maxWeek = getWeekNumber(monthEnd)
  const weeks = Array.from({ length: maxWeek} , (_, i) => i + 1)

  const [monthTasks, setMonthTasks] = useState<Task[]>(month?.tasks ?? [])
  const [nextMonthTasks, setNextMonthTasks] = useState<Task[]>(nextMonth?.tasks ?? [])

  useEffect(() => {
    if (month) {
      setMonthTasks(month.tasks)
    }
  }, [month])

  useEffect(() => {
    if (nextMonth) {
      setNextMonthTasks(nextMonth.tasks)
    }
  }, [nextMonth])

  return (
    <>
      <div>

        <div>
          <h2>先週達成した課題</h2>
          {lastMonth ?
            completedLastMonthTasks && completedLastMonthTasks.length > 0 ? 
              completedLastMonthTasks.map(task => (
                <p>・{task.completed ? task.title : ""}</p>
              ))
            :
              <p>先週達成したタスクはありません</p>  
          
          :
            <p>先週のタスクはありません</p>
          }
        </div>

        <DndContext onDragEnd={(event) =>
          handleDragEnd(
            event,
            monthTasks,
            "monthly_tasks",
            setMonthTasks
          )
        }>

          <div>
            <h2>今月の課題</h2>
            <SortableContext
              items={monthTasks}
              strategy={verticalListSortingStrategy}
            >
              {monthTasks.map(task =>
                <TaskItem
                  key={task.id}
                  id={task.id}  
                >

                  <button onClick={() => updateMonthlyTaskToggle(task.id, task.completed, monthStart)}>
                    {task.completed ? "☑" : "□"}
                  </button>
  
                  {editingId === task.id ?
                    <div>
                      <input
                        value={editText}
                        autoFocus
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={async (e) => {
                          if (e.key === "Enter") {
                            await updateMonthlyTaskTitle(task.id, editText, monthStart)
                            setEditText("")
                            setEditingId("")
                          }
                        }}
                      />
                      <button onClick={async () => {
                        await updateMonthlyTaskTitle(task.id, editText, monthStart)
                        setEditText("")
                        setEditingId("")
                      }}>
                        保存
                      </button>
                    </div>
                  :
                    <div>
                      <p>{task.title}</p>
                      <button onClick={() => {
                        setEditingId(task.id)
                        setEditText(task.title)
                      }}
                      >
                        編集
                      </button>
                    </div>
                  }
                  <button onClick={() => deleteMonthlyTask(task.id, monthStart)}>
                    削除
                  </button>
                </TaskItem>
              )}
            </SortableContext>
  
            {monthShowAdd ? 
              <div>
                <input
                  value={addText}
                  autoFocus
                  placeholder="タスク名を入力..."
                  onChange={(e) => setAddText(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      await addMonthlyRecord(addText, monthStart)
                      setAddText("")
                      setMonthShowAdd(false)
                    }
                  }} 
                />
                <button onClick={async () => {
                  await addMonthlyRecord(addText, monthStart),
                  setAddText(""),
                  setMonthShowAdd(false)
                }}>
                  追加
                </button>
              </div>
            :
              <div>
                <p>{month ? "" : "タスクを追加してください"}</p>
                <button onClick={() => setMonthShowAdd(true)}>新しいタスクを追加＋</button>
              </div>
            }
          </div>
        </DndContext>

        <div>
            <h2>今週の振り返り</h2>
            <textarea
            placeholder="振り返りを入力..."
            onBlur={() => {
              updateMonthlyRecordReflection(reflectionText, monthStart),
              setIsTyping(false)
            }}
            value={reflectionText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setReflectionText(e.target.value),
              setIsTyping(true)
            }}
          />
          <p>{isTyping ? "入力中..." : "保存済み✓"}</p>
        </div>

        <DndContext onDragEnd={(event) =>
          handleDragEnd(
            event,
            nextMonthTasks,
            "monthly_tasks",
            setNextMonthTasks
          )
        }>

        <div>
          <h2>来月の課題</h2>

          <SortableContext
            items={nextMonthTasks}
            strategy={verticalListSortingStrategy}
          >
            {nextMonthTasks.map(task =>
              <TaskItem
                key={task.id}
                id={task.id}
              >

                {editingId === task.id ?
                  <div>
                    <input
                      value={editText}
                      autoFocus
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                          await updateMonthlyTaskTitle(task.id, editText, nextMonthStart)
                          setEditText("")
                          setEditingId("")
                        }
                      }}
                    />
                    <button onClick={async () => {
                      await updateMonthlyTaskTitle(task.id, editText, nextMonthStart)
                      setEditText("")
                      setEditingId("")
                    }}>
                      保存
                    </button>
                  </div>
                :
                  <div>
                    <p>{task.title}</p>
                    <button onClick={() => {
                      setEditingId(task.id)
                      setEditText(task.title)
                    }}
                    >
                      編集
                    </button>
                  </div>
                }
                <button onClick={() => deleteMonthlyTask(task.id, nextMonthStart)}>
                  削除
                </button>
              </TaskItem>
            )}
          </SortableContext>

          {nextMonthShowAdd ? 
              <div>
                <input
                  value={addText}
                  autoFocus
                  placeholder="タスク名を入力..."
                  onChange={(e) => setAddText(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      await addMonthlyRecord(addText, nextMonthStart)
                      setAddText("")
                      setNextMonthShowAdd(false)
                    }
                  }} 
                />
                <button onClick={async () => {
                  await addMonthlyRecord(addText, nextMonthStart),
                  setAddText(""),
                  setNextMonthShowAdd(false)
                }}>
                  追加
                </button>
              </div>
            :
              <div>
                <p>{month ? "" : "タスクを追加してください"}</p>
                <button onClick={() => setNextMonthShowAdd(true)}>新しいタスクを追加＋</button>
              </div>
            }            
        </div>
        </DndContext>

        <div>
          <h2>今月達成したウィークリータスク</h2>

          {completedThisMonthWeeklyPlans.length > 0 ? (
            weeks.map(number => {
              const week = completedThisMonthWeeklyPlans.find(
                item => getWeekNumber(item.week) === number
              )

              return (
                <div key={number}>
                  <h3>Week {number}</h3>

                  {week && week.tasks.length > 0 ? (
                    week.tasks.map(task => (
                      <p key={task.id}>✓ {task.title}</p>
                    ))
                  )
                  :
                    <p>達成した課題はありません</p>
                  }
                </div>
              )
            })
          ) 
          : 
            <p>今月達成したウィークリータスクはありません</p>
          }
        </div>
        
        <div>
          <Link to="/daily">デイリーへ</Link>
          <Link to="/weekly">ウィークリーへ</Link>
        </div>
      </div>
    </>
  )
}