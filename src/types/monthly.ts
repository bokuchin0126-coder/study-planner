import type { Task } from "./baseTask"

export interface MonthlyRecord {
    month: string
    tasks: Task[]
    reflection: string
}