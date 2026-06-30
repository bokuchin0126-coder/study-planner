export interface MonthlyGoal {
    id: string
    title: string
    completed: boolean
}

export interface MonthlyRecord {
    month: string
    goals: MonthlyGoal[]
    achievement: string[]
    reflection: string
    nextMonthlyGoals: string[]
}