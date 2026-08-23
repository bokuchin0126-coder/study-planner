import { supabase } from "../lib/supabase"


export async function getNextOrderIndex(
  planTableName: string,
  taskTableName: string,
  dateName: string, 
  date: string,
  userId: string
) {
  try {
    const { data: planData, error: planError } = await supabase
      .from(planTableName)
      .select()
      .eq("user_id", userId)
      .eq(dateName, date)
      .maybeSingle()
      
    if (planError) throw planError

    if (!planData) return 0

    const { data: taskData, error: taskError } = await supabase
      .from(taskTableName)
      .select("order_index")
      .eq("user_id", userId)
      .eq("plan_id", planData.id)

    if (taskError) throw taskError

    return taskData.length
  } catch(e) {
    throw e
  }
}