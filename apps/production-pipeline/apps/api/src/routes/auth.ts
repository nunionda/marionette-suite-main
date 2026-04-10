import { Hono } from "hono"
import { getCookie, setCookie, deleteCookie } from "hono/cookie"
import { verify } from "hono/jwt"
import { createUser, verifyCredentials, createToken, findUserById, claimOrphanProjects, JWT_SECRET } from "../services/auth.service.ts"
import { ValidationError } from "../middleware/error-handler.ts"
import type { LoginRequest, SignupRequest } from "@marionette/shared"

export const authRoutes = new Hono()

const COOKIE_OPTIONS = {
  httpOnly: true,
  path: "/",
  sameSite: "Lax" as const,
  maxAge: 7 * 24 * 60 * 60, // 7 days
  secure: process.env.NODE_ENV === "production",
}

authRoutes.post("/signup", async (c) => {
  const body = await c.req.json<SignupRequest>()

  if (!body.email || !body.name || !body.password) {
    throw new ValidationError("email, name, and password are required")
  }
  if (body.password.length < 6) {
    throw new ValidationError("Password must be at least 6 characters")
  }

  const user = await createUser(body.email.trim().toLowerCase(), body.name.trim(), body.password)
  const token = await createToken(user)

  // Claim any orphan projects for the first user
  const claimed = await claimOrphanProjects(user.id)
  if (claimed > 0) {
    console.log(`[Auth] Assigned ${claimed} orphan project(s) to user ${user.email}`)
  }

  setCookie(c, "token", token, COOKIE_OPTIONS)
  return c.json({ user }, 201)
})

authRoutes.post("/login", async (c) => {
  const body = await c.req.json<LoginRequest>()

  if (!body.email || !body.password) {
    throw new ValidationError("email and password are required")
  }

  const user = await verifyCredentials(body.email.trim().toLowerCase(), body.password)
  const token = await createToken(user)

  setCookie(c, "token", token, COOKIE_OPTIONS)
  return c.json({ user })
})

authRoutes.get("/me", async (c) => {
  const token = getCookie(c, "token")
  if (!token) {
    return c.json({ user: null }, 401)
  }

  try {
    const payload = await verify(token, JWT_SECRET, "HS256")
    const user = await findUserById(payload.sub as string)
    if (!user) {
      deleteCookie(c, "token", { path: "/" })
      return c.json({ user: null }, 401)
    }
    return c.json({ user })
  } catch {
    deleteCookie(c, "token", { path: "/" })
    return c.json({ user: null }, 401)
  }
})

authRoutes.post("/logout", async (c) => {
  deleteCookie(c, "token", { path: "/" })
  return c.json({ success: true })
})
