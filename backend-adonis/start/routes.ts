/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import LoginController from '#controllers/auth/login_controller'
import DashboardController from '#controllers/dashboard_controller'
import AdminConfigurationController from '#controllers/admin_configurations_controller'

router.get('/', () => {
  return { status: 'API is running' }
})

router.group(() => {

    router.post('/login', [LoginController, 'login']).as('login.store') 
    router.post('/logout', [LoginController, 'logout']).as('login.destroy')
}).as('auth')

// --- Rutas Protegidas por Rol ---

// 1. Administrador
router.group(() => {
    router.get('/dashboard', [DashboardController, 'admin']).as('admin.dashboard')
    router.get('/inventory', [DashboardController, 'adminInventory']).as('admin.inventory')
    router.get('/reports',   [DashboardController, 'adminReports']).as('admin.reports')
    router.get('/configuration', [AdminConfigurationController, 'index']).as('admin.configuration')
})
.prefix('/admin')
.as('admin')
.use([middleware.auth(), middleware.role(['admin'])])

// 2. Auxiliar
router.group(() => {
    router.get('/dashboard',   [DashboardController, 'auxiliar']).as('auxiliar.dashboard')
    router.get('/operations',  [DashboardController, 'auxiliarOperations']).as('auxiliar.operations')
})
.prefix('/auxiliar')
.as('auxiliar')
.use([middleware.auth(), middleware.role(['auxiliar'])])

// 3. Staff Interno
router.group(() => {
    router.get('/dashboard', [DashboardController, 'staffInterno']).as('staff_interno.dashboard')
    router.get('/about',     [DashboardController, 'staffInternoAbout']).as('staff_interno.about')
})
.prefix('/staff-internal')
.as('staff_interno')
.use([middleware.auth(), middleware.role(['staff_interno'])])

// --- Rutas de IA y Chatbot (Protegidas) ---
const RagController = () => import('#controllers/rag_controller')

router.group(() => {
    router.post('/chat', [RagController, 'chat']).as('rag.chat')

    router.post('/vectorize', [RagController, 'vectorizeVersion']).as('rag.vectorize')
})
.prefix('/api/ai')
.use([middleware.auth()]) // Todos los roles autenticados pueden usar el chatbot
