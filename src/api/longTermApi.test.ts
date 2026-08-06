import { describe, expect, it, vi, beforeEach } from "vitest"
import getCurrentUser from "../lib/auth"
import { supabase } from "../lib/supabase"
import {
  addLongTermTaskInDB,
  updateLongTermGoalInDB,
  updateLongTermEndDateInDB,
  updateLongTermStartDateInDB,
  updateLongTermReflectionInDB,
  updateLongTermToggleInDB,
  updateLongTermTaskTitleInDB,
  updateLongTermTaskToggleInDB,
  deleteLongTermTaskInDB,
  getCurrentLongTermPlanInDB,
  createInitialLongTermPlanInDB,
  getMonthlyPlansInLongTerm
} from "./longTermApi"



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
const mockLte = vi.fn()
const mockGte = vi.fn()

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
    gte: mockGte,
    select: mockSelect,
    single: mockSingle,
    maybeSingle: mockMaybeSingle
  })

  mockGte.mockReturnValue({
    lte: mockLte
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

describe("addLongTermTaskInDB", () => {
  it("指定したidを目印に作成したタスクを返す", async () => {
    const plan = {
      user_id: "user-id",
      id: "plan-id",
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

    const result = await addLongTermTaskInDB(
      "plan-id",
      "task-text",
      0
    )

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenNthCalledWith(1, "long_term_plans")
    expect(mockedFrom).toHaveBeenNthCalledWith(2, "long_term_tasks")

    expect(mockEq).toHaveBeenNthCalledWith(1, 
      "user_id",
      "user-id"
    )
    expect(mockEq).toHaveBeenNthCalledWith(2, 
      "id",
      "plan-id"
    )
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: "user-id",
      plan_id: "plan-id",
      text: "task-text",
      order_index: 0
    })
    expect(result).toEqual(task)
  })
})

describe("updateLongTermGoalInDB", () => {
  it("指定したidを目印にrecordの目標を更新する", async () => {
    await updateLongTermGoalInDB(
      "study goal",
      "record-id"
    )
    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenCalledWith("long_term_plans")

    expect(mockEq).toHaveBeenCalledWith(
      "user_id",
      "user-id"
    )
    expect(mockExecute).toHaveBeenCalledWith(
      "id",
      "record-id"
    )
    expect(mockUpdate).toHaveBeenCalledWith({
      goal: "study goal"
    })
  })
})

describe("updateLongTermEndDateInDB", () => {
  it("指定したidを目印にrecordの終了日を更新する", async () => {
    await updateLongTermEndDateInDB(
      "2026-08-02",
      "record-id"
    )
    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenCalledWith("long_term_plans")

    expect(mockEq).toHaveBeenCalledWith(
      "user_id",
      "user-id"
    )
    expect(mockExecute).toHaveBeenCalledWith(
      "id",
      "record-id"
    )
    expect(mockUpdate).toHaveBeenCalledWith({
      end_date: "2026-08-02"
    })
  })
})

describe("updateLongTermStartDateInDB", () => {
  it("指定したidを目印にrecordの開始日を更新する", async () => {
    await updateLongTermStartDateInDB(
      "2026-05-09",
      "record-id"
    )
    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenCalledWith("long_term_plans")

    expect(mockEq).toHaveBeenCalledWith(
      "user_id",
      "user-id"
    )
    expect(mockExecute).toHaveBeenCalledWith(
      "id",
      "record-id"
    )
    expect(mockUpdate).toHaveBeenCalledWith({
      start_date: "2026-05-09"
    })
  })
})

describe("updateLongTermReflectionInDB", () => {
  it("指定したidを目印にrecordの振り返りを更新する", async () => {
    await updateLongTermReflectionInDB(
      "record-reflection",
      "record-id"
    )
    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenCalledWith("long_term_plans")

    expect(mockEq).toHaveBeenCalledWith(
      "user_id",
      "user-id"
    )
    expect(mockExecute).toHaveBeenCalledWith(
      "id",
      "record-id"
    )
    expect(mockUpdate).toHaveBeenCalledWith({
      reflection: "record-reflection"
    })
  })
})

describe("updateLonTermToggleInDB", () => {
  it("指定したidを目印にrecordのタグを更新する", async () => {
    await updateLongTermToggleInDB(
      false,
      "record-id"
    )
    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenCalledWith("long_term_plans")

    expect(mockEq).toHaveBeenCalledWith(
      "user_id",
      "user-id"
    )
    expect(mockExecute).toHaveBeenCalledWith(
      "id",
      "record-id"
    )
    expect(mockUpdate).toHaveBeenCalledWith({
      completed: true
    })
  })
})

describe("updateLongTermTaskTitleInDB", () => {
  it("指定したidを目印にタスク名を更新する", async () => {
    await updateLongTermTaskTitleInDB(
      "task-text",
      "task-id"
    )
    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenCalledWith("long_term_tasks")

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

describe("updateLongTermTaskToggleInDB", () => {
  it("指定したidを目印にタスクのタグを更新する", async () => {
    await updateLongTermTaskToggleInDB(
      true,
      "task-id"
    )
    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenCalledWith("long_term_tasks")

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

describe("deleteLongTermTaskInDB", () => {
  it("指定したidを目印にタスクを削除する", async () => {
    await deleteLongTermTaskInDB("task-id")

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenCalledWith("long_term_tasks")

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

describe("getCurrentLongTermPlanInDB", () => {
  it("進行中のplanとそのタスクをDBから持ってくる", async () => {
    const plan = {
      user_id: "user-id",
      id: "plan-id",
      completed: false
    }
    const task = {
      user_id: "user-id",
      plan_id: "plan-id"
    }

    mockEq.mockReturnValueOnce({
      eq: mockEq
    })
    mockEq.mockReturnValueOnce({
      maybeSingle: mockMaybeSingle
    })
    mockMaybeSingle.mockResolvedValueOnce({
      data: plan,
      error: null
    })
    mockExecute.mockResolvedValueOnce({
      data: task,
      error: null
    })
    const result = await getCurrentLongTermPlanInDB()

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenNthCalledWith(1, "long_term_plans")
    expect(mockedFrom).toHaveBeenNthCalledWith(2, "long_term_tasks")

    expect(mockEq).toHaveBeenNthCalledWith(1, 
      "user_id",
      "user-id"
    )
    expect(mockEq).toHaveBeenNthCalledWith(2, 
      "completed",
      false
    )
    expect(mockEq).toHaveBeenNthCalledWith(3, 
      "user_id",
      "user-id"
    )
    expect(result).toEqual({
      currentPlan: plan,
      tasksData: task
    })
  })

  it("進行中のplanがない場合はnullと空配列を返す", async () => {
    mockEq.mockReturnValueOnce({
      eq: mockEq
    })
    mockEq.mockReturnValueOnce({
      maybeSingle: mockMaybeSingle
    })
    mockMaybeSingle.mockResolvedValueOnce({
      data: null,
      error: null
    })
    const result = await getCurrentLongTermPlanInDB()

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenCalledWith("long_term_plans")

    expect(mockEq).toHaveBeenNthCalledWith(1, 
      "user_id",
      "user-id"
    )
    expect(mockEq).toHaveBeenNthCalledWith(2, 
      "completed",
      false
    )
    expect(result).toEqual({
      currentPlan: null,
      tasksData: []
    })
  })
})

describe("createInitialLongTermPlanInDB", () => {
  it("代入した開始日と終了日を元に作成したplanを返す", async () => {
    const plan = {
      user_id: "user-id",
      start_date: "2026-08-07",
      end_date: "2027-10-07",
      reflection: "",
      goal: ""
    }
    mockSingle.mockResolvedValueOnce({
      data: plan,
      error: null
    })
    const result = await createInitialLongTermPlanInDB(
      "2026-08-07",
      "2027-10-07"
    )

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenCalledWith("long_term_plans")

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: "user-id",
      start_date: "2026-08-07",
      end_date: "2027-10-07",
      reflection: "",
      goal: ""
    })
    expect(result).toEqual(plan)
  })
})

describe("getMonthlyPlansInLongTerm", () => {
  it("進行中のrecordの期間内に達成したmonthlyタスクをDBから持ってくる", async () => {
    const firstPlan = {
      user_id: "user-id",
      id: "firstPlan-id",
      month_start: "2026-05-01",
      month_end: "2026-05-31"
    }
    const secondPlan = {
      user_id: "user-id",
      id: "secondPlan-id",
      month_start: "2026-06-01",
      month_end: "2026-06-30"
    }
    const firstTask = {
      user_id: "user-id",
      plan_id: "firstPlan-id"
    }
    const secondTask = {
      user_id: "user-id",
      plan_id: "secondPlan-id"
    }

    mockLte.mockResolvedValueOnce({
      data: [firstPlan, secondPlan],
      error: null
    })
    mockIn.mockResolvedValueOnce({
      data: [firstTask, secondTask],
      error: null
    })
    const result = await getMonthlyPlansInLongTerm(
      "2026-04-01",
      "2026-07-02"
    )

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
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
      "2026-04-01"
    )
    expect(mockLte).toHaveBeenCalledWith(
      "month_end",
      "2026-07-02"
    )
    expect(mockIn).toHaveBeenCalledWith(
      "plan_id",
      [firstPlan.id, secondPlan.id]
    )
    expect(result).toEqual({
      plansData: [firstPlan, secondPlan],
      tasksData: [firstTask, secondTask]
    })
  })

  it("進行中のrecordがない場合は空配列を返す", async () => {
    mockLte.mockResolvedValueOnce({
      data: [],
      error: null
    })
    const result = await getMonthlyPlansInLongTerm(
      "2026-05-05",
      "2027-05-05"
    )

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenCalledWith("monthly_plans")

    expect(mockEq).toHaveBeenCalledWith(
      "user_id",
      "user-id"
    )
    expect(mockGte).toHaveBeenCalledWith(
      "month_start",
      "2026-05-05"
    )
    expect(mockLte).toHaveBeenCalledWith(
      "month_end",
      "2027-05-05"
    )
    expect(result).toEqual({
      plansData: [],
      tasksData: []
    })
  })
})