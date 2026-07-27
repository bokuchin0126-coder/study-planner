export interface Task {
    id: string
    title: string
    completed: boolean
}

export interface CompletedRecord {
    startDate: string
    endDate: string
    reflection: string
    tasks: Task[]
}

export interface LongTermCompletedRecord {
    startDate: string
    endDate: string
    goal: string
    reflection: string
    tasks: Task[]
    completed: boolean
}