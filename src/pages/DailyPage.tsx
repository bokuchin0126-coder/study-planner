import useDaily from "../hooks/useDaily" 
import { useState, useEffect, useRef } from "react" 
import Sidebar from "../components/Sidebar" 
import handleDragEnd from "../utils/dragAndDrop" 
import TaskItem from "../components/TaskItem" 
import { useOutsideClick } from "../hooks/useOutsideClick"
import useLongTerm from "../hooks/useLongTerm"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable" 
import { 
  DndContext, 
  PointerSensor, 
  useSensor, 
  useSensors, 
} from "@dnd-kit/core" 
import "../css/daily.css"

export default function DailyPage() { 
 
  const {  
    today, 
    todayTasks, 
    setTodayTasks, 
    tomorrowTasks, 
    setTomorrowTasks, 
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
 
  const sensors = useSensors( 
    useSensor(PointerSensor, { 
      activationConstraint: { 
        distance: 8, 
      }, 
    }) 
  ) 
 
  const [addText, setAddText] = useState<string>("") 
  const [editText, setEditText] = useState<string>("") 
  const [reflectionText, setReflectionText] = useState<string>("") 
 
  const [todayShowAdd, setTodayShowAdd] = useState<boolean>(false) 
  const [tomorrowShowAdd, setTomorrowShowAdd] = useState<boolean>(false) 
 
  const [editingId, setEditingId] = useState<string | null>(null) 

  const [expandadTaskId, setExpandadTaskId] = useState<string | null>(null)
  const expandadTaskRef = useRef<HTMLParagraphElement | null>(null)

  useOutsideClick(expandadTaskRef, () => {
    setExpandadTaskId(null)
  })

  const todayAddRef = useRef<HTMLDivElement | null>(null)
  const tomorrowAddRef = useRef<HTMLDivElement | null>(null)
  const editRef = useRef<HTMLDivElement | null>(null)

  useOutsideClick(todayAddRef, () => {
    setTodayShowAdd(false)
    setAddText("")
  })

  useOutsideClick(tomorrowAddRef, () => {
    setTomorrowShowAdd(false)
    setAddText("")
  })

  useOutsideClick(editRef, () => {
    setEditingId(null)
    setEditText("")
  })
 
  const completedYesterdayTasks = yesterdayPlan?.tasks.filter(task => task.completed) 

  const completedTaskCount = todayTasks.filter(task => task.completed).length
  const incompleteTaskCount = todayTasks.filter(task => !task.completed).length

  const { longTermRecord } = useLongTerm()
  const estimatedTomorrowTaskCount = tomorrowTasks.length + incompleteTaskCount 
 
  useEffect(() => { 
    if (todayPlan) { 
      setReflectionText(todayPlan.reflection) 
    } 
  }, [todayPlan]) 

   
  return (
  <div className="daily-page">
    <Sidebar />

    <main className="daily-content">

      <DndContext
        sensors={sensors}
        onDragEnd={(event) =>
          handleDragEnd(
            event,
            todayTasks,
            "daily_tasks",
            setTodayTasks
          )
        }
      >
        <section className="daily-section daily-today-section">

          <div className="daily-section-header">
            <div>
              <h2>今日の課題</h2>
            </div>
          </div>

          {todayTasks.length !== 0 ? (
            <SortableContext
              items={todayTasks}
              strategy={verticalListSortingStrategy}
            >
              <div className="daily-task-list">

                {todayTasks.map(task =>
                  <TaskItem
                    key={task.id}
                    id={task.id}
                  >
                    <div className="daily-task-row">

                      <button
                        className="daily-task-toggle"
                        onClick={async () => {
                          await updateDailyTaskToggle(
                            task.id,
                            task.completed,
                            today
                          )
                        }}
                      >
                        {task.completed ? "☑" : "□"}
                      </button>

                      {editingId === task.id ? (
                        <div 
                          className="daily-task-edit"
                          ref={editRef}
                        >

                          <input
                            autoFocus
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={async (e) => {
                              if (e.key === "Enter") {
                                await updateDailyTaskTitle(
                                  task.id,
                                  editText,
                                  today
                                )
                                setEditText("")
                                setEditingId(null)
                              }
                            }}
                          />

                          <button
                            className="daily-task-action"
                            onClick={async () => {
                              await updateDailyTaskTitle(
                                task.id,
                                editText,
                                today
                              )
                              setEditText("")
                              setEditingId(null)
                            }}
                          >
                            保存
                          </button>

                        </div>
                      ) : (
                        <div className="daily-task-content">

                          <p
                            ref={
                              expandadTaskId === task.id
                                ? expandadTaskRef
                                : null
                            }
                            className={`daily-task-title ${
                              expandadTaskId === task.id
                                ? "daily-task-title-expanded"
                                : ""
                            } ${
                              task.completed ? "task-completed"
                              : ""
                            }`}
                            onClick={() => {
                              setExpandadTaskId(
                                expandadTaskId === task.id
                                  ? null
                                  : task.id
                              )
                            }}
                          >
                            {task.title}
                          </p>

                          <button
                            className="daily-task-action"
                            onClick={() => {
                              setEditingId(task.id)
                              setEditText(task.title)
                            }}
                          >
                            編集
                          </button>

                        </div>
                      )}

                      <button
                        className="daily-task-delete"
                        onClick={async () => {
                          await deleteDailyTask(
                            task.id,
                            today
                          )
                        }}
                      >
                        削除
                      </button>

                    </div>
                  </TaskItem>
                )}

              </div>
            </SortableContext>
          ) : (
            <p className="daily-section-message">
              タスクがありません
              <br />
              「新しいタスクを追加」から始められます。
            </p>
          )}

          <div className="daily-task-add">

            {todayShowAdd ? (
              <div 
                className="daily-task-add-form"
                ref={todayAddRef}
              >

                <input
                  className="daily-task-add-input"
                  placeholder="タスク名を入力..."
                  autoFocus
                  value={addText}
                  onChange={(e) => setAddText(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      const text = addText
                      setAddText("")
                      const task = await addDailyRecord(
                        text,
                        today
                      )
                      setTodayShowAdd(false)
                      await carryOverRecords(task)
                    }
                  }}
                />

                <button
                  className="daily-task-add-button"
                  onClick={async () => {
                    const text = addText
                    setAddText("")
                    const task = await addDailyRecord(
                      text,
                      today
                    )
                    setTodayShowAdd(false)
                    await carryOverRecords(task)
                  }}
                >
                  追加
                </button>

              </div>
            ) : (
              <button
                className="daily-add-task-button"
                onClick={() => setTodayShowAdd(true)}
              >
                新しいタスクを追加
              </button>
            )}

          </div>

          <p className="daily-carryover-note">
            ※達成されなかったタスクは自動で明日に引き継がれます
          </p>

        </section>
      </DndContext>


      <section className="daily-section daily-reflection-section">

        <div className="daily-section-header">
          <h2>今日の振り返り</h2>
        </div>

        <textarea
          className="daily-reflection-input"
          placeholder="今日の学習で気づいたこと、できたこと、改善したいこと..."
          onBlur={() => {
            updateDailyRecordReflection(
              reflectionText,
              today
            )
          }}
          value={reflectionText}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setReflectionText(e.target.value)
          }}
        />

      </section>


      <DndContext
        sensors={sensors}
        onDragEnd={(event) =>
          handleDragEnd(
            event,
            tomorrowTasks,
            "daily_tasks",
            setTomorrowTasks
          )
        }
      >
        <section className="daily-section daily-tomorrow-section">

          <div className="daily-section-header">
            <div>
              <h2>明日の課題</h2>
            </div>
          </div>

          {tomorrowTasks.length !== 0 ? (
            <SortableContext
              items={tomorrowTasks}
              strategy={verticalListSortingStrategy}
            >
              <div className="daily-task-list">

                {tomorrowTasks.map(task =>
                  <TaskItem
                    key={task.id}
                    id={task.id}
                  >
                    <div className="daily-task-row">

                      {editingId === task.id ? (
                        <div 
                          className="daily-task-edit"
                          ref={editRef}
                        >

                          <input
                            autoFocus
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={async (e) => {
                              if (e.key === "Enter") {
                                await updateDailyTaskTitle(
                                  task.id,
                                  editText,
                                  tomorrowDate
                                )
                                setEditText("")
                                setEditingId(null)
                              }
                            }}
                          />

                          <button
                            className="daily-task-action"
                            onClick={async () => {
                              await updateDailyTaskTitle(
                                task.id,
                                editText,
                                tomorrowDate
                              )
                              setEditText("")
                              setEditingId(null)
                            }}
                          >
                            保存
                          </button>

                        </div>
                      ) : (
                        <div className="daily-task-content">

                          <p
                            ref={
                              expandadTaskId === task.id
                                ? expandadTaskRef
                                : null
                            }
                            className={`daily-task-title ${
                              expandadTaskId === task.id
                                ? "daily-task-title-expanded"
                                : ""
                            }`}
                            onClick={() => {
                              setExpandadTaskId(
                                expandadTaskId === task.id
                                  ? null
                                  : task.id
                              )
                            }}
                          >
                            {task.title}
                          </p>

                          <button
                            className="daily-task-action"
                            onClick={() => {
                              setEditingId(task.id)
                              setEditText(task.title)
                            }}
                          >
                            編集
                          </button>

                        </div>
                      )}

                      <button
                        className="daily-task-delete"
                        onClick={() => {
                          deleteDailyTask(
                            task.id,
                            tomorrowDate
                          )
                        }}
                      >
                        削除
                      </button>

                    </div>
                  </TaskItem>
                )}

              </div>
            </SortableContext>
          ) : (
            <p className="daily-section-message">
              タスクがありません
              <br />
              「新しいタスクを追加」から始められます。
            </p>
          )}

          <div className="daily-task-add">

            {tomorrowShowAdd ? (
              <div 
                className="daily-task-add-form"
                ref={tomorrowAddRef}
              >

                <input
                  className="daily-task-add-input"
                  placeholder="タスク名を入力..."
                  autoFocus
                  value={addText}
                  onChange={(e) => setAddText(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      const text = addText
                      setAddText("")
                      await addDailyRecord(
                        text,
                        tomorrowDate
                      )
                      setTomorrowShowAdd(false)
                    }
                  }}
                />

                <button
                  className="daily-task-add-button"
                  onClick={async () => {
                    const text = addText
                    setAddText("")
                    await addDailyRecord(
                      text,
                      tomorrowDate
                    )
                    setTomorrowShowAdd(false)
                  }}
                >
                  追加
                </button>

              </div>
            ) : (
              <button
                className="daily-add-task-button"
                onClick={() => setTomorrowShowAdd(true)}
              >
                新しいタスクを追加
              </button>
            )}

          </div>

        </section>
      </DndContext>


      <section className="daily-section daily-yesterday-section">

        <div className="daily-section-header">
          <h2>昨日達成した課題</h2>
        </div>

        {yesterdayPlan ? (
          completedYesterdayTasks &&
          completedYesterdayTasks.length > 0 ? (
            <ul className="daily-completed-task-list">

              {completedYesterdayTasks.map(task => (
                <li key={task.id}>
                  {task.title}
                </li>
              ))}

            </ul>
          ) : (
            <p className="daily-section-message">
              昨日達成したタスクはありません
            </p>
          )
        ) : (
          <p className="daily-section-message">
            昨日のタスクはありません
          </p>
        )}

      </section>

      <section className="daily-section daily-summary-section">

        <h2>今日の概要</h2>

        <div className="daily-summary-item">
          <h3>長期目標</h3>
          <p className="daily-summary-value">
            {longTermRecord?.goal}
          </p>
        </div>
  
        <div className="daily-summary-item">
          <h3>未達成</h3>
          <p className="daily-summary-value">
            {incompleteTaskCount}
          </p>
        </div>
  
        <div className="daily-summary-item">
          <h3>達成</h3>
          <p className="daily-summary-value">
            {completedTaskCount}
          </p>
        </div>
 
        <div className="daily-summary-item">
          <h3>明日の推定タスク</h3>
          <p className="daily-summary-value">
            {estimatedTomorrowTaskCount}
          </p>
        </div>
 
      </section>




    </main>
  </div>
)
 
} 