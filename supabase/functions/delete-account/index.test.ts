import { beforeEach, describe, expect, it, vi } from "vitest"

const { mockWithSupabase, mockDeleteUser, getUserClaims } = vi.hoisted(() => {
  let userClaims: { id: string } | undefined

  return {
    mockWithSupabase: vi.fn((config: unknown, handler: Function) => {
      return async (req: Request) => {
        return handler(req, {
          userClaims,
          supabaseAdmin: {
            auth: {
              admin: {
                deleteUser: mockDeleteUser,
              },
            },
          },
        })
      }
    }),

    mockDeleteUser: vi.fn(),

    getUserClaims: {
      get value() {
        return userClaims
      },
      set value(value: { id: string } | undefined) {
        userClaims = value
      },
    },
  }
})

vi.mock("npm:@supabase/server", () => ({
  withSupabase: mockWithSupabase,
}))

import handler from "./index"

describe("delete-account", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUserClaims.value = undefined
  })

  it("OPTIONSリクエストには200を返す", async () => {
    const req = new Request("http://localhost", {
      method: "OPTIONS",
    })

    const response = await handler.fetch(req)

    expect(response.status).toBe(200)
  })

  it("ログインしていない場合は401を返す", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
    })

    const response = await handler.fetch(req)

    expect(response.status).toBe(401)
    expect(mockDeleteUser).not.toHaveBeenCalled()
  })

  it("ログインユーザーのアカウントを削除できた場合は200を返す", async () => {
    getUserClaims.value = {
      id: "user-123",
    }

    mockDeleteUser.mockResolvedValue({
      error: null,
    })

    const req = new Request("http://localhost", {
      method: "POST",
    })

    const response = await handler.fetch(req)

    expect(mockDeleteUser).toHaveBeenCalledWith("user-123")
    expect(response.status).toBe(200)
  })

  it("アカウント削除に失敗した場合は500を返す", async () => {
    getUserClaims.value = {
      id: "user-123",
    }

    mockDeleteUser.mockResolvedValue({
      error: new Error("delete failed"),
    })

    const req = new Request("http://localhost", {
      method: "POST",
    })

    const response = await handler.fetch(req)

    expect(mockDeleteUser).toHaveBeenCalledWith("user-123")
    expect(response.status).toBe(500)
  })
})