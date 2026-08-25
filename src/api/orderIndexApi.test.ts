import { describe, expect, it, vi, beforeEach } from "vitest"
import { supabase } from "../lib/supabase"
import { getNextOrderIndex } from "./orderIndexApi"


vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}))

const mockedFrom = vi.mocked(supabase.from)

const mockSelect = vi.fn()
const mockEq = vi.fn()


describe("getNextOrderIndex", () => {
  it("渡したテーブルの現在のタスク数を返す", async () => {
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
    mockedFrom.mockReturnValueOnce({
      select: mockSelect
    } as any)

    mockSelect.mockReturnValueOnce({
      eq: mockEq
    })
    
    mockEq.mockReturnValueOnce({
      eq: mockEq
    })
    
    mockEq.mockResolvedValueOnce({
      data: [task1, task2, task3],
      error: null
    })

    const result = await getNextOrderIndex(
      "daily_tasks",
      "plan-id",
      "user-id"
    )

    expect(mockedFrom).toHaveBeenCalledWith("daily_tasks")

    expect(mockEq).toHaveBeenNthCalledWith(1, 
      "user_id",
      "user-id"
    )
    expect(mockEq).toHaveBeenNthCalledWith(2, 
      "plan_id",
      "plan-id"
    )

    expect(mockSelect).toHaveBeenCalledWith("order_index")

    expect(result).toBe(3)
  })
})