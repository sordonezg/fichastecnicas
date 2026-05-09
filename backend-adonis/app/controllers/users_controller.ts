import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Role from '#models/role'

export default class UsersController {
  async index({ response }: HttpContext) {
    const users = await User.query().preload('role')
    
    // Map to frontend legacy format
    const mapped = users.map(u => ({
      id: u.id,
      nombre: u.name,
      email: u.email,
      nivel_permiso: u.role?.name === 'admin' ? 1 : (u.role?.name === 'auxiliar' ? 2 : 3)
    }))
    
    return response.json(mapped)
  }

  async store({ request, response }: HttpContext) {
    const data = request.all()
    const user = new User()
    user.name = data.nombre
    user.email = data.email
    user.password = data.password
    // map nivel_permiso to role
    const roleName = data.nivel_permiso === 1 ? 'admin' : (data.nivel_permiso === 2 ? 'auxiliar' : 'staff_interno')
    const role = await Role.findBy('name', roleName)
    user.roleId = role?.id || 1
    user.organizationId = 1
    user.isInternal = true
    await user.save()

    return response.created({ message: 'User created successfully', userId: user.id })
  }

  async update({ params, request, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const data = request.all()

    if (data.nombre) user.name = data.nombre
    if (data.email) user.email = data.email
    if (data.password) user.password = data.password
    if (data.nivel_permiso) {
      const roleName = data.nivel_permiso === 1 ? 'admin' : (data.nivel_permiso === 2 ? 'auxiliar' : 'staff_interno')
      const role = await Role.findBy('name', roleName)
      user.roleId = role?.id || 1
    }
    
    await user.save()
    
    return response.json({
      id: user.id,
      nombre: user.name,
      email: user.email,
      nivel_permiso: data.nivel_permiso || (user.roleId === 1 ? 1 : 2)
    })
  }

  async destroy({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    await user.delete()
    return response.json({ message: 'User deleted successfully' })
  }
}
