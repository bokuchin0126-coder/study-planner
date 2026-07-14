import type { Task } from "./baseTask"

export interface WeeklyRecord {
    week: string
    tasks: Task[]
    reflection: string
} 