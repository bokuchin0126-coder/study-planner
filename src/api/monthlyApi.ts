import { getCurrentUser } from "./authApi"
import { supabase } from "../lib/supabase"


export async function createdFirstMonthlyTaskInDB(startDate: string, endDate: string, text: string, orderIndex: number) {
  try {
    const user = await getCurrentUser()

    const { data: planData, error: planError } = await supabase
      .from("monthly_plans")
      .insert({
        user_id: user.id,
        month_start: startDate,
        month_end: endDate,
        reflection: ""
      })
      .select().single()

    if (planError) throw planError

    const { data: taskData, error: taskError } = await supabase
      .from("monthly_tasks")
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

export async function addMonthlyTaskInDB(startDate: string, text: string, orderIndex: number) {
  try {
    const user = await getCurrentUser()

    const { data: planData, error: planError } = await supabase
      .from("monthly_plans")
      .select()
      .eq("user_id", user.id)
      .eq("month_start", startDate)
      .single()
    
    if (planError) throw planError
    
    const { data: taskData, error: taskError } = await supabase
      .from("monthly_tasks")
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

export async function updateMonthlyTaskTitleInDB(id: string, text: string) {
  try {
    const user = await getCurrentUser()

    const { error } = await supabase
        .from("monthly_tasks")
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

export async function updateMonthlyTaskToggleInDB(id: string, completed: boolean) {
  try {
    const user = await getCurrentUser()

    const { error } = await supabase
      .from("monthly_tasks")
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

export async function updateMonthlyReflectionInDB(text: string, date: string) {
  try {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from("monthly_plans")
      .update({
        reflection: text
      })
      .eq("user_id", user.id)
      .eq("month_start", date)
    
    if (error) throw error
  } catch(e) {
    throw e
  }
}

export async function deleteMonthlyTaskInDB(id: string) {
  try {
    const user = await getCurrentUser()

    const { error } = await supabase
      .from("monthly_tasks")
      .delete()
      .eq("user_id", user.id)
      .eq("id", id)
    
    if (error) throw error
  } catch(e) {
    throw(e)
  }
}

export async function getMonthlyRecords(
  currentMonthStart: string,
  previousMonthStart: string,
  nextMonthStart: string
) {
  try {
    const user = await getCurrentUser()
    
    const { data: plansData, error: plansError } = await supabase
      .from("monthly_plans")
      .select()
      .eq("user_id", user.id)
      .in("month_start", [currentMonthStart, previousMonthStart, nextMonthStart])
    
    if (plansError) throw plansError
    const planIds = (plansData ?? []).map(plan => plan.id)
    
    const { data: tasksData, error: tasksError } = await supabase
      .from("monthly_tasks")
      .select()
      .eq("user_id", user.id)
      .in("plan_id", planIds)
    
    if (tasksError) throw tasksError
    return { plansData, tasksData}

  } catch(e) {
    throw e
  }
}