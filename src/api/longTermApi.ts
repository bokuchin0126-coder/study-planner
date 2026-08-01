import { supabase } from "../lib/supabase"
import getCurrentUser from "../lib/auth"


export async function addLongTermTaskInDB(id: string, text: string, orderIndex: number) {
  try {
    const user = await getCurrentUser()

    const { data: planData, error: planError } = await supabase
        .from("long_term_plans")
        .select()
        .eq("user_id", user.id)
        .eq("id", id)
        .single()

    if (planError) throw planError

    const { data: taskData, error: taskError } = await supabase
      .from("long_term_tasks")
      .insert({
        user_id: user.id,
        text: text,
        plan_id: planData.id,
        order_index: orderIndex
      })
      .select().single()

    if (taskError) throw taskError
    return taskData

  } catch(e) {
    throw e
  }
}

export async function updateLongTermGoalInDB(text: string, id: string) {
  try {
    const user = await getCurrentUser()

    const { error } = await supabase
      .from("long_term_plans")
      .update({
        goal: text
      })
      .eq("user_id", user.id)
      .eq("id", id)
    
    if (error) throw error
  } catch(e) {
    throw e
  }
}

export async function updateLongTermEndDateInDB(date: string, id: string) {
  try {
    const user = await getCurrentUser()
      
    const { error } = await supabase
      .from("long_term_plans")
      .update({
        end_date: date
      })
      .eq("user_id", user.id)
      .eq("id", id)

    if (error) throw error
  } catch(e) {
    throw e
  }
}

export async function updateLongTermStartDateInDB(date: string, id: string) {
  try {
    const user = await getCurrentUser()
      
    const { error } = await supabase
      .from("long_term_plans")
      .update({
        start_date: date
      })
      .eq("user_id", user.id)
      .eq("id", id)

    if (error) throw error
  } catch(e) {
    throw e
  }
}

export async function updateLongTermReflectionInDB(text: string, id: string) {
  try {
    const user = await getCurrentUser()

    const { error } = await supabase
      .from("long_term_plans")
      .update({
        reflection: text
      })
      .eq("user_id", user.id)
      .eq("id", id)

    if (error) throw error

  } catch(e) {
    throw e
  }
}

export async function updateLonTermToggleInDB(completed: boolean, id: string) {
  try {
    const user = await getCurrentUser()

    const { error } = await supabase
      .from("long_term_plans")
      .update({
        completed: !completed
      })
      .eq("user_id", user.id)
      .eq("id", id)

    if (error) throw error
  } catch(e) {
    throw e
  }
}

export async function updateLongTermTaskTitleInDB(text: string, id: string) {
  try {
    const user = await getCurrentUser()

    const { error } = await supabase
      .from("long_term_tasks")
      .update({
        text: text
      })
      .eq("user_id", user.id)
      .eq("id", id)

    if (error) throw error
  } catch(e) {
    throw e
  }
}

export async function updateLongTermTaskToggleInDB(completed: boolean, id: string) {
  try {
    const user = await getCurrentUser()

    const { error } = await supabase
      .from("long_term_tasks")
      .update({
        completed: !completed
      })
      .eq("user_id", user.id)
      .eq("id", id)

    if (error) throw error

  } catch(e) {
    throw e
  }
}

export async function deleteLongTermTaskInDB(id: string) {
  try {
    const user = await getCurrentUser()

    const { error } = await supabase
      .from("long_term_tasks")
      .delete()
      .eq("user_id", user.id)
      .eq("id", id)

    if (error) throw error

  } catch(e) {
    throw e
  }
}

export async function getCurrentLongTermPlanInDB() {
  try {
    const user = await getCurrentUser()
    
    const { data: currentPlan, error: currentPlanError } = await supabase
      .from("long_term_plans")
      .select()
      .eq("user_id", user.id)
      .eq("completed", false)
      .maybeSingle()
    
    if (currentPlanError) throw currentPlanError
    
    const { data: tasksData, error: tasksError } = await supabase
      .from("long_term_tasks")
      .select()
      .eq("user_id", user.id)
      .eq("plan_id", currentPlan.id)
    
    if (tasksError) throw tasksError

    if (!currentPlan) {
      return {
        currentPlan: null,
        tasksData: []
      }
    }
    return { currentPlan, tasksData }

  } catch(e) {
    throw e
  }
}

export async function createInitialLongTermPlanInDB(today: string, end: string) {
  try {
    const user = await getCurrentUser()

    const { data, error} = await supabase
      .from("long_term_plans")
      .insert({
        user_id: user.id,
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

export async function getMonthlyPlansInLongTerm(startPeriod: string, endPeriod: string) {
  try {
    const user = await getCurrentUser()

    const { data: plansData, error: plansError } = await supabase
      .from("monthly_plans")
      .select()
      .eq("user_id", user.id)
      .gte("month_end", startPeriod)
      .lte("month_start", endPeriod)

      if (plansError) throw plansError

    const planIds = plansData.map(plan => plan.id)

    if (planIds.length === 0) {
      return {
        plansData: [],
        tasksData: []
      }
    }
    const { data: tasksData, error: tasksError } = await supabase
      .from("monthly_tasks")
      .select()
      .eq("user_id", user.id)
      .in("plan_id", planIds)

    if (tasksError) throw tasksError
    return { plansData, tasksData } 

  } catch(e) {
    throw e
  }
}

export async function getNextOrderIndex(startDate: string) {
  try {
    const user = await getCurrentUser()

    const { data: planData, error: planError } = await supabase
      .from("long_term_plans")
      .select()
      .eq("user_id", user.id)
      .eq("start_date", startDate)
      .eq("completed", false)
      .single()
      
    if (planError) throw planError

    const { data: taskData, error: taskError } = await supabase
      .from("long_term_tasks")
      .select("order_index")
      .eq("plan_id", planData.id)

    if (taskError) throw taskError
    return taskData.length

  } catch(e) {
    throw e
  }
}