import type { HttpContext } from '@adonisjs/core/http'

export default class DashboardController {
  admin({ response }: HttpContext) {
    return response.json({ status: 'success', message: 'Admin Dashboard Data' })
  }

  adminInventory({ response }: HttpContext) {
    return response.json({ status: 'success', message: 'Admin Inventory Data' })
  }

  adminReports({ response }: HttpContext) {
    return response.json({ status: 'success', message: 'Admin Reports Data' })
  }

  auxiliar({ response }: HttpContext) {
    return response.json({ status: 'success', message: 'Auxiliar Dashboard Data' })
  }

  auxiliarOperations({ response }: HttpContext) {
    return response.json({ status: 'success', message: 'Auxiliar Operations Data' })
  }

  staffInterno({ response }: HttpContext) {
    return response.json({ status: 'success', message: 'Staff Interno Dashboard Data' })
  }

  staffInternoAbout({ response }: HttpContext) {
    return response.json({ status: 'success', message: 'Staff Interno About Data' })
  }
}