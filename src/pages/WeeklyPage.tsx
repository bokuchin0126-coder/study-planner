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
  const [isTyping, setIsTyping] = useState<boolean>(false)
 
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
 
  const completedThisWeekDailyPlans = thisWeekDailyPlans.flatMap( 
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
 
        <header className="weekly-header"> 
          <p className="weekly-date"> 
            {weekStart} ～ {weekEnd} 
          </p> 
          <h1 className="weekly-title"> 
            今週の学習 
          </h1> 
        </header>
 
        <section className="weekly-section last-week-section"> 
          <div className="section-header"> 
            <h2>先週の達成</h2> 
          </div>
 
          {lastWeekPlan ? ( 
            completedLastWeekTasks && 
            completedLastWeekTasks.length > 0 ? ( 
              <ul className="completed-task-list">
                {completedLastWeekTasks.map(task => ( 
                  <li key={task.id}> 
                    {task.title} 
                  </li> 
                ))} 
              </ul> 
            ) : ( 
              <p className="section-message"> 
                先週達成したタスクはありません 
              </p> 
            ) 
          ) : ( 
            <p className="section-message"> 
              先週のタスクはありません 
            </p> 
          )} 
        </section> 
 
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
 
            <div className="section-header"> 
              <div> 
                <h2>今週の課題</h2> 
                <p className="section-description"> 
                  今週取り組むタスク 
                </p> 
              </div> 
            </div> 
 
            <SortableContext 
              items={weekTasks} 
              strategy={verticalListSortingStrategy} 
            >
              <div className="task-list">
 
                {weekTasks.map(task =>
                  <TaskItem 
                    key={task.id} 
                    id={task.id} 
                  > 
 
                    <button 
                      className="task-toggle" 
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
                      <div className="task-edit"> 

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
                          className="task-action" 
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
                        deleteWeeklyTask( 
                          task.id, 
                          weekStart 
                        ) 
                      }
                    > 
                      削除
                    </button>

                  </TaskItem> 
                )} 
 
              </div>
            </SortableContext> 
 
            <div className="task-add"> 
 
              {weekShowAdd ? ( 
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
                        await addWeeklyRecord( 
                          addText,
                          weekStart, 
                          weekEnd 
                        ) 
                        setAddText("") 
                        setWeekShowAdd(false)
                      } 
                    }} 
                  /> 
 
                  <button
                    className="task-add-button" 
                    onClick={async () => { 
                      await addWeeklyRecord( 
                        addText,
                        weekStart, 
                        weekEnd 
                      ) 
                      setAddText("") 
                      setWeekShowAdd(false) 
                    }} 
                  > 
                    追加 
                  </button> 
 
                </div> 
              ) : ( 
                <div> 
 
                  {!weekPlan && ( 
                    <p className="section-message"> 
                      タスクを追加してください 
                    </p> 
                  )} 
 
                  <button 
                    className="add-task-button" 
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
 
          <div className="section-header"> 
            <h2>今週の振り返り</h2> 
          </div> 
 
          <textarea 
            className="reflection-input" 
            placeholder="今週の学習で気づいたこと、できたこと、改善したいこと..." 
            onBlur={() => { 
              updateWeeklyRecordReflection( 
                reflectionText, 
                weekStart 
              ) 
              setIsTyping(false) 
            }} 
            value={reflectionText} 
            onChange={( 
              e: React.ChangeEvent<HTMLTextAreaElement> 
            ) => { 
              setReflectionText(e.target.value) 
              setIsTyping(true) 
            }} 
          /> 
 
          <p className="reflection-status"> 
            {isTyping ? "入力中..." : "保存済み ✓"} 
          </p> 
 
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
 
            <div className="section-header"> 
              <div> 
                <h2>来週の課題</h2> 
                <p className="section-description"> 
                  来週取り組むタスクを準備しておきましょう 
                </p> 
              </div> 
            </div> 
 
            <SortableContext
              items={nextWeekTasks} 
              strategy={verticalListSortingStrategy} 
            > 
              <div className="task-list"> 
 
                {nextWeekTasks.map(task => 
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
                          className="task-action"
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
                        deleteWeeklyTask( 
                          task.id, 
                          nextWeekStart 
                        ) 
                      } 
                    > 
                      削除 
                    </button> 
 
                  </TaskItem> 
                )} 
 
              </div> 
            </SortableContext> 
 
            <div className="task-add"> 
 
              {nextWeekShowAdd ? ( 
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
                        await addWeeklyRecord( 
                          addText, 
                          nextWeekStart, 
                          nextWeekEnd 
                        ) 
                        setAddText("") 
                        setNextWeekShowAdd(false)
                      } 
                    }} 
                  /> 
 
                  <button 
                    className="task-add-button"
                    onClick={async () => { 
                      await addWeeklyRecord( 
                        addText, 
                        nextWeekStart, 
                        nextWeekEnd 
                      ) 
                      setAddText("") 
                      setNextWeekShowAdd(false) 
                    }} 
                  > 
                    追加 
                  </button> 
 
                </div> 
              ) : ( 
                <button 
                  className="add-task-button" 
                  onClick={() => setNextWeekShowAdd(true)} 
                > 
                  新しいタスクを追加 
                </button> 
              )} 
 
            </div> 
 
          </section> 
        </DndContext> 
 
        <section className="weekly-section completed-daily-section"> 
 
          <div className="section-header"> 
            <div> 
              <h2>今週達成したデイリータスク</h2> 
              <p className="section-description"> 
                今週のDailyページで達成したタスク 
              </p> 
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
            <p className="section-message"> 
              今週達成したタスクはありません 
            </p> 
          )} 
 
        </section> 
 
      </main> 
    </div> 
  ) 
} 