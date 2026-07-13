import type { BaseTask } from "./baseTask"

export interface DailyTask extends BaseTask {}

export interface DailyRecord {
    date: string
    tasks: DailyTask[]
    reflection: string
}