import { supabase } from "../lib/supabase"
import type { BaseTask } from "../types/baseTask"
import type { DragEndEvent } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"

const updateTaskOrder = async <T extends BaseTask>(activeId: string, overId: string, 
  tasks: T[], tableName: string) => {
  try {
    if (tasks.length === 0) return

    const oldIndex = tasks.findIndex(task => task.id === activeId)
    const newIndex = tasks.findIndex(task => task.id === overId)

    const newTasks = arrayMove(tasks, oldIndex, newIndex)

    for (const [index, task] of newTasks.entries()) {
      await supabase
        .from(tableName)
        .update({
          order_index: index
        })
        .eq("id", task.id)
    }

  } catch(e) {
    console.error(e)
  }
}

export default function handleDragEnd <T extends BaseTask>(event: DragEndEvent, tasks: T[], 
  tableName: string, setTasks: React.Dispatch<React.SetStateAction<T[]>>) {
  const { active, over } = event

  if (!over || active.id === over.id) return 

  setTasks(tasks => {
    const oldIndex = tasks.findIndex(task => task.id === active.id)
    const newIndex = tasks.findIndex(task => task.id === over.id)

    return arrayMove(tasks, oldIndex, newIndex)
  })
  updateTaskOrder(
    active.id as string,
    over.id as string,
    tasks,
    tableName
  )
}