import type { BaseTask } from "./baseTask"

export interface WeeklyGoal extends BaseTask {}

export interface WeeklyRecord {
    week: string
    goals: WeeklyGoal[]
    reflection: string
} 