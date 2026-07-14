import type { Task } from "./baseTask"

export interface DailyRecord {
    date: string
    tasks: Task[]
    reflection: string
}