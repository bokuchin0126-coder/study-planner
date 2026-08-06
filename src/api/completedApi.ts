import { supabase } from "../lib/supabase"
import getCurrentUser from "../lib/auth"


export async function getCompltedDailyDataInDB() {
  try {
    const user = await getCurrentUser()
    
    const { data: plansData, error: plansError } = await supabase
      .from("daily_plans")
      .select("*")
      .eq("user_id", user.id)
    
    if (plansError) throw plansError
    
    const { data: tasksData, error: tasksError } = await supabase
      .from("daily_tasks")
      .select("*")
      .eq("user_id", user.id)
    
    if (tasksError) throw tasksError

    return { plansData, tasksData } 

  } catch(e) {
    throw e
  }
}

export async function getCompltedWeeklyDataInDB() {
  try {
    const user = await getCurrentUser()
    
    const { data: plansData, error: plansError } = await supabase
      .from("weekly_plans")
      .select("*")
      .eq("user_id", user.id)
    
    if (plansError) throw plansError
    
    const { data: tasksData, error: tasksError } = await supabase
      .from("weekly_tasks")
      .select("*")
      .eq("user_id", user.id)
     
    if (tasksError) throw tasksError

    return { plansData, tasksData }

  } catch(e) {
    throw e
  }
}

export async function getCompltedMonthlyDataInDB() {
  try {
    const user = await getCurrentUser()
    
    const { data: plansData, error: plansError } = await supabase
      .from("monthly_plans")
      .select("*")
      .eq("user_id", user.id)
    
    if (plansError) throw plansError
    
    const { data: tasksData, error: tasksError } = await supabase
      .from("monthly_tasks")
      .select("*")
      .eq("user_id", user.id)
     
    if (tasksError) throw tasksError

    return { plansData, tasksData } 

  } catch(e) {
    throw e
  }
}

export async function getCompltedLongTermDataInDB() {
  try {
    const user = await getCurrentUser()

    const { data: plansData, error: plansError } = await supabase
      .from("long_term_plans")
      .select("*")
      .eq("user_id", user.id)

    if (plansError) throw plansError

    const { data: tasksData, error: tasksError } = await supabase
      .from("long_term_tasks")
      .select("*")
      .eq("user_id", user.id)

    if (tasksError) throw tasksError

    return { plansData, tasksData }
    
  } catch(e) {
    throw e
  }
}