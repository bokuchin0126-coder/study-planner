export interface WeeklyGoal {
    id: string
    title: string
    completed: boolean
    orderIndex: number
}

export interface WeeklyRecord {
    week: string
    goals: WeeklyGoal[]
    reflection: string
} 