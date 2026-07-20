import useLongTerm from "../hooks/useLongTerm"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import handleDragEnd from "../utils/dragAndDrop"
import TaskItem from "../components/TaskItem"
import { DndContext } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"



export default function LongTermPage() {
  const {
    longTermRecord,
    addLongTermTask,
    updateLongTermGoal,
    updateLongTermStartDate,
    updateLongTermEndDate,
    updateLongTermReflection,
    updateLongTermToggle,
    updateLongTermTaskTitle,
    updateLongTermTaskToggle,
    deleteLongTermTask
  } = useLongTerm()

  const [addText, setAddText] = useState<string>("")
  const [editText, setEditText] = useState<string>("")
  const [goalText, setGoalText] = useState<string>("")
  const [reflectionText, setReflectionText] = useState<string>("")

  const [editingId, setEditingId] = useState<string>("")
  const [showAdd, setShowAdd] = useState<boolean>(false)

  useEffect(() => {
    if (!longTermRecord) return
    setGoalText(longTermRecord.goal)
    setReflectionText(longTermRecord.reflection)
  }, [longTermRecord])

  return (
    <>
      <div>
        <div>
          <h2>目標</h2>
          <input
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            placeholder="目標を入力..."
            onBlur={() => updateLongTermGoal(goalText)}
          />
        </div>

        <div>
          <h2>期間</h2>
        </div>

        <div>
          <h2>タスク</h2>

          {longTermRecord?.tasks.map(task => 
            <div key={task.id}>

              <button onClick={() => updateLongTermTaskToggle(task.id)}>
                {task.completed ? "☑" : "□"}
              </button>

              {editingId === task.id ? 
                <div>
                  <input
                    value={editText}
                    autoFocus
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        updateLongTermTaskTitle(task.id, editText)
                        setEditText("")
                        setEditingId("")
                      }
                    }}
                  />
                  <button onClick={() => {
                    updateLongTermTaskTitle(task.id, editText)
                    setEditText("")
                    setEditingId("")
                  }}>
                    保存
                  </button>
                </div>
              :
                <div>
                  {task.title}
                  <button onClick={() => {
                    setEditingId(task.id),
                    setEditText(task.title)
                  }}>
                    編集
                  </button>
                </div>
              }
              <button onClick={() => deleteLongTermTask(task.id)}>
                削除
              </button>
            </div>
          )}
          {showAdd ?
            <div>
              <input
                value={addText}
                autoFocus
                onChange={(e) => setAddText(e.target.value)}
                placeholder="タスクを入力"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addLongTermTask(addText)
                    setAddText("")
                    setShowAdd(false)
                  }
                }}
              />
              <button onClick={() => {
                addLongTermTask(addText),
                setAddText("")
                setShowAdd(false)
              }}>
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
          <h2>振り返り</h2>
          <textarea
            placeholder="振り返りを入力..."
            onBlur={() => updateLongTermReflection(reflectionText)}
            value={reflectionText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReflectionText(e.target.value)}
          />
        </div>

        <div>
          <h2>達成したタスク</h2>
        </div>

        <div>
          <Link to="/daily">デイリーへ</Link>
          <Link to="/weekly">ウィークリーへ</Link>
          <Link to="/monthly">マンリーへ</Link>
        </div>
      </div>
    </>
  )
}