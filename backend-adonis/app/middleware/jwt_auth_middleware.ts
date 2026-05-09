import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '#models/user'
import env from '#start/env'

export default class JwtAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const authHeader = ctx.request.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ctx.response.unauthorized({ message: 'Token faltante o inválido' })
    }

    const token = authHeader.split(' ')[1]

    try {
      const jwt = await import('jsonwebtoken')
      const verify = jwt.default?.verify || (jwt as any).verify
      
      const payload = verify(token, env.get('APP_KEY') || 'supersecretkey123') as any
      
      const user = await User.find(payload.id)
      if (!user) {
        return ctx.response.unauthorized({ message: 'Usuario no encontrado' })
      }

      // Populate ctx.auth
      await user.load('role')
      await ctx.auth.use('web').login(user)

      return next()
    } catch (error) {
      return ctx.response.unauthorized({ message: 'Token inválido o expirado' })
    }
  }
}
