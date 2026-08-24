import { supabase } from "../lib/supabase"


export async function getMonthlyPlanByDateInDB(startDate: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from("monthly_plans")
      .select("id")
      .eq("user_id", userId)
      .eq("month_start", startDate)
      .maybeSingle()
    
    if (error) throw error

    return data?.id ?? null
  } catch(e) {
    throw e
  }
}

export async function createdFirstMonthlyTaskInDB(
  startDate: string, 
  endDate: string, 
  text: string, 
  orderIndex: number,
  userId: string
) {
  try {
    const { data: planData, error: planError } = await supabase
      .from("monthly_plans")
      .insert({
        user_id: userId,
        month_start: startDate,
        month_end: endDate,
        reflection: ""
      })
      .select().single()

    if (planError) throw planError

    const { data: taskData, error: taskError } = await supabase
      .from("monthly_tasks")
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

export async function addMonthlyTaskInDB(text: string, orderIndex: number, planId: string, userId: string) {
  try {
    const { data: taskData, error: taskError } = await supabase
      .from("monthly_tasks")
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

export async function updateMonthlyTaskTitleInDB(id: string, text: string, userId: string) {
  try {
    const { error } = await supabase
        .from("monthly_tasks")
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

export async function updateMonthlyTaskToggleInDB(id: string, completed: boolean, userId: string) {
  try {
    const { error } = await supabase
      .from("monthly_tasks")
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

export async function updateMonthlyReflectionInDB(text: string, date: string, userId: string) {
  try {
    const { error } = await supabase
      .from("monthly_plans")
      .update({
        reflection: text
      })
      .eq("user_id", userId)
      .eq("month_start", date)
    
    if (error) throw error
  } catch(e) {
    throw e
  }
}

export async function deleteMonthlyTaskInDB(id: string, userId: string) {
  try {
    const { error } = await supabase
      .from("monthly_tasks")
      .delete()
      .eq("user_id", userId)
      .eq("id", id)
    
    if (error) throw error
  } catch(e) {
    throw(e)
  }
}

export async function getMonthlyRecords(
  currentMonthStart: string,
  previousMonthStart: string,
  nextMonthStart: string,
  userId: string
) {
  try {  
    const { data: plansData, error: plansError } = await supabase
      .from("monthly_plans")
      .select()
      .eq("user_id", userId)
      .in("month_start", [currentMonthStart, previousMonthStart, nextMonthStart])
    
    if (plansError) throw plansError
    const planIds = (plansData ?? []).map(plan => plan.id)
    
    const { data: tasksData, error: tasksError } = await supabase
      .from("monthly_tasks")
      .select()
      .eq("user_id", userId)
      .in("plan_id", planIds)
    
    if (tasksError) throw tasksError
    return { plansData, tasksData}

  } catch(e) {
    throw e
  }
}