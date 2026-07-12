import useDaily from "../hooks/useDaily"
import { useState } from "react"
import { Link } from "react-router-dom"

export default function DailyPage() {
 
  const { 
    dailyRecords,
    today,
    tomorrowDate,
    todayPlan,
    tomorrowPlan,
    yesterdayPlan,
    addDailyRecord,
    updateDailyTaskTitle,
    updateDailyTaskToggle,
    deleteDailyTask,
    updateDailyRecordReflection,
    carryOverRecords
  } = useDaily()

  const [addText, setAddText] = useState<string>("")
  const [editText, setEditText] = useState<string>("")
  const [reflectionText, setReflectionText] = useState<string>("")

  const [todayShowAdd, setTodayShowAdd] = useState<boolean>(false)
  const [tomorrowShowAdd, setTomorrowShowAdd] = useState<boolean>(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState<boolean>(false)

  const completedYesterdayTasks = yesterdayPlan?.tasks.filter(task => task.completed)

    
  return (
    <>
      <div>

        <div>
          <h2>昨日達成した課題</h2>
          {yesterdayPlan ?
            completedYesterdayTasks && completedYesterdayTasks.length > 0 ? 
              completedYesterdayTasks.map(task => (
                <p key={task.id}>・{task.title}</p>
              ))
            :
              <p>昨日達成したタスクはありません</p>     
          :
            <p>昨日のタスクはありません</p>
          }
        </div>

        <div>
          <h2>今日の課題</h2>

          {todayPlan ?
          
            todayPlan.tasks.map(task =>
              <div key={task.id}>
                <button 
                  onClick={async () => {
                    await updateDailyTaskToggle(task.id, task.completed, today),
                    await carryOverRecords()
                  }}
                >
                  {task.completed ? "☑" : "□"}
                </button>

                {editingId === task.id ?
                  <div>

                    <input
                      autoFocus
                      value={editText}
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
                  onClick={async () => await deleteDailyTask(task.id, today)}
                >
                  削除
                </button>
              </div>
            )
          :
            <p>タスクを追加してください</p>
          }
        

          {todayShowAdd ? 

            <div>
              <input
                placeholder="タスク名を入力..."
                autoFocus
                value={addText}
                onChange={(e) => setAddText(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    await addDailyRecord(addText, today)
                    await carryOverRecords()
                    setAddText("")
                    setTodayShowAdd(false)
                  }
                }}
              />
              <button 
                onClick={async () => {
                  await addDailyRecord(addText, today),
                  await carryOverRecords()
                  setAddText(""),
                  setTodayShowAdd(false)}}
              >
                追加
              </button>
            </div>
          :
            <button 
              onClick={() => setTodayShowAdd(true)}
            >
              新しいタスクを追加＋
            </button>
          }
          <p>※達成されなかったタスクは自動で明日に引き継がれます</p>

        </div>

        <div>
          <h2>今日の振り返り</h2>
          <textarea
            placeholder="振り返りを入力..."
            onBlur={() => {
              updateDailyRecordReflection(reflectionText, today),
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
          <h2>明日の課題</h2>
           {tomorrowPlan ?
          
            tomorrowPlan.tasks.map(task =>
              <div key={task.id}>

                {editingId === task.id ?
                  <div>

                    <input
                      autoFocus
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                          await updateDailyTaskTitle(task.id, editText, tomorrowDate)
                          setEditText("")
                          setEditingId(null)
                        }
                      }}
                    />

                    <button 
                      onClick={async () => {
                        await updateDailyTaskTitle(task.id, editText, tomorrowDate)
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
                  onClick={() => deleteDailyTask(task.id, tomorrowDate)}
                >
                  削除
                </button>
              </div>
            )
          :
            <p>タスクを追加してください</p>
          }

          {tomorrowShowAdd ? 

            <div>
              <input
                placeholder="タスク名を入力..."
                autoFocus
                value={addText}
                onChange={(e) => setAddText(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    await addDailyRecord(addText, tomorrowDate)
                    setAddText("")
                    setTomorrowShowAdd(false)
                  }
                }}
              />
              <button 
                onClick={async () => {
                  await addDailyRecord(addText, tomorrowDate),
                  setAddText(""),
                  setTomorrowShowAdd(false)}}
              >
                追加
              </button>
            </div>
          :
            <button 
              onClick={() => setTomorrowShowAdd(true)}
            >
              新しいタスクを追加＋
            </button>
          }
        </div>

        <Link to="/weekly">ウィークリーへ</Link>
        <Link to="/monthly">マンリーへ</Link>
      </div>
    </>
  )
}