import { beforeEach, describe, expect, it, vi } from "vitest"
import { supabase } from "../lib/supabase"
import { getCurrentUser } from "./authApi"

vi.mock("../lib/supabase", () => ({
    supabase: {
        auth: {
            getUser: vi.fn(),
        },
    },
}))

const mockedGetUser = vi.mocked(supabase.auth.getUser)

describe("getCurrentUser", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("ログイン中のユーザーを取得できる", async () => {
        const user = {
            id: "user-123",
            email: "test@example.com",
        }

        mockedGetUser.mockResolvedValue({
            data: { user },
            error: null,
        } as any)

        const result = await getCurrentUser()

        expect(result).toBe(user)
    })

    it("Supabaseでエラーが発生したらエラーを投げる", async () => {
        const error = new Error("取得に失敗しました")

        mockedGetUser.mockResolvedValue({
            data: { user: null },
            error,
        } as any)

        await expect(getCurrentUser()).rejects.toThrow(error)
    })

    it("ユーザーが存在しない場合はログインを要求する", async () => {
        mockedGetUser.mockResolvedValue({
            data: { user: null },
            error: null,
        } as any)

        await expect(getCurrentUser()).rejects.toThrow("ログインしてください")
    })
})