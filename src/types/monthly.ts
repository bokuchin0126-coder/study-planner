import type { BaseTask } from "./baseTask"

export interface MonthlyGoal extends BaseTask {}
 
export interface MonthlyRecord {
    month: string
    goals: MonthlyGoal[]
    reflection: string
}