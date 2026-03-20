import { prisma } from "@marionette/db"
import { sign } from "hono/jwt"
import { AppError, ValidationError } from "../middleware/error-handler.ts"
import type { AuthUser } from "@marionette/shared"

const JWT_SECRET = process.env.JWT_SECRET || "marionette-dev-secret-change-in-production"
const JWT_EXPIRY_SECONDS = 7 * 24 * 60 * 60 // 7 days

export { JWT_SECRET }

export async function createUser(email: string, name: string, password: string): Promise<AuthUser> {
  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new AppError("Email already registered", 409, "EMAIL_EXISTS")
  }

  const passwordHash = await Bun.password.hash(password, "argon2id")
  const user = await prisma.user.create({
    data: { email, name, passwordHash },
  })

  return { id: user.id, email: user.email, name: user.name }
}

export async function verifyCredentials(email: string, password: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS")
  }

  const valid = await Bun.password.verify(password, user.passwordHash)
  if (!valid) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS")
  }

  return { id: user.id, email: user.email, name: user.name }
}

export async function createToken(user: AuthUser): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  return sign(
    { sub: user.id, email: user.email, iat: now, exp: now + JWT_EXPIRY_SECONDS },
    JWT_SECRET
  )
}

export async function findUserById(id: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return null
  return { id: user.id, email: user.email, name: user.name }
}

// Assign orphan projects (userId = null) to the given user
export async function claimOrphanProjects(userId: string): Promise<number> {
  const result = await prisma.project.updateMany({
    where: { userId: null },
    data: { userId },
  })
  return result.count
}
