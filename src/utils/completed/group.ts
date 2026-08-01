import type { GroupRecord } from "../../types/completed"

export const groupByYear = <T extends GroupRecord>(records: T[]) => {
  return records.reduce(
    (acc, record) => {
      const year = new Date(record.startDate).getFullYear()

      if (!acc[year]) {
        acc[year] = []
      }

      acc[year].push(record)

      return acc
    },
    {} as Record<number, T[]>
  )
}

export const groupByMonth = <T extends GroupRecord>(records: T[]) => {
  return records.reduce(
    (acc, record) => {
      const month = new Date(record.startDate).getMonth()

      if (!acc[month]) {
        acc[month] = []
      }

      acc[month].push(record)

      return acc
    },
    {} as Record<number, T[]>
  )
}