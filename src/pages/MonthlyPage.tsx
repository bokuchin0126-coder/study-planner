import useMonthly from "../hooks/useMonthly"
import useWeekly from "../hooks/useWeekly"
import type { WeeklyRecord } from "../types/weekly"
import { useState } from "react"
import { Link } from "react-router-dom"


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
  
  const completedLastMonthTasks = lastMonth?.goals.filter(goal => goal.completed)

  const thisMonthWeeklyPlans = weeklyRecords.filter((week: WeeklyRecord) => monthStart <= week.week && week.week <= monthEnd )
  const completedThisMonthWeeklyPlans = thisMonthWeeklyPlans.map((week: WeeklyRecord) => ({
    week: week.week,
    goals: week.goals.filter(goal => goal.completed)
  }))

  return (
    <>
      <div>

        <div>
          <h2>先週達成した課題</h2>
          {lastMonth ?
            completedLastMonthTasks && completedLastMonthTasks.length > 0 ? 
              completedLastMonthTasks.map(goal => (
                <p>・{goal.completed ? goal.title : ""}</p>
              ))
            :
              <p>先週達成したタスクはありません</p>  
          
          :
            <p>先週のタスクはありません</p>
          }
        </div>

        <div>
          <h2>今月の課題</h2>
          {month?.goals.map(goal =>
              <div key={goal.id}>

                <button onClick={() => updateMonthlyTaskToggle(goal.id, goal.completed, monthStart)}>
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
                          await updateMonthlyTaskTitle(goal.id, editText, monthStart)
                          setEditText("")
                          setEditingId("")
                        }
                      }}
                    />
                    <button onClick={async () => {
                      await updateMonthlyTaskTitle(goal.id, editText, monthStart)
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
                <button onClick={() => deleteMonthlyTask(goal.id, monthStart)}>
                  削除
                </button>
              </div>
            )}

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

        <div>
            <h2>来月の課題</h2>
          {nextMonth?.goals.map(goal =>
              <div key={goal.id}>

                <button onClick={() => updateMonthlyTaskToggle(goal.id, goal.completed, nextMonthStart)}>
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
                          await updateMonthlyTaskTitle(goal.id, editText, nextMonthStart)
                          setEditText("")
                          setEditingId("")
                        }
                      }}
                    />
                    <button onClick={async () => {
                      await updateMonthlyTaskTitle(goal.id, editText, nextMonthStart)
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
                <button onClick={() => deleteMonthlyTask(goal.id, nextMonthStart)}>
                  削除
                </button>
              </div>
            )}

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

        <div>
          <h2>今月達成したウィークリータスク</h2>

          {completedThisMonthWeeklyPlans.length > 0 ? (
            completedThisMonthWeeklyPlans.map((week, index) => (
              <div key={week.week}>
                <h3>Week {index + 1}</h3>

                {week.goals.length > 0 ? (
                  week.goals.map(goal => (
                    <p key={goal.id}>✓ {goal.title}</p>
                  ))
                )
                :
                  <p>達成した課題はありません</p>
                }
              </div>
            ))
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