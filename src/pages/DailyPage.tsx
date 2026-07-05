import { useDaily } from "../hooks/useDaily"
import { useState } from "react"

export default function DailyPage() {

  const { 
    dailyTasks,
    todayDate,
    addDailyTasks
  } = useDaily()

  const [addText, setAddText] = useState<string>("")
  const [showAdd, setShowAdd] = useState<boolean>(false)


    
  return (
    <>
      <div>
        <div>
          <h2>今日の課題</h2>

          {todayDate ?
          
            todayDate.tasks.map(task =>
              <div key={task.id}>
                <p>{task.completed ? "☑" : "□"}</p>
                <p>{task.title}</p>
              </div>
            )
          :
            <p>タスクを追加してください</p>
          }
        

          {showAdd ? 

            <div>
              <input
                placeholder="タスク名を入力"
                autoFocus
                value={addText}
                onChange={(e) => setAddText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addDailyTasks(addText)
                    setAddText("")
                    setShowAdd(false)
                  }
                }}
              />
              <button 
                onClick={() => {
                  addDailyTasks(addText),
                  setAddText(""),
                  setShowAdd(false)}}
              >
                追加
              </button>
            </div>
          :
            <button onClick={() => setShowAdd(true)}>
              新しいタスクを追加＋
            </button>
          }

        </div>

        <div>
          <h2>今日の振り返り</h2>
        </div>

        <div>
          <h2>明日の課題</h2>
        </div>
      </div>
    </>
  )
}