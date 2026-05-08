import type { HttpContext } from '@adonisjs/core/http'

export default class AdminConfigurationsController {
    async index({ response }: HttpContext) {
        return response.json({ status: 'success', message: 'Admin Configuration Data' })
    }
}