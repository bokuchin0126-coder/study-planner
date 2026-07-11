import useWeekly from "../hooks/useWeekly"
import { useState } from "react"
import { Link } from "react-router-dom"


export default function WeeklyPage() {

  const {
    addWeeklyTasks,
    updateWeeklyTaskText,
    updateTaskToggle,
    deleteWeeklyTask,
    weeklyTasks,
  } = useWeekly()

  const [showAdd, setShowAdd] = useState<boolean>(false)
  const [addText, setAddText] = useState<string>("")
  const [editText, setEditText] = useState<string>("")
  const [editingId, setEditingId] = useState<string>("")

  const weekDate = (date: "start" | "end", offset = 0) => {
      const today = new Date()
      const day = today.getDay()
  
      const monday = new Date(today)
      const diff = day === 0 ? -6 : 1 - day
      monday.setDate(today.getDate() + diff + offset * 7)
  
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
  
      const weekStart = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Tokyo"
      }).format(monday)
  
      const weekEnd = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Tokyo"
      }).format(sunday)
  
      if (date === "start") return weekStart
      else if (date === "end") return weekEnd
      else return ""
    }

  const weekStart = weekDate("start")

  const week = weeklyTasks.find(week => week.week === weekStart)


  return (
    <>
      <div>
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
                          await updateWeeklyTaskText(goal.id, editText, weekStart)
                          setEditText("")
                          setEditingId("")
                        }
                      }}
                    />
                    <button onClick={async () => {
                      await updateWeeklyTaskText(goal.id, editText, weekStart)
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
  
            {showAdd ? 
              <div>
                <input
                  value={addText}
                  autoFocus
                  placeholder="タスク名を入力..."
                  onChange={(e) => setAddText(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      await addWeeklyTasks(addText, weekStart)
                      setAddText("")
                      setShowAdd(false)
                    }
                  }} 
                />
                <button onClick={async () => {
                  await addWeeklyTasks(addText, weekStart),
                  setAddText(""),
                  setShowAdd(false)
                }}>
                  追加
                </button>
              </div>
            :
              <div>
                <p>{week ? "" : "タスクを追加してください"}</p>
                <button onClick={() => setShowAdd(true)}>新しいタスクを追加＋</button>
              </div>
            }
        </div>

        <div>
            <p>振り返り</p>
        </div>

        <div>
            今週達成したデイリータスク
        </div>
        <Link to="/daily">デイリーへ</Link>
      </div>
    </>
  )
}