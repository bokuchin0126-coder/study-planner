import useMonthly from "../hooks/useMonthly"
import useWeekly from "../hooks/useWeekly"
import type { WeeklyRecord } from "../types/weekly"
import type { Task } from "../types/baseTask"
import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import handleDragEnd from "../utils/dragAndDrop"
import TaskItem from "../components/TaskItem"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"


export default function MonthlyPage() {
  const {
    addMonthlyRecord,
    updateMonthlyTaskTitle,
    updateMonthlyTaskToggle,
    updateMonthlyRecordReflection,
    deleteMonthlyTask,
    monthlyDate,
    monthlyRecords
  } = useMonthly()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
      distance: 8,
      },
    })
  )

  const {weeklyRecords} = useWeekly()

  const [addText, setAddText] = useState<string>("")
  const [editText, setEditText] = useState<string>("")
  const [reflectionText, setReflectionText] = useState<string>("")

  const [monthShowAdd, setMonthShowAdd] = useState<boolean>(false)
  const [nextMonthShowAdd, setNextMonthShowAdd] = useState<boolean>(false)
  const [editingId, setEditingId] = useState<string>("")

  const monthStart = monthlyDate("start")
  const monthEnd = monthlyDate("end")
  const nextMonthStart = monthlyDate("start", 1)
  const lastMonthStart = monthlyDate("start", -1)

  const month = monthlyRecords.find(month => month.month === monthStart)
  const nextMonth = monthlyRecords.find(month => month.month === nextMonthStart)
  const lastMonth = monthlyRecords.find(month => month.month === lastMonthStart)
  
  const completedLastMonthTasks = lastMonth?.tasks.filter(task => task.completed)

  const thisMonthWeeklyPlans = weeklyRecords.filter((week: WeeklyRecord) => monthStart <= week.week && week.week <= monthEnd )
  const completedThisMonthWeeklyPlans = thisMonthWeeklyPlans.map((week: WeeklyRecord) => ({
    week: week.week,
    tasks: week.tasks.filter(task => task.completed)
  })).sort(
    (a, b) => new Date(a.week).getTime() - new Date(b.week).getTime()
  )

  const getWeekNumber = (weekStart: string) => {
    const weekDate = new Date(weekStart)
    const firstDay = new Date(monthStart)
    const firstWeekMonday = new Date(firstDay)

    while (firstWeekMonday.getDay() !== 1) {
      firstWeekMonday.setDate(firstWeekMonday.getDate() - 1)
    }
    const diff = weekDate.getTime() - firstWeekMonday.getTime()
    const days = diff / (1000 * 60 * 60 * 24)

    return Math.floor(days / 7) + 1
  }
  
  const maxWeek = getWeekNumber(monthEnd)
  const weeks = Array.from({ length: maxWeek} , (_, i) => i + 1)

  const [monthTasks, setMonthTasks] = useState<Task[]>(month?.tasks ?? [])
  const [nextMonthTasks, setNextMonthTasks] = useState<Task[]>(nextMonth?.tasks ?? [])

  useEffect(() => {
    if (month) {
      setMonthTasks(month.tasks)
    }
  }, [month])

  useEffect(() => {
    if (nextMonth) {
      setNextMonthTasks(nextMonth.tasks)
    }
  }, [nextMonth])

  useEffect(() => {
    setReflectionText(month?.reflection ?? "")
  }, [month])

  return ( 
  <div className="monthly-page"> 
    <Sidebar /> 

    <main className="monthly-content"> 

      <header className="monthly-header"> 
        <p className="monthly-date"> 
          {monthStart} ～ {monthEnd} 
        </p> 
 
        <h1 className="monthly-title"> 
          今月の学習 
        </h1> 
      </header> 
 
 
      <section className="monthly-section last-month-section"> 
 
        <div className="section-header"> 
          <h2>先月の達成</h2>
        </div>

        {lastMonth ? (
          completedLastMonthTasks && 
          completedLastMonthTasks.length > 0 ? ( 

            <ul className="completed-task-list">
              {completedLastMonthTasks.map(task => ( 
                <li key={task.id}>
                  {task.title}
                </li> 
              ))} 
            </ul> 

          ) : ( 

            <p className="section-message"> 
              先月達成したタスクはありません 
            </p> 
 
          ) 
        ) : ( 
 
          <p className="section-message"> 
            先月のタスクはありません 
          </p> 
 
        )} 
 
      </section> 
 
 
      <DndContext 
        sensors={sensors} 
        onDragEnd={(event) =>
          handleDragEnd( 
            event, 
            monthTasks, 
            "monthly_tasks", 
            setMonthTasks 
          ) 
        } 
      > 
 
        <section className="monthly-section this-month-section"> 
 
          <div className="section-header"> 
            <div>
              <h2>今月の課題</h2> 
 
              <p className="section-description"> 
                今月取り組むタスク 
              </p> 
            </div> 
          </div> 
 
 
          <SortableContext 
            items={monthTasks} 
            strategy={verticalListSortingStrategy}
          >
 
            <div className="task-list">

              {monthTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  id={task.id} 
                > 

                  <button 
                    className="task-toggle"
                    onClick={() => 
                      updateMonthlyTaskToggle( 
                        task.id, 
                        task.completed, 
                        monthStart 
                      ) 
                    } 
                  > 
                    {task.completed ? "☑" : "□"} 
                  </button> 
 
 
                  {editingId === task.id ? ( 
 
                    <div className="task-edit"> 
 
                      <input 
                        value={editText} 
                        autoFocus
                        onChange={(e) => 
                          setEditText(e.target.value) 
                        } 
                        onKeyDown={async (e) => { 
                          if (e.key === "Enter") { 
                            await updateMonthlyTaskTitle( 
                              task.id, 
                              editText, 
                              monthStart 
                            ) 

                            setEditText("") 
                            setEditingId("") 
                          } 
                        }} 
                      /> 
 
                      <button 
                        className="task-action" 
                        onClick={async () => { 
                          await updateMonthlyTaskTitle( 
                            task.id, 
                            editText, 
                            monthStart 
                          ) 
 
                          setEditText("") 
                          setEditingId("") 
                        }} 
                      > 
                        保存 
                      </button> 
 
                    </div> 
 
                  ) : ( 
 
                    <div className="task-content"> 
 
                      <p className="task-title"> 
                        {task.title} 
                      </p> 

                      <button 
                        className="task-action" 
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
                    className="task-delete"
                    onClick={() => 
                      deleteMonthlyTask( 
                        task.id, 
                        monthStart 
                      ) 
                    } 
                  >
                    削除 
                  </button> 
 
                </TaskItem> 
              ))} 
 
            </div> 
 
          </SortableContext>
 
 
          <div className="task-add">

            {monthShowAdd ? ( 
 
              <div className="task-add-form"> 
 
                <input 
                  className="task-add-input" 
                  value={addText} 
                  autoFocus 
                  placeholder="タスク名を入力..." 
                  onChange={(e) => 
                    setAddText(e.target.value) 
                  } 
                  onKeyDown={async (e) => { 
                    if (e.key === "Enter") { 
                      await addMonthlyRecord( 
                        addText, 
                        monthStart 
                      ) 
 
                      setAddText("") 
                      setMonthShowAdd(false) 
                    } 
                  }} 
                /> 
 
                <button 
                  className="task-add-button" 
                  onClick={async () => { 
                    await addMonthlyRecord( 
                      addText, 
                      monthStart 
                    ) 
 
                    setAddText("") 
                    setMonthShowAdd(false) 
                  }}
                > 
                  追加 
                </button> 
 
              </div> 
 
            ) : ( 
 
              <div> 
 
                {!month && (
                  <p className="section-message"> 
                    タスクを追加してください 
                  </p> 
                )} 
 
                <button 
                  className="add-task-button" 
                  onClick={() => setMonthShowAdd(true)} 
                > 
                  新しいタスクを追加 
                </button> 
 
              </div> 
 
            )} 
 
          </div> 
 
        </section> 
 
      </DndContext> 
 
 
      <section className="monthly-section reflection-section">

        <div className="section-header"> 
          <h2>今月の振り返り</h2> 
        </div> 
 
        <textarea 
          className="reflection-input" 
          placeholder="今月の学習で気づいたこと、できたこと、改善したいこと..."
          onBlur={() => 
            updateMonthlyRecordReflection( 
              reflectionText, 
              monthStart
            ) 
          } 
          value={reflectionText}
          onChange={( 
            e: React.ChangeEvent<HTMLTextAreaElement> 
          ) => 
            setReflectionText(e.target.value) 
          } 
        /> 
 
      </section> 
 

      <DndContext 
        sensors={sensors} 
        onDragEnd={(event) => 
          handleDragEnd( 
            event, 
            nextMonthTasks, 
            "monthly_tasks", 
            setNextMonthTasks 
          ) 
        } 
      > 
 
        <section className="monthly-section next-month-section"> 
 
          <div className="section-header">
 
            <div> 
              <h2>来月の課題</h2> 
 
              <p className="section-description"> 
                来月取り組むタスクを準備しておきましょう 
              </p> 
            </div> 
 
          </div> 
 
 
          <SortableContext 
            items={nextMonthTasks} 
            strategy={verticalListSortingStrategy} 
          > 
 
            <div className="task-list"> 
 
              {nextMonthTasks.map(task => ( 
                <TaskItem 
                  key={task.id}
                  id={task.id} 
                > 
 
                  {editingId === task.id ? ( 
 
                    <div className="task-edit"> 
 
                      <input 
                        value={editText} 
                        autoFocus 
                        onChange={(e) => 
                          setEditText(e.target.value) 
                        }
                        onKeyDown={async (e) => { 
                          if (e.key === "Enter") { 
                            await updateMonthlyTaskTitle( 
                              task.id, 
                              editText,
                              nextMonthStart 
                            ) 
 
                            setEditText("") 
                            setEditingId("") 
                          }
                        }} 
                      /> 
 
                      <button 
                        className="task-action" 
                        onClick={async () => { 
                          await updateMonthlyTaskTitle( 
                            task.id, 
                            editText, 
                            nextMonthStart 
                          ) 
 
                          setEditText("") 
                          setEditingId("") 
                        }} 
                      > 
                        保存 
                      </button> 
 
                    </div> 
 
                  ) : ( 
 
                    <div className="task-content"> 

                      <p className="task-title"> 
                        {task.title} 
                      </p> 
 
                      <button 
                        className="task-action" 
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
                    className="task-delete" 
                    onClick={() => 
                      deleteMonthlyTask( 
                        task.id, 
                        nextMonthStart 
                      ) 
                    } 
                  > 
                    削除 
                  </button> 
 
                </TaskItem> 
              ))} 
 
            </div> 
 
          </SortableContext> 
 
 
          <div className="task-add"> 
 
            {nextMonthShowAdd ? ( 

              <div className="task-add-form"> 

                <input 
                  className="task-add-input" 
                  value={addText} 
                  autoFocus 
                  placeholder="タスク名を入力..." 
                  onChange={(e) => 
                    setAddText(e.target.value) 
                  } 
                  onKeyDown={async (e) => { 
                    if (e.key === "Enter") { 
                      await addMonthlyRecord( 
                        addText, 
                        nextMonthStart 
                      ) 
 
                      setAddText("") 
                      setNextMonthShowAdd(false) 
                    } 
                  }} 
                /> 
 
                <button 
                  className="task-add-button" 
                  onClick={async () => { 
                    await addMonthlyRecord( 
                      addText, 
                      nextMonthStart 
                    ) 
 
                    setAddText("") 
                    setNextMonthShowAdd(false) 
                  }} 
                > 
                  追加 
                </button> 
 
              </div> 
 
            ) : ( 
 
              <button 
                className="add-task-button" 
                onClick={() => 
                  setNextMonthShowAdd(true) 
                } 
              > 
                新しいタスクを追加 
              </button> 
 
            )} 
 
          </div> 
 
        </section> 
 
      </DndContext> 
 
 
      <section className="monthly-section completed-weekly-section"> 
 
        <div className="section-header"> 
 
          <div> 
            <h2>今月達成したウィークリータスク</h2> 
 
            <p className="section-description"> 
              今月のWeeklyページで達成したタスク 
            </p> 
          </div>
 
        </div> 
 

        {completedThisMonthWeeklyPlans.length > 0 ? ( 
 
          <div className="completed-weekly-list"> 
 
            {weeks.map(number => { 
 
              const week = 
                completedThisMonthWeeklyPlans.find( 
                  item => 
                    getWeekNumber(item.week) === number 
                ) 
 
              return ( 
                <div 
                  className="completed-weekly-group" 
                  key={number} 
                > 

                  <p className="completed-weekly-title"> 
                    Week {number} 
                  </p> 
 
 
                  {week && week.tasks.length > 0 ? ( 
 
                    <ul className="completed-task-list"> 
 
                      {week.tasks.map(task => ( 
                        <li key={task.id}> 
                          ✓ {task.title} 
                        </li> 
                      ))} 
 
                    </ul> 
 
                  ) : ( 
 
                    <p className="section-message"> 
                      達成した課題はありません 
                    </p> 
 
                  )} 

                </div> 
              ) 
 
            })} 
 
          </div> 
 
        ) : ( 
 
          <p className="section-message"> 
            今月達成したウィークリータスクはありません 
          </p> 
 
        )}
 
      </section> 
 
    </main> 
  </div> 
  ) 
}