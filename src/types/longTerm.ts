import type { Task } from "./baseTask"

export interface longTermRecord {
    startDate: string
    endDate: string
    tasks: Task[]
    reflection: string
    goal: string
    completed: boolean
}