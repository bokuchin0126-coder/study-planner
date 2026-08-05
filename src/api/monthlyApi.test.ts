import { describe, expect, it, vi, beforeEach } from "vitest"
import getCurrentUser from "../lib/auth"
import { supabase } from "../lib/supabase"
import {
  createdFirstMonthlyTaskInDB,
  addMonthlyTaskInDB,
  updatemMonthlyTaskTitleInDB,
  updateMonthlyTaskToggleInDB,
  updateMonthlyReflectionInDB,
  daleteMonthyTaskInDB,
  getMonthlyRecords
} from "./monthlyApi"


const monthlyDate = (date: "start" | "end", offset = 0) => {
  const now = new Date()

  const target = new Date(now.getFullYear(), now.getMonth() + offset, 1)

  const year = target.getFullYear()
  const month = target.getMonth()

  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)
  
  const format = (d: Date) => new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo"
  }).format(d)
  
  if (date === "start") return format(monthStart)
  else if (date === "end") return format(monthEnd)
  else return ""
}

vi.mock("../lib/auth", () => ({
  default: vi.fn(),
}))

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}))

const mockedGetCurrentUser = vi.mocked(getCurrentUser)
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

  mockedGetCurrentUser.mockResolvedValue({
    id: "user-id",
  } as any)

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

describe("createdFirstMonthlyTaskInDB", () => {
  it("指定した期間のplanを作成し、入力したテキストで作成したタスクを返す", async () => {
    const plan = {
      user_id: "user-id",
      id: "plan-id",
      month_start: monthlyDate("start"),
      month_end: monthlyDate("end"),
      reflection: ""
    }
    const task = {
      user_id: "user-id",
      plan_id: "plan-id",
      text: "task-text",
      orderIndex: 0
    }
    mockSingle.mockResolvedValueOnce({
      data: plan,
      error: null
    })
    mockSingle.mockResolvedValueOnce({
      data: task,
      error: null
    })
    const result = await createdFirstMonthlyTaskInDB(
      monthlyDate("start"),
      monthlyDate("end"),
      "task-text",
      0
    )

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenNthCalledWith(1, "monthly_plans")
    expect(mockedFrom).toHaveBeenNthCalledWith(2, "monthly_tasks")

    expect(mockInsert).toHaveBeenNthCalledWith(1, {
      user_id: "user-id",
      month_start: monthlyDate("start"),
      month_end: monthlyDate("end"),
      reflection: ""
    })
    expect(mockInsert).toHaveBeenNthCalledWith(2, {
      user_id: "user-id",
      plan_id: "plan-id",
      text: "task-text",
      order_index: 0
    })
    expect(result).toEqual(task)
  })
})

describe("addMonthlyTaskInDB", () => {
  it("指定した期間のplanのidで作ったタスクを返す", async () => {
    const plan = {
      user_id: "user-id",
      id: "plan-id",
      month_start: monthlyDate("start")
    }
    const task = {
      user_id: "user-id",
      plan_id: "plan-id",
      text: "task-text",
      order_index: 0
    }
    mockEq.mockReturnValueOnce({
      eq: mockEq
    })
    mockEq.mockReturnValueOnce({
      single: mockSingle
    })
    mockSingle.mockResolvedValueOnce({
      data: plan,
      error: null
    })
    mockSingle.mockResolvedValueOnce({
      data: task,
      error: null
    })

    const result = await addMonthlyTaskInDB(
      monthlyDate("start"),
      "task-text",
      0
    )

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenNthCalledWith(1, "monthly_plans")
    expect(mockedFrom).toHaveBeenNthCalledWith(2, "monthly_tasks")

    expect(mockEq).toHaveBeenNthCalledWith(1, 
      "user_id",
      "user-id"
    )
    expect(mockEq).toHaveBeenNthCalledWith(2, 
      "month_start",
      monthlyDate("start")
    )

    expect(mockInsert).toHaveBeenNthCalledWith(1, {
      user_id: "user-id",
      plan_id: "plan-id",
      text: "task-text",
      order_index: 0
    })
    expect(result).toEqual(task)
  })
})

describe("updatemMonthlyTaskTitleInDB", () => {
  it("指定したidを目印にタスク名を更新する", async () => {
    await updatemMonthlyTaskTitleInDB(
      "task-id",
      "task-text"
    )

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenCalledWith("monthly_tasks")

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