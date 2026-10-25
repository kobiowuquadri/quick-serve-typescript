import { INTERNAL_SERVER_ERROR } from '../constants/statusCode.js'

// Throw anywhere in a request; the error handler middleware turns it into a response with this status
export class AppError extends Error {
  readonly statusCode: number
  readonly data: unknown

  constructor(message: string, statusCode = INTERNAL_SERVER_ERROR, data: unknown = {}) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.data = data
  }
}
