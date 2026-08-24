import { supabase } from "../lib/supabase"


export async function getWeeklyPlanByDateInDB(startDate: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from("weekly_plans")
      .select()
      .eq("user_id", userId)
      .eq("week_start", startDate)
      .maybeSingle()
    
    if (error) throw error

    return data
  } catch(e) {
    throw e
  }
}

export async function createdFirstWeeklyTaskInDB(
  startDate: string, 
  endDate: string, 
  text: string, 
  orderIndex: number,
  userId: string
) {
  try {
    const { data: planData, error: planError } = await supabase
      .from("weekly_plans")
      .insert({
        user_id: userId,
        week_start: startDate,
        week_end: endDate,
        reflection: ""
      })
      .select().single()

    if (planError) throw planError

    const { data: taskData, error: taskError } = await supabase
      .from("weekly_tasks")
      .insert({
        user_id: userId,
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

export async function addWeeklyTaskInDB(text: string, orderIndex: number, userId: string, planId: string) {
  try {

    const { data: taskData, error: taskError } = await supabase
      .from("weekly_tasks")
      .insert({
        user_id: userId,
        plan_id: planId,
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

export async function updateWeeklyTaskTitleInDB(id: string, text: string, userId: string) {
  try {
    const { error } = await supabase
        .from("weekly_tasks")
        .update({
          text: text
        })
        .eq("user_id", userId)
        .eq("id", id)

      if (error) throw error
  } catch(e) {
    throw(e)
  }
}

export async function updateWeeklyTaskToggleInDB(id: string, completed: boolean, userId: string) {
  try {
    const { error } = await supabase
      .from("weekly_tasks")
      .update({
        completed: !completed
      })
      .eq("user_id", userId)
      .eq("id", id)

    if (error) throw error
  } catch(e) {
    throw(e)
  }
}

export async function updateWeeklyReflectionInDB(text: string, date: string, userId: string) {
  try {
    const { error } = await supabase
      .from("weekly_plans")
      .update({
        reflection: text
      })
      .eq("user_id", userId)
      .eq("week_start", date)
    
    if (error) throw error
  } catch(e) {
    throw e
  }
}

export async function daleteWeeklyTaskInDB(id: string, userId: string) {
  try {
    const { error } = await supabase
      .from("weekly_tasks")
      .delete()
      .eq("user_id", userId)
      .eq("id", id)
    
    if (error) throw error
  } catch(e) {
    throw(e)
  }
}

export async function getWeeklyRecords(
  currentWeekStart: string,
  previousWeekStart: string,
  nextWeekStart: string,
  userId: string
) {
  try {  
    const { data: plansData, error: plansError } = await supabase
      .from("weekly_plans")
      .select()
      .eq("user_id", userId)
      .in("week_start", [currentWeekStart, previousWeekStart, nextWeekStart])
    
    if (plansError) throw plansError
    const planIds = (plansData ?? []).map(plan => plan.id)
    
    const { data: tasksData, error: tasksError } = await supabase
      .from("weekly_tasks")
      .select()
      .eq("user_id", userId)
      .in("plan_id", planIds)
    
    if (tasksError) throw tasksError
    return { plansData, tasksData}

  } catch(e) {
    throw e
  }
}