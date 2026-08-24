import { supabase } from "../lib/supabase"


export async function getNextOrderIndex(
  taskTableName: string,
  id: string,
  userId: string
) {
  try {
    const { data: taskData, error: taskError } = await supabase
      .from(taskTableName)
      .select("order_index")
      .eq("user_id", userId)
      .eq("plan_id", id)

    if (taskError) throw taskError

    return taskData.length
  } catch(e) {
    throw e
  }
}