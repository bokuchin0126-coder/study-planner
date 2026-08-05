import getCurrentUser from "../lib/auth"
import { supabase } from "../lib/supabase"


export async function createdFirstWeeklyTaskInDB(startDate: string, endDate: string, text: string, orderIndex: number) {
  try {
    const user = await getCurrentUser()

    const { data: planData, error: planError } = await supabase
      .from("weekly_plans")
      .insert({
        user_id: user.id,
        week_start: startDate,
        week_end: endDate,
        reflection: ""
      })
      .select().single()

    if (planError) throw planError

    const { data: taskData, error: taskError } = await supabase
      .from("weekly_tasks")
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
    throw e
  }
}

export async function addWeeklyTaskInDB(startDate: string, text: string, orderIndex: number) {
  try {
    const user = await getCurrentUser()

    const { data: planData, error: planError } = await supabase
      .from("weekly_plans")
      .select()
      .eq("user_id", user.id)
      .eq("week_start", startDate)
      .single()
    
    if (planError) throw planError
    
    const { data: taskData, error: taskError } = await supabase
      .from("weekly_tasks")
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
    throw e
  }
}

export async function updateWeeklyTaskTitleInDB(id: string, text: string) {
  try {
    const user = await getCurrentUser()

    const { error } = await supabase
        .from("weekly_tasks")
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

export async function updateWeeklyTaskToggleInDB(id: string, completed: boolean) {
  try {
    const user = await getCurrentUser()

    const { error } = await supabase
      .from("weekly_tasks")
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

export async function updateWeeklyReflectionInDB(text: string, date: string) {
  try {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from("weekly_plans")
      .update({
        reflection: text
      })
      .eq("user_id", user.id)
      .eq("week_start", date)
    
    if (error) throw error
  } catch(e) {
    throw e
  }
}

export async function daleteWeeklyTaskInDB(id: string) {
  try {
    const user = await getCurrentUser()

    const { error } = await supabase
      .from("weekly_tasks")
      .delete()
      .eq("user_id", user.id)
      .eq("id", id)
    
    if (error) throw error
  } catch(e) {
    throw(e)
  }
}

export async function getWeeklyRecords(
  currentWeekStart: string,
  previousWeekStart: string,
  nextWeekStart: string
) {
  try {
    const user = await getCurrentUser()
    
    const { data: plansData, error: plansError } = await supabase
      .from("weekly_plans")
      .select()
      .eq("user_id", user.id)
      .in("week_start", [currentWeekStart, previousWeekStart, nextWeekStart])
    
    if (plansError) throw plansError
    const planIds = (plansData ?? []).map(plan => plan.id)
    
    const { data: tasksData, error: tasksError } = await supabase
      .from("weekly_tasks")
      .select()
      .eq("user_id", user.id)
      .in("plan_id", planIds)
    
    if (tasksError) throw tasksError
    return { plansData, tasksData}

  } catch(e) {
    throw e
  }
}