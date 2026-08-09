import { describe, expect, it, vi, beforeEach } from "vitest"
import getCurrentUser from "./authApi"
import { supabase } from "../lib/supabase"
import { getNextOrderIndex } from "./orderIndexApi"


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
const mockMaybeSingle = vi.fn()

beforeEach(() => {
  mockedGetCurrentUser.mockResolvedValue({
    id: "user-id",
  } as any)

  mockedFrom.mockReturnValue({
    select: mockSelect
  } as any)

  mockSelect.mockReturnValue({
    eq: mockEq
  })
})

describe("getNextOrderIndex", () => {
  it("渡したテーブルの現在のタスク数を返す", async () => {
    const plan = {
      user_id: "user-id",
      id: "plan-id",
      date: "2026-05-06"
    }
    const task1 = {
      user_id: "user-id",
      plan_id: "plan-id",
      order_index: 0
    }
    const task2 = {
      user_id: "user-id",
      plan_id: "plan-id",
      order_index: 1
    }
    const task3 = {
      user_id: "user-id",
      plan_id: "plan-id",
      order_index: 2
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
    mockEq.mockReturnValueOnce({
      eq: mockEq
    })
    mockEq.mockResolvedValueOnce({
      data: [task1, task2, task3],
      error: null
    })

    const result = await getNextOrderIndex(
      "daily_plans",
      "daily_tasks",
      "date",
      "2026-05-06"
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
      "2026-05-06"
    )
    expect(mockEq).toHaveBeenNthCalledWith(3, 
      "user_id",
      "user-id"
    )
    expect(mockEq).toHaveBeenNthCalledWith(4, 
      "plan_id",
      "plan-id"
    )
    expect(mockSelect).toHaveBeenCalledWith("order_index")

    expect(result).toBe(3)
  })
})