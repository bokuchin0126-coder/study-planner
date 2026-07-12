import useWeekly from "../hooks/useWeekly"
import useDaily from "../hooks/useDaily"
import { useState } from "react"
import type { DailyRecord } from "../types/daily"
import { Link } from "react-router-dom"


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

  const week = weeklyRecords.find(week => week.week === weekStart)
  const lastWeek = weeklyRecords.find(week => week.week === weeklyDate("start", -1))
  const nextWeek = weeklyRecords.find(week => week.week === nextWeekStart)

  const thisWeekDailyPlans = dailyRecords.filter((day: DailyRecord) => weekStart <= day.date && day.date <= weekEnd )
  const completedThisWeekDailyPlans = thisWeekDailyPlans.flatMap((day: DailyRecord) => 
    day.tasks
      .filter(task => task.completed)
      .map(task => ({
        ...task,
        date: day.date
      }))
  )

  const completedLastWeekTasks = lastWeek?.goals.filter(goal => goal.completed)


  return (
    <>
      <div>
        
        <div>
          <h2>先週達成した課題</h2>
          {lastWeek ?
            completedLastWeekTasks && completedLastWeekTasks.length > 0 ? 
              completedLastWeekTasks.map(goal => (
                <p>・{goal.completed ? goal.title : ""}</p>
              ))
            :
              <p>先週達成したタスクはありません</p>  
          
          :
            <p>先週のタスクはありません</p>
          }
        </div>

        <div>
            <h2>今週の課題</h2>

            {week?.goals.map(goal =>
              <div key={goal.id}>

                <button onClick={() => updateTaskToggle(goal.id, goal.completed, weekStart)}>
                  {goal.completed ? "☑" : "□"}
                </button>

                {editingId === goal.id ?
                  <div>
                    <input
                      value={editText}
                      autoFocus
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                          await updateWeeklyTaskTitle(goal.id, editText, weekStart)
                          setEditText("")
                          setEditingId("")
                        }
                      }}
                    />
                    <button onClick={async () => {
                      await updateWeeklyTaskTitle(goal.id, editText, weekStart)
                      setEditText("")
                      setEditingId("")
                    }}>
                      保存
                    </button>
                  </div>
                :
                  <div>
                    <p>{goal.title}</p>
                    <button onClick={() => {
                      setEditingId(goal.id)
                      setEditText(goal.title)
                    }}
                    >
                      編集
                    </button>
                  </div>
                }
                <button onClick={() => deleteWeeklyTask(goal.id, weekStart)}>
                  削除
                </button>
              </div>
            )}
  
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
                <p>{week ? "" : "タスクを追加してください"}</p>
                <button onClick={() => setWeekShowAdd(true)}>新しいタスクを追加＋</button>
              </div>
            }
        </div>

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

        <div>
          <h2>来週の課題</h2>

          {nextWeek?.goals.map(goal =>
              <div key={goal.id}>

                <button onClick={() => updateTaskToggle(goal.id, goal.completed, nextWeekStart)}>
                  {goal.completed ? "☑" : "□"}
                </button>

                {editingId === goal.id ?
                  <div>
                    <input
                      value={editText}
                      autoFocus
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                          await updateWeeklyTaskTitle(goal.id, editText, nextWeekStart)
                          setEditText("")
                          setEditingId("")
                        }
                      }}
                    />
                    <button onClick={async () => {
                      await updateWeeklyTaskTitle(goal.id, editText, nextWeekStart)
                      setEditText("")
                      setEditingId("")
                    }}>
                      保存
                    </button>
                  </div>
                :
                  <div>
                    <p>{goal.title}</p>
                    <button onClick={() => {
                      setEditingId(goal.id)
                      setEditText(goal.title)
                    }}
                    >
                      編集
                    </button>
                  </div>
                }
                <button onClick={() => deleteWeeklyTask(goal.id, nextWeekStart)}>
                  削除
                </button>
              </div>
            )}
  
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
                <p>{week ? "" : "タスクを追加してください"}</p>
                <button onClick={() => setNextWeekShowAdd(true)}>新しいタスクを追加＋</button>
              </div>
            }
        </div>

        <div>
            今週達成したデイリータスク
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
        <Link to="/daily">デイリーへ</Link>
        <Link to="/monthly">マンリーへ</Link>
      </div>
    </>
  )
}