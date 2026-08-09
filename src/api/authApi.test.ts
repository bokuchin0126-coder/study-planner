import { describe, expect, it, vi, beforeEach } from "vitest"
import { supabase } from "../lib/supabase"
import {
  getCurrentUser,
  signUp,
  signIn,
  signOut,
  deleteAccount
} from "./authApi"


vi.mock("../lib/auth", () => ({
  default: vi.fn(),
}))

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}))

