export interface WeeklyGoal {
    id: string
    title: string
    completed: boolean
}

export interface WeeklyRecord {
    week: string
    goals: WeeklyGoal[]
    achievement: string[]
    reflection: string
    nextWeekGoals: string[]
}