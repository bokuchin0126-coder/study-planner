import { describe, expect, it, vi, beforeEach } from "vitest"
import { supabase } from "../lib/supabase"
import {
  getWeeklyPlanByDateInDB,
  createdFirstWeeklyTaskInDB,
  addWeeklyTaskInDB,
  updateWeeklyTaskTitleInDB,
  updateWeeklyTaskToggleInDB,
  updateWeeklyReflectionInDB,
  daleteWeeklyTaskInDB,
  getWeeklyRecords
} from "./weeklyApi"


const weeklyDate = (date: "start" | "end", offset = 0) => {
  const today = new Date()
  const day = today.getDay()
  
  const monday = new Date(today)
  const diff = day === 0 ? -6 : 1 - day
  monday.setDate(today.getDate() + diff + offset * 7)
  
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  
  const weekStart = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo"
  }).format(monday)
  
  const weekEnd = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo"
  }).format(sunday)
  
  if (date === "start") return weekStart
  else if (date === "end") return weekEnd
  else return ""
}

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}))

const mockedFrom = vi.mocked(supabase.from)

const mockInsert = vi.fn()
const mockSelect = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()

const mockEq = vi.fn()
const mockIn = vi.fn()

const mockSingle = vi.fn()
const mockMaybeSingle = vi.fn()
const mockExecute = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()

  mockInsert.mockReturnValue({
    select: mockSelect,
  })

  mockSelect.mockReturnValue({
    eq: mockEq,
    in: mockIn,
    single: mockSingle,
  })

  mockUpdate.mockReturnValue({
    eq: mockEq,
  })

  mockDelete.mockReturnValue({
    eq: mockEq,
  })

  mockEq.mockReturnValue({
    eq: mockExecute,
    in: mockIn,
    select: mockSelect,
    single: mockSingle,
    maybeSingle: mockMaybeSingle
  })

  mockSingle.mockResolvedValue({
    data: null,
    error: null,
  })

  mockExecute.mockResolvedValue({
    error: null
  })

  mockMaybeSingle.mockResolvedValue({
    data: null,
    error: null
  })

  mockedFrom.mockReturnValue({
    insert: mockInsert,
    select: mockSelect,
    update: mockUpdate,
    delete: mockDelete,
  } as any)
})

describe("getWeeklyPlanByDateInDB", () => {
  it("指定した日付のplanのidを返す", async () => {
    const plan = {
      user_id: "user-id",
      id: "plan-id",
      week_start: "2026-08-09"
    }
    mockEq.mockReturnValueOnce({
      eq: mockEq
    })
    mockEq.mockReturnValueOnce({
      maybeSingle: mockMaybeSingle
    })
    mockMaybeSingle.mockResolvedValueOnce({
      data: {id: plan.id},
      error: null
    })

    const result = await getWeeklyPlanByDateInDB("2026-08-09", "user-id")

    expect(mockedFrom).toHaveBeenCalledWith("weekly_plans")

    expect(mockSelect).toHaveBeenCalledWith("id")

    expect(mockEq).toHaveBeenNthCalledWith(1,
      "user_id",
      "user-id"
    )
    expect(mockEq).toHaveBeenNthCalledWith(2,
      "week_start",
      "2026-08-09"
    )
    expect(result).toEqual(plan.id)
  })
})

describe("createdFirstWeeklyTaskInDB", () => {
  it("指定した期間のplanを作り、入力したテキストで作成したタスクを返す", async () => {
    const plan = {
      user_id: "user-id",
      id: "plan-id",
      week_start: weeklyDate("start"),
      week_end: weeklyDate("end"),
      reflection: ""
    }
    const task = {
      user_id: "user-id",
      plan_id: "plan-id",
      text: "task-text",
      order_index: 0
    }

    mockSingle.mockResolvedValueOnce({
      data: plan,
      error: null
    })
    mockSingle.mockResolvedValueOnce({
      data: task,
      error: null
    })
    const result = await createdFirstWeeklyTaskInDB(
      weeklyDate("start"),
      weeklyDate("end"),
      "task-text",
      0,
      "user-id"
    )

    expect(mockedFrom).toHaveBeenNthCalledWith(1, "weekly_plans")
    expect(mockedFrom).toHaveBeenNthCalledWith(2, "weekly_tasks")

    expect(mockInsert).toHaveBeenNthCalledWith(1,{
      user_id: "user-id",
      week_start: weeklyDate("start"),
      week_end: weeklyDate("end"),
      reflection: ""
    })
    expect(mockInsert).toHaveBeenNthCalledWith(2,{
      user_id: "user-id",
      plan_id: "plan-id",
      text: "task-text",
      order_index: 0
    })
    expect(result).toEqual(task)
  })
})

describe("addWeeklyTaskInDB", () => {
  it("指定した期間のplanにタスクを追加して返す", async () => {
    const task = {
      user_id: "user-id",
      plan_id: "plan-id",
      text: "task-text",
      order_index: 0
    }
    mockSingle.mockResolvedValueOnce({
      data: task,
      error: null
    })
    
    const result = await addWeeklyTaskInDB(
      "task-text",
      0,
      "user-id",
      "plan-id"
    )

    expect(mockedFrom).toHaveBeenCalledWith("weekly_tasks")

    expect(mockInsert).toHaveBeenNthCalledWith(1,{
      user_id: "user-id",
      plan_id: "plan-id",
      text: "task-text",
      order_index: 0
    })
    expect(result).toEqual(task)
  })
})

describe("updateWeeklyTaskTitleInDB", () => {
  it("指定したidを目印にタスク名を更新する", async () => {
    await updateWeeklyTaskTitleInDB(
      "task-id",
      "task-text",
      "user-id"
    )

    expect(mockedFrom).toHaveBeenCalledWith("weekly_tasks")

    expect(mockEq).toHaveBeenCalledWith(
      "user_id",
      "user-id"
    )
    expect(mockExecute).toHaveBeenCalledWith(
      "id",
      "task-id"
    )
    expect(mockUpdate).toHaveBeenCalledWith({
      text: "task-text"
    })
  })
})

describe("updateWeeklyTaskToggleInDB", () => {
  it("指定したidを目印にタスクのタグを更新する", async () => {
    await updateWeeklyTaskToggleInDB(
      "task-id",
      false,
      "user-id"
    )

    expect(mockedFrom).toHaveBeenCalledWith("weekly_tasks")

    expect(mockEq).toHaveBeenCalledWith(
      "user_id",
      "user-id"
    )
    expect(mockExecute).toHaveBeenCalledWith(
      "id",
      "task-id"
    )
    expect(mockUpdate).toHaveBeenCalledWith({
      completed: true
    })
  })
})

describe("updateWeeklyReflectionInDB", () => {
  it("指定した期間のplanの振り返りを更新する", async () => {
    await updateWeeklyReflectionInDB(
      "plan-reflection",
      weeklyDate("start"),
      "user-id"
    )

    expect(mockedFrom).toHaveBeenCalledWith("weekly_plans")

    expect(mockEq).toHaveBeenCalledWith(
      "user_id",
      "user-id"
    )
    expect(mockExecute).toHaveBeenCalledWith(
      "week_start",
      weeklyDate("start")
    )
    expect(mockUpdate).toHaveBeenCalledWith({
      reflection: "plan-reflection"
    })
  })
})

describe("daleteWeeklyTaskInDB", () => {
  it("指定したidを目印にタスクを削除する", async () => {
    await daleteWeeklyTaskInDB("task-id", "user-id")

    expect(mockedFrom).toHaveBeenCalledWith("weekly_tasks")

    expect(mockEq).toHaveBeenCalledWith(
      "user_id",
      "user-id"
    )
    expect(mockExecute).toHaveBeenCalledWith(
      "id",
      "task-id"
    )
    expect(mockDelete).toHaveBeenCalledTimes(1)
  })
})

describe("getWeeklyRecords", () => {
  it("指定した期間のplanとタスクをDBから持ってくる", async () => {
    const weekPlan = {
      user_id: "user-id",
      id: "weekPlan-id",
      week_start: weeklyDate("start")
    }
    const lastWeekPlan = {
      user_id: "user-id",
      id: "lastWeekPlan-id",
      week_start: weeklyDate("start", -1)
    }
    const nextWeekPlan = {
      user_id: "user-id",
      id: "nextWeekPlan-id",
      week_start: weeklyDate("start", 1)
    }
    const weekTask = {
      user_id: "user-id",
      plan_id: "weekPlan-id",
    }
    const lastWeekTask = {
      user_id: "user-id",
      plan_id: "lastWeekPlan-id",
    }
    const nextWeekTask = {
      user_id: "user-id",
      plan_id: "nextWeekPlan-id",
    }

    mockIn.mockResolvedValueOnce({
      data: [weekPlan, lastWeekPlan, nextWeekPlan],
      error: null
    })
    mockIn.mockResolvedValueOnce({
      data: [weekTask, lastWeekTask, nextWeekTask],
      error: null
    })

    const result = await getWeeklyRecords(
      weeklyDate("start"),
      weeklyDate("start", -1),
      weeklyDate("start", 1),
      "user-id"
    )

    expect(mockedFrom).toHaveBeenNthCalledWith(1, "weekly_plans")
    expect(mockedFrom).toHaveBeenNthCalledWith(2, "weekly_tasks")

    expect(mockEq).toHaveBeenNthCalledWith(1,
      "user_id",
      "user-id"
    )
    expect(mockEq).toHaveBeenNthCalledWith(2,
      "user_id",
      "user-id"
    )
    expect(mockIn).toHaveBeenNthCalledWith(1, 
      "week_start",
      [weeklyDate("start"), weeklyDate("start", -1), weeklyDate("start", 1)]
    )
    expect(mockIn).toHaveBeenNthCalledWith(2, 
      "plan_id",
      ["weekPlan-id", "lastWeekPlan-id", "nextWeekPlan-id"]
    )
    expect(result).toEqual({
      plansData: [weekPlan, lastWeekPlan, nextWeekPlan],
      tasksData: [weekTask, lastWeekTask, nextWeekTask]
    })
  })
})