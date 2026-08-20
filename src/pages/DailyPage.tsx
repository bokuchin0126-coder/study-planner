import useDaily from "../hooks/useDaily" 
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
  const [isTyping, setIsTyping] = useState<boolean>(false) 
 
  const completedYesterdayTasks = yesterdayPlan?.tasks.filter(task => task.completed) 
 
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
          <section className="daily-section today-section">
 
            <div className="section-header">
              <div>
                <h2>今日の課題</h2>
                <p className="section-description"> 
                  今日取り組むタスク 
                </p> 
              </div> 
            </div> 

            {todayPlan ? ( 
              <SortableContext 
                items={todayTasks} 
                strategy={verticalListSortingStrategy} 
              > 
                <div className="task-list"> 
                  {todayTasks.map(task => 
                    <TaskItem 
                      key={task.id} 
                      id={task.id} 
                    > 
                      <button  
                        className="task-toggle" 
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
                        <div className="task-edit"> 
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
                            className="task-action"
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
                        onClick={async () => { 
                          await deleteDailyTask(task.id, today) 
                        }} 
                      > 
                        削除 
                      </button> 
                    </TaskItem> 
                  )} 
                </div> 
              </SortableContext> 
            ) : ( 
              <p className="section-message"> 
                タスクを追加してください 
              </p> 
            )} 
 
            <div className="task-add"> 
              {todayShowAdd ? ( 
                <div className="task-add-form"> 
                  <input 
                    className="task-add-input"
                    placeholder="タスク名を入力..." 
                    autoFocus 
                    value={addText} 
                    onChange={(e) => setAddText(e.target.value)} 
                    onKeyDown={async (e) => { 
                      if (e.key === "Enter") { 
                        const task = await addDailyRecord(addText, today) 
                        await carryOverRecords(task) 
                        setAddText("") 
                        setTodayShowAdd(false) 
                      }
                    }} 
                  /> 
 
                  <button 
                    className="task-add-button" 
                    onClick={async () => { 
                      const task = await addDailyRecord(addText, today)
                      await carryOverRecords(task) 
                      setAddText("") 
                      setTodayShowAdd(false) 
                    }}
                  > 
                    追加 
                  </button> 
                </div>
              ) : ( 
                <button  
                  className="add-task-button" 
                  onClick={() => setTodayShowAdd(true)} 
                > 
                  新しいタスクを追加 
                </button> 
              )} 
            </div>
 
            <p className="carryover-note">
              ※達成されなかったタスクは自動で明日に引き継がれます 
            </p> 
 
          </section> 
        </DndContext> 
 
        <section className="daily-section reflection-section"> 
          <div className="section-header"> 
            <h2>今日の振り返り</h2> 
          </div> 
 
          <textarea 
            className="reflection-input" 
            placeholder="今日の学習で気づいたこと、できたこと、改善したいこと..." 
            onBlur={() => { 
              updateDailyRecordReflection(reflectionText, today) 
              setIsTyping(false) 
            }} 
            value={reflectionText} 
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { 
              setReflectionText(e.target.value) 
              setIsTyping(true)
            }} 
          />
 
          <p className="reflection-status"> 
            {isTyping ? "入力中..." : "保存済み ✓"} 
          </p> 
        </section> 

        <section className="daily-section yesterday-section"> 
          <div className="section-header"> 
            <h2>昨日の達成</h2> 
          </div> 
 
          {yesterdayPlan ? ( 
            completedYesterdayTasks && completedYesterdayTasks.length > 0 ? ( 
              <ul className="completed-task-list"> 
                {completedYesterdayTasks.map(task => ( 
                  <li key={task.id}> 
                    {task.title} 
                  </li> 
                ))} 
              </ul> 
            ) : ( 
              <p className="section-message"> 
                昨日達成したタスクはありません 
              </p> 
            ) 
          ) : ( 
            <p className="section-message"> 
              昨日のタスクはありません 
            </p> 
          )} 
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
          <section className="daily-section tomorrow-section"> 

            <div className="section-header"> 
              <div>
                <h2>明日の課題</h2> 
                <p className="section-description"> 
                  明日取り組むタスクを準備しておきましょう 
                </p> 
              </div> 
            </div> 
 
            {tomorrowPlan ? (
              <SortableContext 
                items={tomorrowTasks} 
                strategy={verticalListSortingStrategy} 
              > 
                <div className="task-list"> 
                  {tomorrowTasks.map(task => 
                    <TaskItem 
                      key={task.id} 
                      id={task.id} 
                    > 
 
                      {editingId === task.id ? ( 
                        <div className="task-edit"> 
 
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
                            className="task-action"
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
                        onClick={() => { 
                          deleteDailyTask(task.id, tomorrowDate) 
                        }} 
                      > 
                        削除 
                      </button> 

                    </TaskItem> 
                  )} 
                </div> 
              </SortableContext> 
            ) : ( 
              <p className="section-message"> 
                タスクを追加してください 
              </p> 
            )} 
 
            <div className="task-add">
              {tomorrowShowAdd ? ( 
                <div className="task-add-form"> 
                  <input
                    className="task-add-input" 
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
                    className="task-add-button"
                    onClick={async () => { 
                      await addDailyRecord(addText, tomorrowDate) 
                      setAddText("") 
                      setTomorrowShowAdd(false)
                    }} 
                  > 
                    追加 
                  </button> 
                </div> 
              ) : ( 
                <button  
                  className="add-task-button" 
                  onClick={() => setTomorrowShowAdd(true)} 
                > 
                  新しいタスクを追加 
                </button> 
              )} 
            </div> 
 
          </section> 
        </DndContext> 
 
      </main> 
    </div> 
  ) 
} 