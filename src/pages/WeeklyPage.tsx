import useWeekly from "../hooks/useWeekly"
import useDaily from "../hooks/useDaily"
import { useState, useEffect } from "react"
import type { DailyRecord } from "../types/daily"
import type { Task } from "../types/baseTask"
import { Link } from "react-router-dom"
import handleDragEnd from "../utils/dragAndDrop"
import TaskItem from "../components/TaskItem"
import { DndContext } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"


export default function WeeklyPage() {

  const {
    addWeeklyRecord,
    updateWeeklyTaskTitle,
    updateTaskToggle,
    updateWeeklyRecordReflection,
    deleteWeeklyTask,
    weeklyRecords,
    weeklyDate
  } = useWeekly()

  const {dailyRecords} = useDaily()

  const [weekShowAdd, setWeekShowAdd] = useState<boolean>(false)
  const [nextWeekShowAdd, setNextWeekShowAdd] = useState<boolean>(false)

  const [addText, setAddText] = useState<string>("")
  const [editText, setEditText] = useState<string>("")
  const [reflectionText, setReflectionText] = useState<string>("")

  const [editingId, setEditingId] = useState<string>("")
  const [isTyping, setIsTyping] = useState<boolean>(false)

  const weekStart = weeklyDate("start")
  const weekEnd = weeklyDate("end")
  const nextWeekStart = weeklyDate("start", 1)

  const weekPlan = weeklyRecords.find(week => week.week === weekStart)
  const lastWeekPlan = weeklyRecords.find(week => week.week === weeklyDate("start", -1))
  const nextWeekPlan = weeklyRecords.find(week => week.week === nextWeekStart)

  const [weekTasks, setWeekTasks] = useState<Task[]>([])
  const [nextWeekTasks, setNextWeekTasks] = useState<Task[]>([])

  const thisWeekDailyPlans = dailyRecords.filter((day: DailyRecord) => weekStart <= day.date && day.date <= weekEnd )
  const completedThisWeekDailyPlans = thisWeekDailyPlans.flatMap((day: DailyRecord) => 
    day.tasks
      .filter(task => task.completed)
      .map(task => ({
        ...task,
        date: day.date
      }))
  )

  const completedLastWeekTasks = lastWeekPlan?.tasks.filter(task => task.completed)

  useEffect(() => {
    if (weekPlan) {
      setWeekTasks(weekPlan.tasks)
    }
  }, [weekPlan])

  useEffect(() => {
    if (nextWeekPlan) {
      setNextWeekTasks(nextWeekPlan.tasks)
    }
  }, [nextWeekPlan])


  return (
    <>
    <div>
      <DndContext onDragEnd={(event) =>
        handleDragEnd(
          event,
          weekTasks,
          "weekly_tasks",
          setWeekTasks
        )
      }>
        
        <div>
          <h2>先週達成した課題</h2>
          {lastWeekPlan ?
            completedLastWeekTasks && completedLastWeekTasks.length > 0 ? 
              completedLastWeekTasks.map(task => (
                <p key={task.id}>・{task.completed ? task.title : ""}</p>
              ))
            :
              <p>先週達成したタスクはありません</p>  
          
          :
            <p>先週のタスクはありません</p>
          }
        </div>

        <div>
            <h2>今週の課題</h2>

            <SortableContext
                items={weekTasks}
                strategy={verticalListSortingStrategy}
            >
            
              {weekTasks.map(task =>
                <TaskItem
                  key={task.id}
                  id={task.id}
                >

                  <button onClick={() => updateTaskToggle(task.id, task.completed, weekStart)}>
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
                            await updateWeeklyTaskTitle(task.id, editText, weekStart)
                            setEditText("")
                            setEditingId("")
                          }
                        }}
                      />
                      <button onClick={async () => {
                        await updateWeeklyTaskTitle(task.id, editText, weekStart)
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
                  <button onClick={() => deleteWeeklyTask(task.id, weekStart)}>
                    削除
                  </button>
                </TaskItem>
              )}

            </SortableContext>
  
            {weekShowAdd ? 
              <div>
                <input
                  value={addText}
                  autoFocus
                  placeholder="タスク名を入力..."
                  onChange={(e) => setAddText(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      await addWeeklyRecord(addText, weekStart)
                      setAddText("")
                      setWeekShowAdd(false)
                    }
                  }} 
                />
                <button onClick={async () => {
                  await addWeeklyRecord(addText, weekStart),
                  setAddText(""),
                  setWeekShowAdd(false)
                }}>
                  追加
                </button>
              </div>
            :
              <div>
                <p>{weekPlan ? "" : "タスクを追加してください"}</p>
                <button onClick={() => setWeekShowAdd(true)}>新しいタスクを追加＋</button>
              </div>
            }
        </div>
      </DndContext>

      <div>
        <h2>今週の振り返り</h2>
        <textarea
          placeholder="振り返りを入力..."
          onBlur={() => {
            updateWeeklyRecordReflection(reflectionText, weekStart),
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
          nextWeekTasks,
          "weekly_tasks",
          setNextWeekTasks
        )
      }>
        <h2>来週の課題</h2>

        <SortableContext
          items={nextWeekTasks}
          strategy={verticalListSortingStrategy}
        >

          {nextWeekPlan?.tasks.map(task =>
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
                        await updateWeeklyTaskTitle(task.id, editText, nextWeekStart)
                        setEditText("")
                        setEditingId("")
                      }
                    }}
                  />
                  <button onClick={async () => {
                    await updateWeeklyTaskTitle(task.id, editText, nextWeekStart)
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
              <button onClick={() => deleteWeeklyTask(task.id, nextWeekStart)}>
                削除
              </button>
            </TaskItem>
          )}
        </SortableContext>
  
        {nextWeekShowAdd ? 
          <div>
            <input
              value={addText}
              autoFocus
              placeholder="タスク名を入力..."
              onChange={(e) => setAddText(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  await addWeeklyRecord(addText, nextWeekStart)
                  setAddText("")
                  setNextWeekShowAdd(false)
                }
              }} 
            />
            <button onClick={async () => {
              await addWeeklyRecord(addText, nextWeekStart),
              setAddText(""),
              setNextWeekShowAdd(false)
            }}>
              追加
            </button>
          </div>
        :
          <div>
            <p>{weekPlan ? "" : "タスクを追加してください"}</p>
            <button onClick={() => setNextWeekShowAdd(true)}>新しいタスクを追加＋</button>
          </div>
        }
      </DndContext>

      <div>
        <h2>今週達成したデイリータスク</h2>
        {completedThisWeekDailyPlans.length > 0 ? (
          completedThisWeekDailyPlans.map((task, index) => {
            const [, month, day] = task.date.split("-")
            const displayDate = `${Number(month)}/${Number(day)}`
            const prevDate = index > 0 ? completedThisWeekDailyPlans[index - 1].date : null
            return (
                <div key={task.id}>
                  {task.date !== prevDate && <p>{displayDate}</p>}
                  <p key={task.id}>✓{task.title}</p>
              </div>
            )
          })
        )
        : 
          <p>今週達成したタスクはありません</p>
        }
      </div>

      <div>
        <Link to="/daily">デイリーへ</Link>
        <Link to="/monthly">マンリーへ</Link>
      </div>

    </div>
    </>
  )
}