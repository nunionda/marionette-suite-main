import type { Context } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"

interface ApiError extends Error {
  status?: number
  code?: string
}

export const errorHandler = (err: Error, c: Context): Response => {
  const apiError = err as ApiError
  const status = apiError.status ?? 500
  const code = apiError.code ?? "INTERNAL_SERVER_ERROR"

  if (status >= 500) {
    console.error(`[API Error] ${err.message}`, err.stack)
  }

  return c.json(
    {
      error: {
        code,
        message: err.message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      },
    },
    status as ContentfulStatusCode,
  )
}

export class AppError extends Error {
  readonly status: number
  readonly code: string

  constructor(message: string, status: number, code: string) {
    super(message)
    this.name = "AppError"
    this.status = status
    this.code = code
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`, 404, "NOT_FOUND")
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR")
  }
}
