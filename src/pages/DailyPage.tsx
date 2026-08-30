import useDaily from "../hooks/useDaily" 
import { useState, useEffect, useRef } from "react" 
import Sidebar from "../components/Sidebar" 
import handleDragEnd from "../utils/dragAndDrop" 
import TaskItem from "../components/TaskItem" 
import { useOutsideClick } from "../hooks/useOutsideClick"
import useLongTerm from "../hooks/useLongTerm"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable" 
import {
  ClipboardList,
  CalendarDays,
  NotebookPen,
  Trophy,
  BarChart,
} from "lucide-react"
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

  const completedTaskCount = todayTasks.filter(task => task.completed).length
  const incompleteTaskCount = todayTasks.filter(task => !task.completed).length

  const { longTermRecord } = useLongTerm()
  const estimatedTomorrowTaskCount = tomorrowTasks.length + incompleteTaskCount 

  const completedYesterdayTasks = yesterdayPlan?.tasks.filter(task => task.completed)

  const todayTotalTaskCount = completedTaskCount + incompleteTaskCount

  const todayCompletionRate =
    todayTotalTaskCount > 0
      ? Math.round((completedTaskCount / todayTotalTaskCount) * 100)
      : 0

  const todayCompletionText =
    todayTotalTaskCount === 0
      ? "タスクなし"
      : todayCompletionRate === 100
        ? "すべて達成"
        : todayCompletionRate >= 70
          ? "順調"
          : todayCompletionRate >= 40
            ? "もうひと踏ん張り"
            : "これから"

  const yesterdayCompletedTaskCount = completedYesterdayTasks?.length  ?? 0

  const yesterdayTotalTaskCount = yesterdayPlan?.tasks.length ?? 0

  const yesterdayCompletionRate =
    yesterdayTotalTaskCount > 0
      ? Math.round(
          (yesterdayCompletedTaskCount / yesterdayTotalTaskCount) * 100
        )
      : 0

 
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
            <ClipboardList size={22} strokeWidth={1.8} />
            <h2>今日の課題</h2>
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
                        className={`daily-task-toggle ${
                          task.completed ? "task-completed"
                          : ""
                        }`}
                        onClick={async () => {
                          await updateDailyTaskToggle(
                            task.id,
                            task.completed,
                            today
                          )
                        }}
                      >
                        {task.completed ? "✓" : ""}
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
          <NotebookPen size={22} strokeWidth={1.8} />
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
            <CalendarDays size={22} strokeWidth={1.8} />
            <h2>明日の課題</h2>
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
          <Trophy size={22} strokeWidth={1.8} />
          <h2>昨日達成した課題</h2>
        </div>

        <div className="daily-yesterday-content">

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

        </div>

      </section>

      <section className="daily-section daily-summary-section">
        <div className="daily-section-header">
          <BarChart size={22} strokeWidth={1.8} />
          <h2>今日の概要</h2>
        </div>
  
        <div className="daily-summary-goal">
          <span className="daily-summary-label">長期目標</span>
          <p className="daily-summary-goal-value">
            {longTermRecord?.goal}
          </p>
        </div>
  
        <div className="daily-summary-progress">
          <div className="daily-summary-progress-heading">
            <span>今日の達成率</span>
            <strong>{todayCompletionRate}%</strong>
          </div>
   
          <div className="daily-summary-progress-track">
            <div
              className="daily-summary-progress-bar"
              style={{ width: `${todayCompletionRate}%` }}
            />
          </div>
        </div>
 
        <div className="daily-summary-yesterday">
          <div className="daily-summary-yesterday-row">
            <span>昨日の達成率</span>
            <strong>{yesterdayCompletionRate}%</strong>
          </div>
        </div>
  
        <div className="daily-summary-stats">

          <div className="daily-summary-stat-group">
            <div className="daily-summary-stat">
              <span className="daily-summary-label">達成</span>
              <span className="daily-summary-value">
                {completedTaskCount}
                <small>タスク</small>
              </span>
            </div>

            <div className="daily-summary-stat">
               <span className="daily-summary-label">未達成</span>
              <span className="daily-summary-value">
                {incompleteTaskCount}
                <small>タスク</small>
              </span>
            </div>
          </div>

          <div className="daily-summary-stat-divider" />

          <div className="daily-summary-stat-group">
            <div className="daily-summary-stat">
              <span className="daily-summary-label">今日のタスク</span>
              <span className="daily-summary-value">
                {todayTotalTaskCount}
                <small>タスク</small>
              </span>
            </div>
  
            <div className="daily-summary-stat">
               <span className="daily-summary-label">明日の推定</span>
              <span className="daily-summary-value">
                {estimatedTomorrowTaskCount}
                <small>タスク</small>
              </span>
            </div>
          </div>

        </div>

  
        <div className="daily-summary-note">
          今日の進み具合を確認して、残りの課題に取り組みましょう。
        </div>
      </section>


    </main>
  </div>
)
 
} 