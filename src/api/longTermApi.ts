import { supabase } from "../lib/supabase"


export async function addLongTermTaskInDB(id: string, text: string, orderIndex: number, userId: string) {
  try {
    const { data: taskData, error: taskError } = await supabase
      .from("long_term_tasks")
      .insert({
        user_id: userId,
        text: text,
        plan_id: id,
        order_index: orderIndex
      })
      .select().single()

    if (taskError) throw taskError
    return taskData

  } catch(e) {
    throw e
  }
}

export async function updateLongTermGoalInDB(text: string, id: string, userId: string) {
  try {
    const { error } = await supabase
      .from("long_term_plans")
      .update({
        goal: text
      })
      .eq("user_id", userId)
      .eq("id", id)
    
    if (error) throw error
  } catch(e) {
    throw e
  }
}

export async function updateLongTermEndDateInDB(date: string, id: string, userId: string) {
  try {    
    const { error } = await supabase
      .from("long_term_plans")
      .update({
        end_date: date
      })
      .eq("user_id", userId)
      .eq("id", id)

    if (error) throw error
  } catch(e) {
    throw e
  }
}

export async function updateLongTermStartDateInDB(date: string, id: string, userId: string) {
  try {
    const { error } = await supabase
      .from("long_term_plans")
      .update({
        start_date: date
      })
      .eq("user_id", userId)
      .eq("id", id)

    if (error) throw error
  } catch(e) {
    throw e
  }
}

export async function updateLongTermReflectionInDB(text: string, id: string, userId: string) {
  try {
    const { error } = await supabase
      .from("long_term_plans")
      .update({
        reflection: text
      })
      .eq("user_id", userId)
      .eq("id", id)

    if (error) throw error

  } catch(e) {
    throw e
  }
}

export async function updateLongTermToggleInDB(completed: boolean, id: string, userId: string) {
  try {
    const { error } = await supabase
      .from("long_term_plans")
      .update({
        completed: !completed
      })
      .eq("user_id", userId)
      .eq("id", id)

    if (error) throw error
  } catch(e) {
    throw e
  }
}

export async function updateLongTermTaskTitleInDB(text: string, id: string, userId: string) {
  try {
    const { error } = await supabase
      .from("long_term_tasks")
      .update({
        text: text
      })
      .eq("user_id", userId)
      .eq("id", id)

    if (error) throw error
  } catch(e) {
    throw e
  }
}

export async function updateLongTermTaskToggleInDB(completed: boolean, id: string, userId: string) {
  try {
    const { error } = await supabase
      .from("long_term_tasks")
      .update({
        completed: !completed
      })
      .eq("user_id", userId)
      .eq("id", id)

    if (error) throw error

  } catch(e) {
    throw e
  }
}

export async function deleteLongTermTaskInDB(id: string, userId: string) {
  try {
    const { error } = await supabase
      .from("long_term_tasks")
      .delete()
      .eq("user_id", userId)
      .eq("id", id)

    if (error) throw error

  } catch(e) {
    throw e
  }
}

export async function getCurrentLongTermPlanInDB(userId: string) {
  try {
    const { data: currentPlan, error: currentPlanError } = await supabase
      .from("long_term_plans")
      .select()
      .eq("user_id", userId)
      .eq("completed", false)
      .maybeSingle()
    
    if (currentPlanError) throw currentPlanError

    if (!currentPlan) {
      return {
        currentPlan: null,
        tasksData: []
      }
    }
    
    const { data: tasksData, error: tasksError } = await supabase
      .from("long_term_tasks")
      .select()
      .eq("user_id", userId)
      .eq("plan_id", currentPlan.id)
    
    if (tasksError) throw tasksError

    return { currentPlan, tasksData }

  } catch(e) {
    throw e
  }
}

export async function createInitialLongTermPlanInDB(today: string, end: string, userId: string) {
  try {
    const { data, error} = await supabase
      .from("long_term_plans")
      .insert({
        user_id: userId,
        start_date: today,
        end_date: end,
        reflection: "",
        goal: ""
      })
      .select().single()

    if (error) throw error
    return data
  } catch(e) {
    throw e
  }
}

export async function getMonthlyPlansInLongTerm(startPeriod: string, endPeriod: string, userId: string) {
  try {
    const { data: plansData, error: plansError } = await supabase
      .from("monthly_plans")
      .select()
      .eq("user_id", userId)
      .gte("month_start", startPeriod)
      .lte("month_end", endPeriod)

    if (plansError) throw plansError

    if (plansData.length === 0) {
      return {
        plansData: [],
        tasksData: []
      }
    } 
    const planIds = plansData.map(plan => plan.id)

    const { data: tasksData, error: tasksError } = await supabase
      .from("monthly_tasks")
      .select()
      .eq("user_id", userId)
      .in("plan_id", planIds)

    if (tasksError) throw tasksError
    return { plansData, tasksData } 

  } catch(e) {
    throw e
  }
}