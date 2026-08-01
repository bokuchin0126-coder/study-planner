import { supabase } from "../lib/supabase"
import getCurrentUser from "../lib/auth"
import type { DailyTaskRow } from "../types/daily"

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

    const { error } = await supabase
      .from("daily_tasks")
      .update({
        completed: !completed
      })
      .eq("user_id", user.id)
      .eq("id", id)

    if (error) throw error
  } catch(e) {
    throw(e)
  }
}

export async function deleteDailyCopyTaskInDB(taskDateId: string) {
  try {
    const user = await getCurrentUser()

    const { data, error } = await supabase
      .from("daily_tasks")
      .delete()
      .eq("user_id", user.id)
      .eq("source_task_id", taskDateId)
      .select()

    if (error) throw error

    return data
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
  carryTasks: DailyTaskRow,
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

    const { data: existsTasks } = await supabase
      .from("daily_tasks")
      .select("id")
      .eq("plan_id", planData.id)
      .eq("source_task_id", carryTasks.id)
      .maybeSingle()


    if (existsTasks) return null

    const { data: taskData, error: taskError } = await supabase
      .from("daily_tasks")
      .insert({
        user_id: user.id,
        plan_id: planData.id,
        text: carryTasks.text,
        source_task_id: carryTasks.id,
        order_index: orderIndex
      })
      .select()
      .single()

    if (taskError) throw taskError

    return taskData

  } catch (e) {
    throw e
  }
}

export async function getDailyRecords(today: string, tomorrow: string, yesterday: string) {
  try {
    const user = await getCurrentUser()

    const { data: planData, error: planError } = await supabase
      .from("daily_plans")
      .select()
      .eq("user_id", user.id)
      .in("date", [today, tomorrow, yesterday])

    if (planError) throw planError
    const planIds = (planData ?? []).map(plan => plan.id)

    const { data: tasksData, error: tasksError } = await supabase
      .from("daily_tasks")
      .select()
      .eq("user_id", user.id)
      .in("plan_id", planIds)

    if (tasksError) throw tasksError
    return {planData, tasksData}
  } catch(e) {
    throw e
  }
}

export async function activateCarryOverTasks(date: string) {
  try {
    const user = await getCurrentUser()

    const { data: planData, error: planError } = await supabase
      .from("daily_plans")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", date)
      .maybeSingle()

    if (planError) throw planError

    if (!planData) return
    
    const { error } = await supabase
      .from("daily_tasks")
      .update({
        source_task_id: null
      })
      .eq("user_id", user.id)
      .eq("plan_id", planData.id)
      .not("source_task_id", "is", null)

    if (error) throw error
  } catch(e) {
    throw e
  }
}