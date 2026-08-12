import { describe, expect, it } from "vitest"
import type { Task } from "../../types/completed"
import { 
  calculateRate,
  getCurrentMonthRate,
  getCurrentYearRate,
  getLongTermProgress
} from "./rate"


const baseTask = {
  id: "",
  title: "",
  completed: false
}

const baseRecord = {
  startDate: "",
  endDate: "",
  tasks: [],
  reflection: ""
}

const getDate = (yearOffset = 0, monthOffset = 0, dayOffset = 0) => {
  const date = new Date()

  date.setFullYear(date.getFullYear() + yearOffset)
  date.setMonth(date.getMonth() + monthOffset)
  date.setDate(date.getDate() + dayOffset)

  return date.toISOString().split("T")[0]
}

describe("calculateRate", () => {
  const createTask = (completed: boolean) => ({
    ...baseTask,
    completed
  })
  const createTasks = (...completed: boolean[]) => 
    completed.map(value => createTask(value))

  it("すべてのタスクが完了している場合は達成率100%を返す", () => {
    const tasks = createTasks(true, true, true, true)
    
    const record = [{
      ...baseRecord,
      tasks: tasks
    }]
    const result = calculateRate(record)

    expect(result).toBe(100)
  })

  it("完了と未完了のタスクが混在している場合は達成率を正しく計算できる", () => {
    const tasks = createTasks(false, true, true, true)

    const record = [{
      ...baseRecord,
      tasks: tasks
    }]
    const result = calculateRate(record)

    expect(result).toBe(75)
  })

  it("すべてのタスクが未完了の場合は達成率0%を返す", () => {
    const tasks = createTasks(false, false, false, false)

    const record = [{
      ...baseRecord,
      tasks: tasks
    }]
    const result = calculateRate(record)

    expect(result).toBe(0)
  })

  it("タスクが存在しない場合は達成率0%を返す", () => {
    const record = [baseRecord]
    const result = calculateRate(record)

    expect(result).toBe(0)
  }) 

  it("LongTermRecordの型でも達成率を正しく計算できる", () => {
    const tasks = createTasks(false, false, true, true)

    const record = [{
      ...baseRecord,
      tasks: tasks,
      goal: "",
      completed: false
    }]
    const result = calculateRate(record)

    expect(result).toBe(50)
  })
})

describe("getCurrentMonthRate", () => {
  const createRecord = (startDate: string, tasks: Task[]) => ({
    ...baseRecord,
    startDate,
    tasks
  })
  const createTask = (completed: boolean) => ({
    ...baseTask,
    completed
  })
  const createTasks = (...completed: boolean[]) => 
    completed.map(value => createTask(value))

  it("今月のレコードだけを対象に達成率を計算できる", () => {
    const monthTasks = createTasks(false, true, true, true)
    const anotherMonthTasks = createTasks(false, true, false, false)

    const records = [
      createRecord(getDate(), monthTasks),
      createRecord(getDate(0, -2), anotherMonthTasks)
    ] 
    const result = getCurrentMonthRate(records)

    expect(result).toBe(75)
  })

  it("今年でも今月以外のレコードは達成率の計算対象外になる", () => {
    const monthTasks = createTasks(false, false, true, true)
    const nextMonthTasks = createTasks(false, true, false, false)
    const lastMonthTasks = createTasks(false, false, true, true)

    const records = [
      createRecord(getDate(), monthTasks),
      createRecord(getDate(0, 1), nextMonthTasks),
      createRecord(getDate(0, -1), lastMonthTasks)
    ] 
    const result = getCurrentMonthRate(records)

    expect(result).toBe(50)
  })

  it("今年以外の同じ月のレコードは達成率の計算対象外になる", () => {
    const monthTasks = createTasks(false, false, true, true)
    const nextYearTasks = createTasks(false, true, false, false)
    const lastYearTasks = createTasks(false, false, true, true)

    const records = [
      createRecord(getDate(), monthTasks),
      createRecord(getDate(1), nextYearTasks),
      createRecord(getDate(-1), lastYearTasks)
    ] 
    const result = getCurrentMonthRate(records)

    expect(result).toBe(50)
  })

  it("対象となる今月のレコードが存在しない場合は達成率0%を返す", () => {
    const result = getCurrentMonthRate([])

    expect(result).toBe(0)
  })
})

describe("getCurrentYearRate", () => {
  const createRecord = (startDate: string, tasks: Task[]) => ({
    ...baseRecord,
    startDate,
    tasks
  })
  const createTask = (completed: boolean) => ({
    ...baseTask,
    completed
  })
  const createTasks = (...completed: boolean[]) => 
    completed.map(value => createTask(value))

  it("今年のレコードだけを対象に達成率を計算できる", () => {
    const yearTasks = createTasks(false, true, true, true)
    const anotherYearTasks = createTasks(false, true, false, false)

    const records = [
      createRecord(getDate(), yearTasks),
      createRecord(getDate(-3), anotherYearTasks)
    ] 
    const result = getCurrentYearRate(records)

    expect(result).toBe(75)
  })

  it("今年以外のレコードは達成率の計算対象外になる", () => {
    const yearTasks = createTasks(false, false, true, true)
    const nextYearTasks = createTasks(false, true, false, false)
    const lastYearTasks = createTasks(false, true, true, false)

    const records = [
      createRecord(getDate(), yearTasks),
      createRecord(getDate(1), nextYearTasks),
      createRecord(getDate(-1), lastYearTasks)
    ] 
    const result = getCurrentYearRate(records)

    expect(result).toBe(50)
  })

  it("対象となる今年のレコードが存在しない場合は達成率0%を返す", () => {
    const result = getCurrentYearRate([])

    expect(result).toBe(0)
  })
})

describe("getLongTermProgress", () => {
  const createLongTermRecord = (startDate: string, endDate: string, completed: boolean) => ({
    ...baseRecord,
    startDate,
    endDate,
    completed,
    goal: ""
  })

  it("進行中の未完了レコードから進捗率を正しく計算できる", () => {
    const records = [
      createLongTermRecord(getDate(0, 0, -5), getDate(0, 0, 5), false),
      createLongTermRecord(getDate(-5), getDate(-2), true)
    ]
    const result = getLongTermProgress(records)

    expect(result).toBe(50)
  })

  it("開始日前の未完了レコードは進捗率0%を返す", () => {
    const records = [
      createLongTermRecord(getDate(0, 0, 5), getDate(0, 0, 10), false),
      createLongTermRecord(getDate(-5), getDate(-2), true)
    ]
    const result = getLongTermProgress(records)

    expect(result).toBe(0)
  })

  it("終了日を過ぎた未完了レコードは進捗率100%を返す", () => {
    const records = [
      createLongTermRecord(getDate(-1), getDate(0, 0, -5), false),
      createLongTermRecord(getDate(-5), getDate(-2), true)
    ]
    const result = getLongTermProgress(records)

    expect(result).toBe(100)
  })

  it("未完了レコードが存在しない場合は進捗率100%を返す", () => {
    const records = [
      createLongTermRecord(getDate(0, 0, -5), getDate(0, 0, 5), true),
      createLongTermRecord(getDate(-5), getDate(-2), true)
    ]
    const result = getLongTermProgress(records)

    expect(result).toBe(100)
  })
})