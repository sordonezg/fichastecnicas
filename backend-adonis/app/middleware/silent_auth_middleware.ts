import type { HttpContext } from '@adonisjs/core/http'

export default class SilentAuthMiddleware {
  async handle({ auth }: HttpContext, next: () => Promise<void>) {
    await auth.check()
    await next()
  }
}