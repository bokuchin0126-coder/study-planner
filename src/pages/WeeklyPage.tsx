import useWeekly from "../hooks/useWeekly"
import { useState } from "react"
import { Link } from "react-router-dom"


export default function WeeklyPage() {

  const {
    addWeeklyTasks,
    weeklyTasks,
    keepWeekStart
  } = useWeekly()

  const [showAdd, setShowAdd] = useState<boolean>(false)
  const [addText, setAddText] = useState<string>("")

  const week = weeklyTasks.filter(week => week.week === keepWeekStart)


  return (
    <>
      <div>
        <div>
            <h2>今週の課題</h2>

            {showAdd ? 
              <div>
                <input
                  value={addText}
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
                <p>{week.length === 0 && "タスクを追加してください"}</p>
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