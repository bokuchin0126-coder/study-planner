export interface MonthlyGoal {
    id: string
    title: string
    completed: boolean
    orderIndex: number
}
 
export interface MonthlyRecord {
    month: string
    goals: MonthlyGoal[]
    reflection: string
}