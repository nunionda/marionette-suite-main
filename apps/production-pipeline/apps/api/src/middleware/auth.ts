import { createMiddleware } from "hono/factory"
import { verify } from "hono/jwt"
import { getCookie } from "hono/cookie"
import { AppError } from "./error-handler.ts"

export interface AuthUser {
  id: string
  email: string
}

export const authGuard = createMiddleware(async (c, next) => {
  const token = getCookie(c, "token")
  if (!token) {
    throw new AppError("Authentication required", 401, "UNAUTHORIZED")
  }

  try {
    const payload = await verify(token, process.env.JWT_SECRET || "marionette-dev-secret-change-in-production", "HS256")
    c.set("user", { id: payload.sub as string, email: payload.email as string })
  } catch {
    throw new AppError("Invalid or expired token", 401, "UNAUTHORIZED")
  }

  await next()
})
