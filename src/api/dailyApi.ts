import { supabase } from "../lib/supabase"
import getCurrentUser from "../lib/auth"
import type { Task } from "../types/baseTask"

export async function createFirstDailyTaskInDB(text: string, date: string, orderIndex: number) {
  try {
    const user = await getCurrentUser()

    const { data: planData, error: planError } = await supabase
      .from("daily_plans")
      .insert({
        user_id: user.id,
        date: date,
        reflection: ""
      })
      .select().single()

    if (planError) throw planError
        
    const { data: taskData, error: taskError } = await supabase
      .from("daily_tasks")
      .insert({
        user_id: user.id,
        plan_id: planData.id,
        text: text,
        order_index: orderIndex
      })
      .select().single()

    if (taskError) throw taskError

    return taskData
  } catch(e) {
    throw(e)
  }
}

export async function addDailyTaskInDB(text: string, date: string, orderIndex: number) {
  try {
    const user = await getCurrentUser()

    const { data: planData, error: planError } = await supabase
      .from("daily_plans")
      .select()
      .eq("user_id", user.id)
      .eq("date", date)
      .single()

    if (planError) throw planError
        
    const { data: taskData, error: taskError } = await supabase
      .from("daily_tasks")
      .insert({
        user_id: user.id,
        plan_id: planData.id,
        text: text,
        order_index: orderIndex
      })
      .select().single()
        
    if (taskError) throw taskError

    return taskData
  } catch(e) {
    throw(e)
  }
}

export async function updateDailyTaskTitleInDB(id: string, text: string) {
  try {
    const user = await getCurrentUser()

    const { error } = await supabase
        .from("daily_tasks")
        .update({
          text: text
        })
        .eq("user_id", user.id)
        .eq("id", id)

      if (error) throw error
  } catch(e) {
    throw(e)
  }
}

export async function updateDailyTaskToggleInDB(id: string, completed: boolean) {
  try {
    const user = await getCurrentUser()

    const { data: taskData, error: taskError } = await supabase
      .from("daily_tasks")
      .update({
        completed: !completed
      })
      .eq("user_id", user.id)
      .eq("id", id)
      .select().single()

    if (taskError) throw taskError

    return taskData
  } catch(e) {
    throw(e)
  }
}

export async function deleteDailyCopyTaskInDB(taskDateId: string) {
  try {
    const user = await getCurrentUser()

    const { data: deleteTask, error: deleteError } = await supabase
      .from("daily_tasks")
      .delete()
      .eq("user_id", user.id)
      .eq("source_task_id", taskDateId)
      .select()

    if (deleteError) throw deleteError

    return deleteTask
  } catch(e) {
    throw(e)
  }
}

export async function daleteDailyTaskInDB(id: string) {
  try {
    const user = await getCurrentUser()

    const { error } = await supabase
      .from("daily_tasks")
      .delete()
      .eq("user_id", user.id)
      .eq("id", id)
    
    if (error) throw error
  } catch(e) {
    throw(e)
  }
}

export async function updateDailyRecordReflectionInDB(text: string, date: string) {
  try {
    const user = await getCurrentUser()

    const { error } = await supabase
      .from("daily_plans")
      .update({
        reflection: text
      })
      .eq("user_id", user.id)
      .eq("date", date)

    if (error) throw error
  } catch(e) {
    throw(e)
  }
}

export async function carryOverDailyTasksInDB(
  carryTasks: Task[],
  tomorrowDate: string,
  orderIndex: number
) {
  try {
    const user = await getCurrentUser()

    let { data: planData, error: planError } = await supabase
      .from("daily_plans")
      .select()
      .eq("user_id", user.id)
      .eq("date", tomorrowDate)
      .maybeSingle()

    if (planError) throw planError

    if (!planData) {
      const { data, error } = await supabase
        .from("daily_plans")
        .insert({
          user_id: user.id,
          date: tomorrowDate,
          reflection: ""
        })
        .select()
        .single()

      if (error) throw error

      planData = data
    }

    const { data: existsTasks, error: existsError } = await supabase
      .from("daily_tasks")
      .select("source_task_id")
      .eq("plan_id", planData.id)

    if (existsError) throw existsError

    const filteredTasks = carryTasks.filter(task =>
      !existsTasks.some(
        copied => copied.source_task_id === task.id
      )
    )

    if (filteredTasks.length === 0) return []

    const insertTasks = filteredTasks.map(task => ({
      user_id: user.id,
      plan_id: planData.id,
      text: task.title,
      source_task_id: task.id,
      order_index: orderIndex
    }))

    const { data: taskData, error: taskError } = await supabase
      .from("daily_tasks")
      .insert(insertTasks)
      .select()

    if (taskError) throw taskError

    return taskData

  } catch (e) {
    console.error(e)
    throw e
  }
}