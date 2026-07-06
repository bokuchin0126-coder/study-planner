export interface DailyTask {
    id: string
    title: string
    completed: boolean
    orderIndex: number
}

export interface DailyRecord {
    date: string
    tasks: DailyTask[]
    reflection: string
}