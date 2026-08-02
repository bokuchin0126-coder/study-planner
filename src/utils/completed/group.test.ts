import { describe, expect, it } from "vitest"
import { groupByYear, groupByMonth } from "./group"


const baseRecord = {
  startDate: "",
  endDate: "",
  tasks: [],
  reflection: ""
}

describe("groupByYear", () => {
  const createRecord = (startDate: string) => ({
    ...baseRecord,
    startDate
  })

  it("年が異なるレコードを年ごとにグループ化できる", () => {
    const records = [
      createRecord("2026-01-05"),
      createRecord("2026-08-01"),
      createRecord("2029-08-10"),
      createRecord("2029-04-09")
    ]
    const result = groupByYear(records)

    expect(Object.keys(result)).toHaveLength(2)
    expect(result[2026]).toHaveLength(2)
    expect(result[2029]).toHaveLength(2)
  })

  it("年がすべて同じレコードを同じ年のグループにまとめられる", () => {
    const records = [
      createRecord("2026-01-05"),
      createRecord("2026-08-01"),
      createRecord("2026-08-10"),
      createRecord("2026-04-09")
    ]
    const result = groupByYear(records)

    expect(Object.keys(result)).toHaveLength(1)
    expect(result[2026]).toHaveLength(4)
  })

  it("年がすべて異なるレコードをそれぞれ別のグループに分けられる", () => {
    const records = [
      createRecord("2026-01-05"),
      createRecord("2025-08-01"),
      createRecord("2027-08-10"),
      createRecord("2029-04-09")
    ]
    const result = groupByYear(records)

    expect(Object.keys(result)).toHaveLength(4)
    expect(result[2026]).toHaveLength(1)
    expect(result[2025]).toHaveLength(1)
    expect(result[2027]).toHaveLength(1)
    expect(result[2029]).toHaveLength(1)
  })

  it("空のレコードを渡した場合は空のオブジェクトを返す", () => {
    const result = groupByYear([])

    expect(result).toEqual({})
  })

  it("longTermRecordの型でも同じように年が異なるレコードを年ごとにグループ化できる", () => {
    const createLongTermRecord = (startDate: string) => ({
      ...baseRecord,
      startDate,
      goal: "",
      completed: false
    })
    const records = [
      createLongTermRecord("2026-05-02"),
      createLongTermRecord("2026-02-06"),
      createLongTermRecord("2030-06-07"),
      createLongTermRecord("2030-08-06")
    ]
    const result = groupByYear(records)

    expect(Object.keys(result)).toHaveLength(2)
    expect(result[2026]).toHaveLength(2)
    expect(result[2030]).toHaveLength(2)
  })
})

describe("groupByMonth", () => {
  const createRecord = (startDate: string) => ({
    ...baseRecord,
    startDate
  })

  it("月が異なるレコードを月ごとにグループ化できる", () => {
    const records = [
      createRecord("2026-07-01"),
      createRecord("2026-07-12"),
      createRecord("2026-12-02"),
      createRecord("2026-12-25")
    ]
    const result = groupByMonth(records)

    expect(Object.keys(result)).toHaveLength(2)
    expect(result[6]).toHaveLength(2)
    expect(result[11]).toHaveLength(2)
  })

  it("月がすべて同じレコードを同じ月のグループにまとめられる", () => {
    const records = [
      createRecord("2026-07-01"),
      createRecord("2026-07-12"),
      createRecord("2026-07-02"),
      createRecord("2026-07-25")
    ]
    const result = groupByMonth(records)

    expect(Object.keys(result)).toHaveLength(1)
    expect(result[6]).toHaveLength(4)
  })

  it("月がすべて異なるレコードをそれぞれ別のグループに分けられる", () => {
    const records = [
      createRecord("2026-02-01"),
      createRecord("2026-07-12"),
      createRecord("2026-09-02"),
      createRecord("2026-12-25")
    ]
    const result = groupByMonth(records)

    expect(Object.keys(result)).toHaveLength(4)
    expect(result[1]).toHaveLength(1)
    expect(result[6]).toHaveLength(1)
    expect(result[8]).toHaveLength(1)
    expect(result[11]).toHaveLength(1)
  })

  it("空のレコードを渡した場合は空のオブジェクトを返す", () => {
    const result = groupByMonth([])

    expect(result).toEqual({})
  })

  it("年が異なっても同じ月のレコードを同じグループにまとめられる", () => {
    const records = [
      createRecord("2024-07-01"),
      createRecord("2026-07-12"),
      createRecord("2027-11-02"),
      createRecord("2029-11-25")
    ]
    const result = groupByMonth(records)

    expect(Object.keys(result)).toHaveLength(2)
    expect(result[6]).toHaveLength(2)
    expect(result[10]).toHaveLength(2)
  })

  it("LongTermRecordの型でも同じように月が異なるレコードを月ごとにグループ化できる", () => {
    const createLongTermRecord = (startDate: string) => ({
      ...baseRecord,
      startDate,
      goal: "",
      completed: false
    })
    const records = [
      createLongTermRecord("2026-08-25"),
      createLongTermRecord("2026-08-30"),
      createLongTermRecord("2029-10-05"),
      createLongTermRecord("2029-10-26")
    ]
    const result = groupByMonth(records)

    expect(Object.keys(result)).toHaveLength(2)
    expect(result[7]).toHaveLength(2)
    expect(result[9]).toHaveLength(2)
  })
})