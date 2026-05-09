import type { HttpContext } from '@adonisjs/core/http'
import { loginValidator } from '#validators/auth'
import User from '#models/user'
import { errors as vineErrors } from '@vinejs/vine'
import { errors as authErrors } from '@adonisjs/auth'

export default class LoginController {
  async login({ request, response, auth }: HttpContext) {
    try {
      const { email, password } = await request.validateUsing(loginValidator)
      const user = await User.verifyCredentials(email, password)
      await user.load('role')
      
      if (user.role?.name === 'staff_externo') {
        return response.unauthorized({ message: 'Credenciales inválidas' })
      }

      await auth.use('web').login(user)
      
      const jwt = await import('jsonwebtoken')
      const sign = jwt.default?.sign || (jwt as any).sign
      
      const token = sign(
        { id: user.id, email: user.email, role: user.role?.name },
        process.env.APP_KEY || 'supersecretkey123',
        { expiresIn: '24h' }
      )
      
      const roleToNivel: Record<string, number> = {
        'admin': 1,
        'auxiliar': 2,
        'staff_interno': 3
      }

      return response.ok({
        message: 'Inicio de sesión exitoso',
        token,
        user: {
          id: user.id,
          nombre: user.name,
          email: user.email,
          role: user.role?.name,
          nivel_permiso: roleToNivel[user.role?.name || 'staff_interno'] || 3
        }
      })
    } catch (error) {
      if (
        error instanceof vineErrors.E_VALIDATION_ERROR ||
        error instanceof authErrors.E_INVALID_CREDENTIALS
      ) {
        return response.unauthorized({ message: 'Credenciales inválidas' })
      }
      console.error(error)
      return response.internalServerError({ message: 'Ocurrió un error inesperado', error: String(error), stack: error?.stack })
    }
  }

  async logout({ response, auth }: HttpContext) {
    await auth.use('web').logout()
    return response.ok({ message: 'Sesión cerrada exitosamente' })
  }
}
