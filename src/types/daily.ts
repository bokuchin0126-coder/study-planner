export interface DailyTask {
    id: string
    title: string
    completed: boolean
}

export interface DailyRecord {
    date: string
    tasks: DailyTask[]
}