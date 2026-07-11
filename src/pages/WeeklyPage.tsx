import useWeekly from "../hooks/useWeekly"
import { useState } from "react"
import { Link } from "react-router-dom"


export default function WeeklyPage() {

  const {
    addWeeklyTasks,
    updateWeeklyTaskText,
    updateTaskToggle,
    weeklyTasks,
    weekDate
  } = useWeekly()

  const [showAdd, setShowAdd] = useState<boolean>(false)
  const [addText, setAddText] = useState<string>("")
  const [editText, setEditText] = useState<string>("")
  const [editingId, setEditingId] = useState<string>("")

  const weekStart = weekDate("start")
  const weekEnd = weekDate("end")

  const week = weeklyTasks.find(week => week.week === weekStart)


  return (
    <>
      <div>
        <div>
            <h2>今週の課題</h2>

            {week?.goals.map(goal =>
              <div key={goal.id}>

                <button onClick={() => updateTaskToggle(goal.id, goal.completed)}>
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
                          await updateWeeklyTaskText(goal.id, editText)
                          setEditText("")
                          setEditingId("")
                        }
                      }}
                    />
                    <button onClick={async () => {
                      await updateWeeklyTaskText(goal.id, editText)
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
                <button>
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
                      await addWeeklyTasks(addText)
                      setAddText("")
                      setShowAdd(false)
                    }
                  }} 
                />
                <button onClick={async () => {
                  await addWeeklyTasks(addText),
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