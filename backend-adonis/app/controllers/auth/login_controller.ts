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
      
      return response.ok({
        message: 'Inicio de sesión exitoso',
        user: {
          id: user.id,
          email: user.email,
          role: user.role?.name
        }
      })
    } catch (error) {
      if (
        error instanceof vineErrors.E_VALIDATION_ERROR ||
        error instanceof authErrors.E_INVALID_CREDENTIALS
      ) {
        return response.unauthorized({ message: 'Credenciales inválidas' })
      }
      return response.internalServerError({ message: 'Ocurrió un error inesperado' })
    }
  }

  async logout({ response, auth }: HttpContext) {
    await auth.use('web').logout()
    return response.ok({ message: 'Sesión cerrada exitosamente' })
  }
}
