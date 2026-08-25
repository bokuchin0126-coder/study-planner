import useWeekly from "../hooks/useWeekly" 
import useDaily from "../hooks/useDaily" 
import Sidebar from "../components/Sidebar" 
import { useState, useEffect } from "react" 
import type { DailyRecord } from "../types/daily" 
import type { Task } from "../types/baseTask" 
import handleDragEnd from "../utils/dragAndDrop" 
import TaskItem from "../components/TaskItem" 
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable" 
import { 
  DndContext, 
  PointerSensor,
  useSensor, 
  useSensors, 
} from "@dnd-kit/core" 
import "../css/weekly.css"

export default function WeeklyPage() { 
 
  const {
    addWeeklyRecord, 
    updateWeeklyTaskTitle, 
    updateTaskToggle, 
    updateWeeklyRecordReflection, 
    deleteWeeklyTask, 
    weeklyRecords, 
    weeklyDate 
  } = useWeekly()
 
  const sensors = useSensors( 
    useSensor(PointerSensor, { 
      activationConstraint: { 
        distance: 8, 
      }, 
    }) 
  ) 
 
  const { dailyRecords } = useDaily() 

  const [weekShowAdd, setWeekShowAdd] = useState<boolean>(false) 
  const [nextWeekShowAdd, setNextWeekShowAdd] = useState<boolean>(false) 
 
  const [addText, setAddText] = useState<string>("") 
  const [editText, setEditText] = useState<string>("")
  const [reflectionText, setReflectionText] = useState<string>("") 
 
  const [editingId, setEditingId] = useState<string>("") 
 
  const weekStart = weeklyDate("start") 
  const weekEnd = weeklyDate("end")
  const nextWeekStart = weeklyDate("start", 1) 
  const nextWeekEnd = weeklyDate("end", 1) 
 
  const weekPlan = weeklyRecords.find(week => week.week === weekStart) 
  const lastWeekPlan = weeklyRecords.find( 
    week => week.week === weeklyDate("start", -1) 
  ) 
  const nextWeekPlan = weeklyRecords.find( 
    week => week.week === nextWeekStart
  ) 
 
  const [weekTasks, setWeekTasks] = useState<Task[]>([]) 
  const [nextWeekTasks, setNextWeekTasks] = useState<Task[]>([]) 

  const thisWeekDailyPlans = dailyRecords.filter( 
    (day: DailyRecord) => 
      weekStart <= day.date && day.date <= weekEnd 
  ) 
 
  const completedThisWeekDailyPlans = thisWeekDailyPlans
    .sort((a, b) => a.date.localeCompare(b.date))
    .flatMap(
      (day: DailyRecord) =>
        day.tasks
          .filter(task => task.completed)
          .map(task => ({
            ...task,
            date: day.date
          }))
  )


  const completedLastWeekTasks = 
    lastWeekPlan?.tasks.filter(task => task.completed) 
 
  useEffect(() => { 
    if (weekPlan) { 
      setWeekTasks(weekPlan.tasks) 
      setReflectionText(weekPlan.reflection) 
    } 
  }, [weekPlan]) 
 
  useEffect(() => { 
    if (nextWeekPlan) { 
      setNextWeekTasks(nextWeekPlan.tasks) 
    }
  }, [nextWeekPlan]) 
 
  return ( 
    <div className="weekly-page"> 
      <Sidebar /> 
 
      <main className="weekly-content"> 
  
 
        <DndContext 
          sensors={sensors} 
          onDragEnd={(event) => 
            handleDragEnd( 
              event, 
              weekTasks, 
              "weekly_tasks", 
              setWeekTasks 
            ) 
          } 
        > 
          <section className="weekly-section this-week-section"> 
 
            <div className="weekly-section-header"> 
              <div> 
                <h2>今週の課題</h2> 
              </div> 
            </div> 
 
            <SortableContext 
              items={weekTasks} 
              strategy={verticalListSortingStrategy} 
            >
              <div className="weekly-task-list">

                {weekTasks.length === 0 && ( 
                  <p className="weekly-section-message"> 
                    タスクがありません
                  <br />
                  「新しいタスクを追加」から始められます。 
                  </p> 
                )}
 
                {weekTasks.map(task =>
                  <TaskItem 
                    key={task.id} 
                    id={task.id} 
                  > 

                    <div className="weekly-task-row">
                    
                      <button 
                        className="weekly-task-toggle" 
                        onClick={() =>
                          updateTaskToggle( 
                            task.id, 
                            task.completed, 
                            weekStart 
                          ) 
                        } 
                       > 
                        {task.completed ? "☑" : "□"} 
                      </button> 
   
                      {editingId === task.id ? (
                        <div className="weekly-task-edit"> 
  
                          <input 
                            value={editText}
                            autoFocus 
                            onChange={(e) =>
                              setEditText(e.target.value) 
                            }
                            onKeyDown={async (e) => {
                              if (e.key === "Enter") { 
                                await updateWeeklyTaskTitle( 
                                  task.id,
                                  editText, 
                                  weekStart
                                ) 
                                setEditText("") 
                                setEditingId("")
                              } 
                            }} 
                          /> 
   
                          <button 
                            className="weekly-task-action" 
                            onClick={async () => {
                              await updateWeeklyTaskTitle( 
                                task.id, 
                                editText, 
                                weekStart 
                              ) 
                              setEditText("")
                              setEditingId("")
                            }} 
                          > 
                            保存
                          </button> 
   
                        </div> 
                      ) : ( 
                        <div className="weekly-task-content"> 
      
                          <p className="weekly-task-title"> 
                            {task.title} 
                          </p> 
   
                          <button 
                            className="weekly-task-action" 
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
                        className="weekly-task-delete" 
                        onClick={() => 
                          deleteWeeklyTask( 
                            task.id, 
                            weekStart 
                          ) 
                        }
                      > 
                        削除
                      </button>
  
                    </div>

                  </TaskItem> 
                )} 
 
              </div>
            </SortableContext> 
 
            <div className="weekly-task-add"> 
 
              {weekShowAdd ? ( 
                <div className="weekly-task-add-form"> 
 
                  <input 
                    className="weekly-task-add-input" 
                    value={addText} 
                    autoFocus 
                    placeholder="タスク名を入力..." 
                    onChange={(e) => 
                      setAddText(e.target.value) 
                    } 
                    onKeyDown={async (e) => { 
                      if (e.key === "Enter") { 
                        const text = addText
                        setAddText("") 
                        await addWeeklyRecord( 
                          text,
                          weekStart, 
                          weekEnd 
                        ) 
                        setWeekShowAdd(false)
                      } 
                    }} 
                  /> 
 
                  <button
                    className="weekly-task-add-button" 
                    onClick={async () => { 
                      const text = addText
                      setAddText("") 
                      await addWeeklyRecord( 
                        text,
                        weekStart, 
                        weekEnd 
                      ) 
                      setWeekShowAdd(false) 
                    }} 
                  > 
                    追加 
                  </button> 
 
                </div> 
              ) : ( 
                <div> 
 
                  <button 
                    className="weekly-add-task-button" 
                    onClick={() => setWeekShowAdd(true)} 
                  > 
                    新しいタスクを追加
                  </button> 
 
                </div> 
              )} 
 
            </div> 
 
          </section> 
        </DndContext> 
 
        <section className="weekly-section reflection-section"> 
 
          <div className="weekly-section-header"> 
            <h2>今週の振り返り</h2> 
          </div> 
 
          <textarea 
            className="weekly-reflection-input" 
            placeholder="今週の学習で気づいたこと、できたこと、改善したいこと..." 
            onBlur={() => { 
              updateWeeklyRecordReflection( 
                reflectionText, 
                weekStart 
              )  
            }} 
            value={reflectionText} 
            onChange={( 
              e: React.ChangeEvent<HTMLTextAreaElement> 
            ) => { 
              setReflectionText(e.target.value) 
            }} 
          />
 
        </section> 
 
        <DndContext 
          sensors={sensors} 
          onDragEnd={(event) => 
            handleDragEnd( 
              event, 
              nextWeekTasks, 
              "weekly_tasks", 
              setNextWeekTasks 
            ) 
          } 
        > 
          <section className="weekly-section next-week-section"> 
 
            <div className="weekly-section-header"> 
              <div> 
                <h2>来週の課題</h2> 
              </div> 
            </div> 
 
            <SortableContext
              items={nextWeekTasks} 
              strategy={verticalListSortingStrategy} 
            > 
              <div className="weekly-task-list"> 

                {nextWeekTasks.length === 0 && ( 
                  <p className="weekly-section-message"> 
                    タスクがありません
                  <br />
                  「新しいタスクを追加」から始められます。 
                  </p> 
                )}

                {nextWeekTasks.map(task => 
                  <TaskItem 
                    key={task.id} 
                    id={task.id} 
                  > 

                    <div className="weekly-task-row">
 
                      {editingId === task.id ? ( 
                        <div className="weekly-task-edit"> 
 
                          <input 
                            value={editText} 
                            autoFocus 
                            onChange={(e) => 
                              setEditText(e.target.value) 
                            } 
                            onKeyDown={async (e) => { 
                              if (e.key === "Enter") { 
                                await updateWeeklyTaskTitle( 
                                  task.id, 
                                  editText, 
                                  nextWeekStart 
                                ) 
                                setEditText("") 
                                setEditingId("") 
                              } 
                            }} 
                          /> 
   
                          <button 
                            className="weekly-task-action"
                            onClick={async () => { 
                              await updateWeeklyTaskTitle(
                                task.id, 
                                editText, 
                                nextWeekStart
                              ) 
                              setEditText("") 
                              setEditingId("")
                            }}
                          > 
                            保存
                          </button>
  
                        </div> 
                      ) : ( 
                        <div className="weekly-task-content"> 
   
                          <p className="weekly-task-title"> 
                            {task.title} 
                          </p> 
   
                          <button 
                            className="weekly-task-action" 
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
                        className="weekly-task-delete" 
                        onClick={() => 
                          deleteWeeklyTask( 
                            task.id, 
                            nextWeekStart 
                          ) 
                        } 
                      > 
                        削除 
                      </button> 
  
                      </div>
   
                  </TaskItem> 
                )} 
 
              </div> 
            </SortableContext> 
 
            <div className="weekly-task-add"> 
 
              {nextWeekShowAdd ? ( 
                <div className="weekly-task-add-form"> 
 
                  <input 
                    className="weekly-task-add-input" 
                    value={addText} 
                    autoFocus 
                    placeholder="タスク名を入力..." 
                    onChange={(e) => 
                      setAddText(e.target.value) 
                    } 
                    onKeyDown={async (e) => { 
                      if (e.key === "Enter") { 
                        const text = addText
                        setAddText("")
                        await addWeeklyRecord( 
                          text, 
                          nextWeekStart, 
                          nextWeekEnd 
                        )  
                        setNextWeekShowAdd(false)
                      } 
                    }} 
                  /> 
 
                  <button 
                    className="weekly-task-add-button"
                    onClick={async () => { 
                      const text = addText
                      setAddText("") 
                      await addWeeklyRecord( 
                        text, 
                        nextWeekStart, 
                        nextWeekEnd 
                      ) 
                      setNextWeekShowAdd(false) 
                    }} 
                  > 
                    追加 
                  </button> 
 
                </div> 
              ) : ( 
                
                <button 
                  className="weekly-add-task-button" 
                  onClick={() => setNextWeekShowAdd(true)} 
                > 
                  新しいタスクを追加 
                </button> 
              )} 
 
            </div> 
 
          </section> 
        </DndContext> 

        <section className="weekly-section last-week-section"> 
          <div className="weekly-section-header"> 
            <h2>先週の達成</h2> 
          </div>
 
          {lastWeekPlan ? ( 
            completedLastWeekTasks && 
            completedLastWeekTasks.length > 0 ? ( 
              <ul className="weekly-completed-task-list">
                {completedLastWeekTasks.map(task => ( 
                  <li key={task.id}> 
                    {task.title} 
                  </li> 
                ))} 
              </ul> 
            ) : ( 
              <p className="weekly-section-message"> 
                先週達成したタスクはありません 
              </p> 
            ) 
          ) : ( 
            <p className="weekly-section-message"> 
              先週のタスクはありません 
            </p> 
          )} 
        </section>
 
        <section className="weekly-section completed-daily-section"> 
 
          <div className="weekly-section-header"> 
            <div> 
              <h2>今週達成したデイリータスク</h2> 
            </div> 
          </div> 
 
          {completedThisWeekDailyPlans.length > 0 ? ( 
            <div className="completed-daily-list"> 
 
              {completedThisWeekDailyPlans.map((task, index) => { 
                const [, month, day] = task.date.split("-")
                const displayDate = `${Number(month)}/${Number(day)}` 
                const prevDate = 
                  index > 0 
                    ? completedThisWeekDailyPlans[index - 1].date 
                    : null 
 
                return ( 
                  <div 
                    className="completed-daily-group" 
                    key={task.id} 
                  > 
                    {task.date !== prevDate && ( 
                      <p className="completed-daily-date"> 
                        {displayDate} 
                      </p> 
                    )} 
 
                    <p className="completed-daily-task"> 
                      ✓ {task.title} 
                    </p> 
                  </div> 
                ) 
              })} 
 
            </div> 
          ) : ( 
            <p className="weekly-section-message"> 
              今週達成したタスクはありません 
            </p> 
          )} 
 
        </section> 
 
      </main> 
    </div> 
  ) 
} 