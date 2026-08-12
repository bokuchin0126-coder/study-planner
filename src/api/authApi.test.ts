import { beforeEach, describe, expect, it, vi } from "vitest"
import { supabase } from "../lib/supabase"
import {
  getCurrentUser,
  signUp,
  signIn,
  signOut,
  deleteAccount
} from "./authApi"

vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn()
    }
  }
}))

const mockedGetUser = vi.mocked(supabase.auth.getUser)
const mockedSignUp = vi.mocked(supabase.auth.signUp)
const mockedSignIn = vi.mocked(supabase.auth.signInWithPassword)

beforeEach(() => {
  vi.clearAllMocks()
})

describe("getCurrentUser", () => {
    it("ログイン中のユーザーを取得できる", async () => {
        const user = {
            id: "user-123",
            email: "test@example.com"
        }

        mockedGetUser.mockResolvedValue({
            data: { user },
            error: null
        } as any)

        const result = await getCurrentUser()

        expect(result).toBe(user)
    })

    it("Supabaseでエラーが発生したらエラーを投げる", async () => {
        const error = new Error("取得に失敗しました")

        mockedGetUser.mockResolvedValue({
            data: { user: null },
            error
        } as any)

        await expect(getCurrentUser()).rejects.toThrow(error)
    })

    it("ユーザーが存在しない場合はログインを要求する", async () => {
        mockedGetUser.mockResolvedValue({
            data: { user: null },
            error: null
        } as any)

        await expect(getCurrentUser()).rejects.toThrow("ログインしてください")
    })
})

describe("signUp", () => {
  it("ユーザーを新規登録できる", async () => {
    const user = {
      id: "user-123",
      email: "test@example.com"
    }

    mockedSignUp.mockResolvedValue({
      data: { user },
      error: null
    } as any)

    await expect(
      signUp("test@example.com", "password123")
    ).resolves.toBeUndefined()

    expect(mockedSignUp).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123"
    })
  })

  it("Supabaseでエラーが発生したらエラーを投げる", async () => {
    const error = new Error("登録に失敗しました")

    mockedSignUp.mockResolvedValue({
      data: { user: null },
      error
    } as any)

    await expect(
      signUp("test@example.com", "password")
    ).rejects.toThrow(error)
  })

  it("SupabaseのsignUpが正しい値で呼ばれる", async () => {
    const user = {
      id: "user-123",
      email: "test@example.com"
    }
    mockedSignUp.mockResolvedValue({
      data: { user },
      error: null
    } as any)

    await signUp(
      "test@example.com",
      "password123"
    )

    expect(mockedSignUp).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123"
    })
  })
})

describe("signIn", () => {
  it("ユーザーがログインできる", async () => {
    const user = {
      id: "user-123",
      email: "test@example.com"
    }
    mockedSignIn.mockResolvedValue({
      data: { user },
      error: null
    } as any)

    await signIn("test@example.com", "password123")

    expect(mockedSignIn).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123"
    })
  })

  it("Supabaseでエラーが発生したらエラーを投げる", async () => {
    const error = new Error("ログインに失敗しました")

    mockedSignIn.mockResolvedValue({
      data: { user: null },
      error
    } as any)

    await expect(
      signIn("test@example.com", "password123")
    ).rejects.toThrow(error)
  })

  it("SupabaseのsignInが正しい値で呼ばれる", async () => {
    const user = {
      id: "user-123",
      email: "test@example.com"
    }
    mockedSignIn.mockResolvedValue({
      data: { user },
      error: null
    } as any)

    await signIn(
      "test@example.com",
      "password123"
    )

    expect(mockedSignIn).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123"
    })
  })
}) 