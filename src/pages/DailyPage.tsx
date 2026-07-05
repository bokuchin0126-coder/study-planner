import { useDaily } from "../hooks/useDaily"
import { useState } from "react"

export default function DailyPage() {

  const { 
    dailyTasks,
    addDailyTasks,
    updateDailyTaskTitle,
    updateDailyTasksToggle,
    deleteDailyTask,
    updateDailyTaskReflection
  } = useDaily()

  const [addText, setAddText] = useState<string>("")
  const [editText, setEditText] = useState<string>("")
  const [reflectionText, setReflectionText] = useState<string>("")

  const [showAdd, setShowAdd] = useState<boolean>(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isEditingPlan, setIsEditingPlan] = useState<boolean>(false)

  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo"
  }).format(new Date())

  const todayDate = dailyTasks.find(daily => daily.date === today)
  const todayTasks = dailyTasks.filter(day => day.date === today)

    
  return (
    <>
      <div>
        <div>
          <h2>今日の課題</h2>

          {todayDate ?
          
            todayDate.tasks.map(task =>
              <div key={task.id}>
                <button 
                  disabled={!isEditingPlan}
                  onClick={() => updateDailyTasksToggle(task.id, task.completed, today)}
                >
                  {task.completed ? "☑" : "□"}
                </button>

                {editingId === task.id ?
                  <div>

                    <input
                      autoFocus
                      value={editText}
                      disabled={!isEditingPlan}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                          await updateDailyTaskTitle(task.id, editText, today)
                          setEditText("")
                          setEditingId(null)
                        }
                      }}
                    />

                    <button 
                      disabled={!isEditingPlan}
                      onClick={async () => {
                        await updateDailyTaskTitle(task.id, editText, today)
                        setEditText("")
                        setEditingId(null)
                      }}
                    >
                      保存
                    </button>

                  </div>
                :
                  <div>

                    <p>{task.title}</p>
                    <button
                      disabled={!isEditingPlan} 
                      onClick={() => {
                        setEditingId(task.id)
                        setEditText(task.title)
                      }}
                    >
                      編集
                    </button>

                  </div>
                }

                <button 
                  disabled={!isEditingPlan}
                  onClick={() => deleteDailyTask(task.id, today)}
                >
                  削除
                </button>
              </div>
            )
          :
            <p>タスクを追加してください</p>
          }
        

          {showAdd ? 

            <div>
              <input
                placeholder="タスク名を入力..."
                autoFocus
                disabled={!isEditingPlan}
                value={addText}
                onChange={(e) => setAddText(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    await addDailyTasks(addText, today)
                    setAddText("")
                    setShowAdd(false)
                  }
                }}
              />
              <button 
                disabled={!isEditingPlan}
                onClick={async () => {
                  await addDailyTasks(addText, today),
                  setAddText(""),
                  setShowAdd(false)}}
              >
                追加
              </button>
            </div>
          :
            <button 
              disabled={!isEditingPlan}
              onClick={() => setShowAdd(true)}
            >
              新しいタスクを追加＋
            </button>
          }

        </div>

        <div>
          <h2>今日の振り返り</h2>
          <textarea
            placeholder="振り返りを入力..."
            disabled={!isEditingPlan}
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
          />
        </div>

        <div>
          <h2>明日の課題</h2>
        </div>

        <div>
          {isEditingPlan ?
          
            <button onClick={() => {
              updateDailyTaskReflection(reflectionText, today), 
              setIsEditingPlan(false)
            }}>
              保存する
            </button>
          :
            <button onClick={() => setIsEditingPlan(true)}>
              編集する
            </button>
          }
        </div>
      </div>
    </>
  )
}