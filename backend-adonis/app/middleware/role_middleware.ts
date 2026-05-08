import type { HttpContext } from '@adonisjs/core/http'

export default class RoleMiddleware {
  async handle({auth, response}: HttpContext, next: () => Promise<void>, guardRoles: string[]) {
    const user = auth.user
    await user?.load('role')
    if  (user?.role?.name === 'staff_externo') {
      return response.redirect('/home')
    }
    if (!user || !guardRoles.includes(user.role?.name)) {
      return response.unauthorized('No tienes permisos para acceder a esta sección.')
    }
    await next()
  }
}