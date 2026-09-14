import { describe, expect, it, vi, beforeEach } from "vitest"
import { supabase } from "../lib/supabase"
import {
  getMonthlyPlanByDateInDB,
  createdFirstMonthlyTaskInDB,
  addMonthlyTaskInDB,
  updateMonthlyTaskTitleInDB,
  updateMonthlyTaskToggleInDB,
  updateMonthlyReflectionInDB,
  deleteMonthlyTaskInDB,
  getMonthlyRecords,
  getCurrentLongTermPeriod
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
const mockGte = vi.fn()
const mockLte = vi.fn()

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
    gte: mockGte,
    lte: mockLte,
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

  mockGte.mockReturnValue({
    lte: mockLte,
  })

  mockLte.mockReturnValue({
    gte: mockGte,
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

describe("getMonthlyPlanByDateInDB", () => {
  it("指定した日付のplanのidを返す", async () => {
    const plan = {
      user_id: "user-id",
      id: "plan-id",
      month_start: "2026-08-01"
    }
    mockEq.mockReturnValueOnce({
      eq: mockEq
    })
    mockEq.mockReturnValueOnce({
      maybeSingle: mockMaybeSingle
    })
    mockMaybeSingle.mockResolvedValueOnce({
      data: { id: plan.id },
      error: null
    })

    const result = await getMonthlyPlanByDateInDB("2026-08-01", "user-id")

    expect(mockedFrom).toHaveBeenCalledWith("monthly_plans")

    expect(mockSelect).toHaveBeenCalledWith("id")

    expect(mockEq).toHaveBeenNthCalledWith(1,
      "user_id",
      "user-id"
    )
    expect(mockEq).toHaveBeenNthCalledWith(2,
      "month_start",
      "2026-08-01"
    )
    expect(result).toEqual(plan.id)
  })
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
    const result = await createdFirstMonthlyTaskInDB(
      monthlyDate("start"),
      monthlyDate("end"),
      "task-text",
      0,
      "user-id"
    )

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

    const result = await addMonthlyTaskInDB(
      "task-text",
      0,
      "plan-id",
      "user-id"
    )

    expect(mockedFrom).toHaveBeenCalledWith("monthly_tasks")

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: "user-id",
      plan_id: "plan-id",
      text: "task-text",
      order_index: 0
    })
    expect(result).toEqual(task)
  })
})

describe("updateMonthlyTaskTitleInDB", () => {
  it("指定したidを目印にタスク名を更新する", async () => {
    await updateMonthlyTaskTitleInDB(
      "task-id",
      "task-text",
      "user-id"
    )

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

describe("updateMonthlyTaskToggleInDB", () => {
  it("指定したidを目印にタグを更新する", async () => {
    await updateMonthlyTaskToggleInDB(
      "task-id",
      true,
      "user-id"
    )
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
      completed: false
    })
  })
})

describe("updateMonthlyReflectionInDB", () => {
  it("指定した期間のplanの振り返りを更新する", async () => {
    await updateMonthlyReflectionInDB(
      "plan-reflection",
      monthlyDate("start"),
      "user-id"
    )
    expect(mockedFrom).toHaveBeenCalledWith("monthly_plans")

    expect(mockEq).toHaveBeenCalledWith(
      "user_id",
      "user-id"
    )
    expect(mockExecute).toHaveBeenCalledWith(
      "month_start",
      monthlyDate("start")
    )
    expect(mockUpdate).toHaveBeenCalledWith({
      reflection: "plan-reflection"
    })
  })
})

describe("daleteMonthlyTaskInDB", () => {
  it("指定したidを目印にタスクを削除する", async () => {
    await deleteMonthlyTaskInDB("task-id", "user-id")

    expect(mockedFrom).toHaveBeenCalledWith("monthly_tasks")

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

describe("getMonthlyRecords", () => {
  it("指定した期間のplanとタスクをDBから持ってくる", async () => {
    const startPlan = {
      user_id: "user-id",
      id: "startMonth",
      month_start: "2026-08-01"
    }
    const endPlan = {
      user_id: "user-id",
      id: "endMonth",
      month_end: "2026-10-31"
    }
    const startTask = {
      user_id: "user-id",
      plan_id: "startMonth",
    }
    const endTask = {
      user_id: "user-id",
      plan_id: "endMonth",
    }

    mockLte.mockResolvedValueOnce({
      data: [startPlan, endPlan],
      error: null
    })
    mockIn.mockResolvedValueOnce({
      data: [startTask, endTask],
      error: null
    })

    const result = await getMonthlyRecords(
      "2026-08-01",
      "2026-10-31",
      "user-id"
    )

    expect(mockedFrom).toHaveBeenNthCalledWith(1, "monthly_plans")
    expect(mockedFrom).toHaveBeenNthCalledWith(2, "monthly_tasks")

    expect(mockEq).toHaveBeenNthCalledWith(1,
      "user_id",
      "user-id"
    )
    expect(mockEq).toHaveBeenNthCalledWith(2,
      "user_id",
      "user-id"
    )
    expect(mockGte).toHaveBeenCalledWith(
      "month_start",
      "2026-08-01"
    )
    expect(mockLte).toHaveBeenCalledWith(
      "month_end",
      "2026-10-31"
    )
    expect(mockIn).toHaveBeenCalledWith(
      "plan_id",
      ["startMonth", "endMonth"]
    )
    expect(result).toEqual({
      plansData: [startPlan, endPlan],
      tasksData: [startTask, endTask]
    })
  })

  it("該当するplanがない場合は空配列を返す", async () => {
    mockLte.mockResolvedValueOnce({
      data: [],
      error: null
    })

    const result = await getMonthlyRecords(
      "2026-08-01",
      "2026-10-31",
      "user-id"
    )

    expect(mockedFrom).toHaveBeenCalledWith("monthly_plans")

    expect(mockEq).toHaveBeenCalledWith(
      "user_id",
      "user-id"
    )

    expect(mockGte).toHaveBeenCalledWith(
      "month_start",
      "2026-08-01"
    )

    expect(mockLte).toHaveBeenCalledWith(
      "month_end",
      "2026-10-31"
    )

    expect(mockedFrom).not.toHaveBeenCalledWith("monthly_tasks")

    expect(result).toEqual({
      plansData: [],
      tasksData: []
    })
  })
})

describe("getCurrentLongTermPeriod", () => {
  it("現在の長期期間を返す", async () => {
    const today = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Tokyo"
    }).format(new Date())

    const plan = {
      user_id: "user-id",
      id: "plan-id",
      start_date: monthlyDate("start", -1),
      end_date: monthlyDate("end", 1),
      reflection: ""
    }

    mockGte.mockReturnValueOnce({
      maybeSingle: mockMaybeSingle
    })
    mockMaybeSingle.mockResolvedValueOnce({
      data: plan,
      error: null
    })

    const result = await getCurrentLongTermPeriod("user-id")

    expect(mockedFrom).toHaveBeenCalledWith("long_term_plans")
    expect(mockSelect).toHaveBeenCalledWith("start_date, end_date")

    expect(mockEq).toHaveBeenCalledWith(
      "user_id",
      "user-id"
    )
    expect(mockLte).toHaveBeenCalledWith(
      "start_date",
      today
    )
    expect(mockGte).toHaveBeenCalledWith(
      "end_date",
      today
    )
    expect(mockMaybeSingle).toHaveBeenCalledTimes(1)
    expect(result).toEqual(plan)
  })

  it("該当する長期計画がない場合はnullを返す", async () => {
    const todayString = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Tokyo"
    }).format(new Date())

    mockGte.mockReturnValueOnce({
      maybeSingle: mockMaybeSingle
    })

    const result = await getCurrentLongTermPeriod("user-id")

    expect(mockedFrom).toHaveBeenCalledWith("long_term_plans")
    expect(mockSelect).toHaveBeenCalledWith("start_date, end_date")
    expect(mockEq).toHaveBeenCalledWith("user_id", "user-id")
    expect(mockLte).toHaveBeenCalledWith("start_date", todayString)
    expect(mockGte).toHaveBeenCalledWith("end_date", todayString)
    expect(result).toBeNull()
  })
})