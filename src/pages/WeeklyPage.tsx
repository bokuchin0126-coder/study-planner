import useWeekly from "../hooks/useWeekly"
import { useState } from "react"
import { Link } from "react-router-dom"


export default function WeeklyPage() {

  const {
    addWeeklyTasks,
    updateWeeklyTaskText,
    updateTaskToggle,
    updateWeeklyTaskReflection,
    deleteWeeklyTask,
    weeklyTasks,
    weekDate
  } = useWeekly()

  const [weekShowAdd, setWeekShowAdd] = useState<boolean>(false)
  const [nextWeekShowAdd, setNextWeekShowAdd] = useState<boolean>(false)

  const [addText, setAddText] = useState<string>("")
  const [editText, setEditText] = useState<string>("")
  const [reflectionText, setReflectionText] = useState<string>("")

  const [editingId, setEditingId] = useState<string>("")
  const [isTyping, setIsTyping] = useState<boolean>(false)

  const weekStart = weekDate("start")
  const nextWeekStart = weekDate("start", 1)

  const week = weeklyTasks.find(week => week.week === weekStart)
  const lastWeek = weeklyTasks.find(week => week.week === weekDate("start", -1))
  const nextWeek = weeklyTasks.find(week => week.week === nextWeekStart)

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
  
            {weekShowAdd ? 
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
                      setWeekShowAdd(false)
                    }
                  }} 
                />
                <button onClick={async () => {
                  await addWeeklyTasks(addText, weekStart),
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
            <p>振り返り</p>
            <textarea
            placeholder="振り返りを入力..."
            onBlur={() => {
              updateWeeklyTaskReflection(reflectionText, weekStart),
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
                          await updateWeeklyTaskText(goal.id, editText, nextWeekStart)
                          setEditText("")
                          setEditingId("")
                        }
                      }}
                    />
                    <button onClick={async () => {
                      await updateWeeklyTaskText(goal.id, editText, nextWeekStart)
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
                      await addWeeklyTasks(addText, nextWeekStart)
                      setAddText("")
                      setNextWeekShowAdd(false)
                    }
                  }} 
                />
                <button onClick={async () => {
                  await addWeeklyTasks(addText, nextWeekStart),
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
        </div>
        <Link to="/daily">デイリーへ</Link>
      </div>
    </>
  )
}