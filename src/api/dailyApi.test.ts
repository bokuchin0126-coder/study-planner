import { describe, expect, it, vi, beforeEach } from "vitest"
import getCurrentUser from "../lib/auth"
import { supabase } from "../lib/supabase"
import {
  createFirstDailyTaskInDB,
  addDailyTaskInDB,
  updateDailyTaskTitleInDB,
  updateDailyTaskToggleInDB,
  deleteDailyCopyTaskInDB,
  daleteDailyTaskInDB,
  updateDailyRecordReflectionInDB,
  carryOverDailyTasksInDB,
  getDailyRecords,
  activateCarryOverTasks
} from "./dailyApi"


const getDate = (yearOffset = 0, monthOffset = 0, dayOffset = 0) => {
  const date = new Date()

  date.setFullYear(date.getFullYear() + yearOffset)
  date.setMonth(date.getMonth() + monthOffset)
  date.setDate(date.getDate() + dayOffset)

  return date.toISOString().split("T")[0]
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
const mockLt = vi.fn()
const mockNot = vi.fn()

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
    lt: mockLt,
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
    lt: mockLt,
    not: mockNot,
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

describe("createFirstDailyTaskInDB", () => {
  it("プランと最初のタスクを作成し、作成したタスクを返せる", async () => {
    const plan = {
      id: "plan-id",
    }

    const task = {
      id: "task-id",
      text: "Study React",
      plan_id: "plan-id",
      order_index: 0,
    }

    mockSingle
      .mockResolvedValueOnce({
        data: plan,
        error: null,
      })
      .mockResolvedValueOnce({
        data: task,
        error: null,
      })

    const result = await createFirstDailyTaskInDB(
      "Study React",
      "2026-08-03",
      0
    )

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)

    expect(mockedFrom).toHaveBeenNthCalledWith(1, "daily_plans")
    expect(mockedFrom).toHaveBeenNthCalledWith(2, "daily_tasks")

    expect(mockInsert).toHaveBeenNthCalledWith(1, {
      user_id: "user-id",
      date: "2026-08-03",
      reflection: "",
    })

    expect(mockInsert).toHaveBeenNthCalledWith(2, {
      user_id: "user-id",
      plan_id: "plan-id",
      text: "Study React",
      order_index: 0,
    })

    expect(result).toEqual(task)
  })
})

describe("addDailyTaskInDB", () => {
  it("指定したプランのidを目印に作成したタスクを返せる", async () => {
    const plan = {
      id: "plan-id"
    }

    const task = {
      id: "task-id",
      text: "Study React",
      plan_id: "plan-id",
      order_index: 0,
    }
    mockEq.mockReturnValueOnce({
      eq: mockEq
    })
    mockEq.mockReturnValueOnce({
      single: mockSingle
    })

    mockSingle
      .mockResolvedValueOnce({
        data: plan,
        error: null,
      })
      .mockResolvedValueOnce({
        data: task,
        error: null,
      })

    const result = await addDailyTaskInDB(
      "Study React",
      "2026-08-03",
      0
    )

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)

    expect(mockedFrom).toHaveBeenNthCalledWith(1, "daily_plans")
    expect(mockedFrom).toHaveBeenNthCalledWith(2, "daily_tasks")

    expect(mockEq).toHaveBeenNthCalledWith(
      1,
      "user_id",
      "user-id"
    )
    expect(mockEq).toHaveBeenNthCalledWith(
      2,
      "date",
      "2026-08-03"
    )

    expect(mockInsert).toHaveBeenNthCalledWith(1, {
      user_id: "user-id",
      plan_id: "plan-id",
      text: "Study React",
      order_index: 0,
    })

    expect(result).toEqual(task)
  })
})

describe("updateDailyTaskTitleInDB", () => {
  it("指定したidを目印にタスクのテキストを更新する", async () => {
    await updateDailyTaskTitleInDB(
      "task-id",
      "Completed React"
    )

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenCalledWith("daily_tasks")
    expect(mockEq).toHaveBeenCalledWith(
      "user_id",
      "user-id"
    )
    expect(mockExecute).toHaveBeenCalledWith(
      "id",
      "task-id"
    )
    expect(mockUpdate).toHaveBeenCalledWith({ text: "Completed React" })
  })
})

describe("updateDailyTaskToggleInDB", () => {
  it("指定したidを目印にタスクのタグを更新する", async () => {
    await updateDailyTaskToggleInDB(
      "task-id",
      true
    )

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenCalledWith("daily_tasks")

    expect(mockEq).toHaveBeenCalledWith(
      "user_id",
      "user-id"
    )
    expect(mockExecute).toHaveBeenCalledWith(
      "id",
      "task-id"
    )
    expect(mockUpdate).toHaveBeenCalledWith({ completed: false})
  })
})

describe("deleteDailyCopyTaskInDB", () => {
  it("指定した複数のidを目印に削除したタスクを返せる", async () => {
    const task = [{
      user_id: "user-id",
      id: "task-id",
      source_task_id: "source-task-id"
    }]
    mockEq.mockReturnValueOnce({
      eq: mockEq
    })
    mockEq.mockReturnValueOnce({
      select: mockSelect
    })
    mockSelect.mockResolvedValueOnce({
      data: task,
      error: null
    })
    const result = await deleteDailyCopyTaskInDB("source-task-id")

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenCalledWith("daily_tasks")

    expect(mockEq).toHaveBeenNthCalledWith(1,
      "user_id",
      "user-id"
    )
    expect(mockEq).toHaveBeenNthCalledWith(2,
      "source_task_id",
      "source-task-id"
    )
    expect(mockDelete).toHaveBeenCalledTimes(1)
    expect(result).toEqual(task)
  })
})

describe("daleteDailyTaskInDB", () => {
  it("指定したidを目印にタスクを削除する", async () => {
    await daleteDailyTaskInDB("task-id")

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenCalledWith("daily_tasks")

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

describe("updateDailyRecordReflectionInDB", () => {
  it("指定したdateを目印にレコードの振り返りを更新する", async () => {
    await updateDailyRecordReflectionInDB(
      "Update Record",
      "2026-05-16"
    )

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenCalledWith("daily_plans")

    expect(mockEq).toHaveBeenCalledWith(
      "user_id",
      "user-id"
    )
    expect(mockExecute).toHaveBeenCalledWith(
      "date",
      "2026-05-16"
    )
    expect(mockUpdate).toHaveBeenCalledWith({ reflection: "Update Record"})
  })
})

describe("carryOverDailyTasksInDB", () => {
  it("指定したidのコピータスクがすでにある場合はnullを返す", async () => {
    const carryTask = {
      id: "carryTask-id",
      created_at: "",
      user_id: "user-id",
      plan_id: "",
      text: "Copy This",
      completed: false,
      order_index: 0,
      source_task_id: ""
    }
    const maybePlan = {
      user_id: "user-id",
      id: "plan-id",
      date: getDate(0, 0, 1)
    }
    const maybeTask = {
      id: "task-id",
      plan_id: "plan-id",
      source_task_id: "carryTask-id",
    }

    mockEq.mockReturnValueOnce({
      eq: mockEq
    })
    mockEq.mockReturnValueOnce({
      maybeSingle: mockMaybeSingle
    })
    mockEq.mockReturnValueOnce({
      eq: mockEq
    })
    mockEq.mockReturnValueOnce({
      eq: mockEq
    })
    mockEq.mockReturnValueOnce({
      maybeSingle: mockMaybeSingle
    })
    
    mockMaybeSingle.mockResolvedValueOnce({
      data: maybePlan,
      error: null
    })
    mockMaybeSingle.mockResolvedValueOnce({
      data: maybeTask,
      error: null
    })
    
    const result = await carryOverDailyTasksInDB(
      carryTask,
      getDate(0, 0, 1),
      0  
    )

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenNthCalledWith(1, "daily_plans")
    expect(mockedFrom).toHaveBeenNthCalledWith(2, "daily_tasks")

    expect(mockEq).toHaveBeenNthCalledWith(1,
      "user_id",
      "user-id"
    )
    expect(mockEq).toHaveBeenNthCalledWith(2,
      "date",
      getDate(0, 0, 1)
    )
    expect(mockEq).toHaveBeenNthCalledWith(3,
      "user_id",
      "user-id"
    )
    expect(mockEq).toHaveBeenNthCalledWith(4,
      "plan_id",
      "plan-id"
    )
    expect(mockEq).toHaveBeenNthCalledWith(5,
      "source_task_id",
      "carryTask-id"
    )
    expect(mockInsert).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it("指定したidのタスクを明日のplanへコピーしたタスクを返す", async () => {
    const carryTask = {
      id: "carryTask-id",
      created_at: "",
      user_id: "user-id",
      plan_id: "",
      text: "Copy This",
      completed: false,
      order_index: 0,
      source_task_id: ""
    }
    const plan = {
      id: "plan-id",
      user_id: "user-id",
      date: getDate(0, 0, 1),
      reflection: "Plan"
    }
    const task = {
      user_id: "user-id",
      plan_id: "plan-id",
      text: "Copy This",
      source_task_id: "carryTask-id",
      order_index: 0
    }

    mockEq.mockReturnValueOnce({
      eq: mockEq
    })
    mockEq.mockReturnValueOnce({
      maybeSingle: mockMaybeSingle
    })
    mockEq.mockReturnValueOnce({
      eq: mockEq
    })
    mockEq.mockReturnValueOnce({
      eq: mockEq
    })
    mockEq.mockReturnValueOnce({
      maybeSingle: mockMaybeSingle
    })
    mockSingle.mockResolvedValueOnce({
      data: plan,
      error: null
    })
    mockSingle.mockResolvedValueOnce({
      data: task,
      error: null
    })

    const result = await carryOverDailyTasksInDB(
      carryTask,
      getDate(0, 0, 1),
      0  
    )
    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenNthCalledWith(1, "daily_plans")
    expect(mockedFrom).toHaveBeenNthCalledWith(2, "daily_plans")
    expect(mockedFrom).toHaveBeenNthCalledWith(3, "daily_tasks")
    expect(mockedFrom).toHaveBeenNthCalledWith(4, "daily_tasks")

    expect(mockEq).toHaveBeenNthCalledWith(1,
      "user_id",
      "user-id"
    )
    expect(mockEq).toHaveBeenNthCalledWith(2,
      "date",
      getDate(0, 0, 1)
    )
    expect(mockEq).toHaveBeenNthCalledWith(3,
      "user_id",
      "user-id"
    )
    expect(mockEq).toHaveBeenNthCalledWith(4,
      "plan_id",
      "plan-id"
    )
    expect(mockEq).toHaveBeenNthCalledWith(5,
      "source_task_id",
      "carryTask-id"
    )
    expect(mockInsert).toHaveBeenNthCalledWith(1, {
      user_id: "user-id",
      date: getDate(0, 0, 1),
      reflection: ""
    })
    expect(mockInsert).toHaveBeenNthCalledWith(2, {
      user_id: "user-id",
      plan_id: "plan-id",
      text: "Copy This",
      source_task_id: "carryTask-id",
      order_index: 0
    })
    expect(result).toEqual(task)
  })
})

describe("getDailyRecords", () => {
  it("指定した日付分のplanデータとタスクデータをDBから持ってくる", async () => {
    const todayPlan = {
      user_id: "user-id",
      id: "today",
      date: getDate()
    }
    const yesterdayPlan = {
      user_id: "user-id",
      id: "yesterday",
      date: getDate(0, 0, -1)
    }
    const tomorrowPlan = {
      user_id: "user-id",
      id: "tomorrow",
      date: getDate(0, 0, 1)
    }
    const todayTask = {
      user_id: "user-id",
      plan_id: "today",
    }
    const yesterdayTask = {
      user_id: "user-id",
      plan_id: "yesterday",
    }
    const tomorrowTask = {
      user_id: "user-id",
      plan_id: "tomorrow",
    }

    mockIn.mockResolvedValueOnce({
      data: [todayPlan, yesterdayPlan, tomorrowPlan],
      error: null
    })
    mockIn.mockResolvedValueOnce({
      data: [todayTask, yesterdayTask, tomorrowTask],
      error: null
    })
    const result = await getDailyRecords(
      getDate(),
      getDate(0, 0, 1),
      getDate(0, 0, -1)
    )

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenNthCalledWith(1, "daily_plans")
    expect(mockedFrom).toHaveBeenNthCalledWith(2, "daily_tasks")

    expect(mockEq).toHaveBeenNthCalledWith(1,
      "user_id",
      "user-id"
    )
    expect(mockEq).toHaveBeenNthCalledWith(2,
      "user_id",
      "user-id"
    )

    expect(mockIn).toHaveBeenNthCalledWith(1,
      "date",
      [getDate(), getDate(0, 0, 1), getDate(0, 0, -1)]
    )
    expect(mockIn).toHaveBeenNthCalledWith(2,
      "plan_id",
      ["today", "yesterday", "tomorrow"]
    )
    expect(result).toEqual({
      planData: [todayPlan, yesterdayPlan, tomorrowPlan],
      tasksData: [todayTask, yesterdayTask, tomorrowTask]
    })
  })
})

describe("activateCarryOverTasks", () => {
  it("今日へ昇格したコピータスクのコピーidをnullにする", async () => {
    const plan = {
      user_id: "user-id",
      id: "plan-id",
      date: getDate()
    }
    const task = {
      user_id: "user-id",
      plan_id: "plan-id",
      source_task_id: "task-id"
    }

    mockEq.mockReturnValueOnce({
      eq: mockEq
    })
    mockEq.mockReturnValueOnce({
      maybeSingle: mockMaybeSingle
    })
    mockEq.mockReturnValueOnce({
      eq: mockEq
    })
    mockEq.mockReturnValueOnce({
      not: mockNot
    })
    mockMaybeSingle.mockResolvedValueOnce({
      data: plan,
      error: null
    })
    mockNot.mockResolvedValueOnce({
      error: null
    })

    await activateCarryOverTasks(getDate())

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenNthCalledWith(1, "daily_plans")
    expect(mockedFrom).toHaveBeenNthCalledWith(2, "daily_tasks")

    expect(mockEq).toHaveBeenNthCalledWith(1,
      "user_id",
      "user-id"
    )
    expect(mockEq).toHaveBeenNthCalledWith(2,
      "date",
      getDate()
    )
    expect(mockEq).toHaveBeenNthCalledWith(3,
      "user_id",
      "user-id"
    )
    expect(mockEq).toHaveBeenNthCalledWith(4,
      "plan_id",
      "plan-id"
    )
    expect(mockUpdate).toHaveBeenCalledWith({
      source_task_id: null
    })
    expect(mockNot).toHaveBeenCalledWith(
      "source_task_id",
      "is",
      null
    )
  })

  it("今日のデータがない場合はreturnする", async () => {
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
    const result = await activateCarryOverTasks(getDate())

    expect(result).toBeUndefined()
    expect(mockUpdate).not.toHaveBeenCalled(),
    expect(mockNot).not.toHaveBeenCalled()
  })
})