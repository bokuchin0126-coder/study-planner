import type { Task } from "./baseTask"

export interface DailyRecord {
    date: string
    tasks: Task[]
    reflection: string
}

export interface DailyTaskRow {
    id: string
    created_at: string
    user_id: string
    plan_id: string
    text: string
    completed: boolean
    order_index: number
    source_task_id: string
}