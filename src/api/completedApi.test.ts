import { describe, expect, it, vi, beforeEach } from "vitest"
import getCurrentUser from "../lib/auth"
import { supabase } from "../lib/supabase"
import {
  getCompltedDailyDataInDB,
  getCompltedWeeklyDataInDB,
  getCompltedMonthlyDataInDB,
  getCompltedLongTermDataInDB
} from "./completedApi"


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

const mockSelect = vi.fn()
const mockEq = vi.fn()


beforeEach(() => {
  vi.clearAllMocks()

  mockedGetCurrentUser.mockResolvedValue({
    id: "user-id",
  } as any)

  mockSelect.mockReturnValue({
    eq: mockEq,
  })

  mockedFrom.mockReturnValue({
    select: mockSelect
  } as any)
})

describe("getCompltedDailyDataInDB", () => {
  it("dailyからplanと達成したタスクを取り出す", async () => {
    const plan = {
      user_id: "user-id"
    }
    const task = {
      user_id: "user-id"
    }
    mockEq.mockResolvedValueOnce({
      data: [plan],
      error: null
    })
    mockEq.mockResolvedValueOnce({
      data: [task],
      error: null
    })

    const result = await getCompltedDailyDataInDB()

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
    expect(result).toEqual({
      plansData: [plan],
      tasksData: [task]
    })
  })
})

describe("getCompltedWeeklyDataInDB", () => {
  it("weeklyからplanと達成したタスクを取り出す", async () => {
    const plan = {
      user_id: "user-id"
    }
    const task = {
      user_id: "user-id"
    }
    mockEq.mockResolvedValueOnce({
      data: [plan],
      error: null
    })
    mockEq.mockResolvedValueOnce({
      data: [task],
      error: null
    })

    const result = await getCompltedWeeklyDataInDB()

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
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
    expect(result).toEqual({
      plansData: [plan],
      tasksData: [task]
    })
  })
})

describe("getCompltedMonthlyDataInDB", () => {
  it("monthlyからplanと達成したタスクを取り出す", async () => {
    const plan = {
      user_id: "user-id"
    }
    const task = {
      user_id: "user-id"
    }
    mockEq.mockResolvedValueOnce({
      data: [plan],
      error: null
    })
    mockEq.mockResolvedValueOnce({
      data: [task],
      error: null
    })

    const result = await getCompltedMonthlyDataInDB()

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
    expect(result).toEqual({
      plansData: [plan],
      tasksData: [task]
    })
  })
})

describe("getCompltedLongTermDataInDB", () => {
  it("longTermからplanと達成したタスクを取り出す", async () => {
    const plan = {
      user_id: "user-id"
    }
    const task = {
      user_id: "user-id"
    }
    mockEq.mockResolvedValueOnce({
      data: [plan],
      error: null
    })
    mockEq.mockResolvedValueOnce({
      data: [task],
      error: null
    })

    const result = await getCompltedLongTermDataInDB()

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedFrom).toHaveBeenNthCalledWith(1, "long_term_plans")
    expect(mockedFrom).toHaveBeenNthCalledWith(2, "long_term_tasks")

    expect(mockEq).toHaveBeenNthCalledWith(1, 
      "user_id",
      "user-id"
    )
    expect(mockEq).toHaveBeenNthCalledWith(2, 
      "user_id",
      "user-id"
    )
    expect(result).toEqual({
      plansData: [plan],
      tasksData: [task]
    })
  })
})