import type { Task } from "./baseTask"

export interface LongTermRecord {
    id: string
    startDate: string
    endDate: string
    tasks: Task[]
    reflection: string
    goal: string
    completed: boolean
}

export interface CompletedTask {
    month: string
    text: string
}