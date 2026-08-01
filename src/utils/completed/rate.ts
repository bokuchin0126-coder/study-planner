import type {
  CompletedRecord,
  LongTermCompletedRecord
} from "../../types/completed"

type RateRecord = CompletedRecord | LongTermCompletedRecord

export const calculateRate = (records: RateRecord[]) => {
  const total = records.reduce(
    (sum, record) => sum + record.tasks.length,
    0
  )

  const completed = records.reduce(
    (sum, record) =>
      sum + record.tasks.filter(task => task.completed).length,
    0
  )

  return total === 0
    ? 0
    : Math.round((completed / total) * 100)
}

export const getCurrentMonthRate = (
  records: CompletedRecord[]
) => {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthRecords = records.filter(record => {
    const date = new Date(record.startDate)

    return (
      date.getFullYear() === currentYear &&
      date.getMonth() === currentMonth
    )
  })

  return calculateRate(monthRecords)
}

export const getCurrentYearRate = (
  records: CompletedRecord[]
) => {
  const currentYear = new Date().getFullYear()

  const yearRecords = records.filter(
    record =>
      new Date(record.startDate).getFullYear() === currentYear
  )

  return calculateRate(yearRecords)
}

export const getLongTermProgress = (
  records: LongTermCompletedRecord[]
) => {
  const record = records.find(record => !record.completed)

  if (!record) return 100

  const start = new Date(record.startDate).getTime()
  const end = new Date(record.endDate).getTime()
  const now = Date.now()

  if (now <= start) return 0
  if (now >= end) return 100

  return Math.round(((now - start) / (end - start)) * 100)
}