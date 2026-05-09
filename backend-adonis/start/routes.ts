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
.use([middleware.jwtAuth(), middleware.role(['admin'])])

// 2. Auxiliar
router.group(() => {
    router.get('/dashboard',   [DashboardController, 'auxiliar']).as('auxiliar.dashboard')
    router.get('/operations',  [DashboardController, 'auxiliarOperations']).as('auxiliar.operations')
})
.prefix('/auxiliar')
.as('auxiliar')
.use([middleware.jwtAuth(), middleware.role(['auxiliar'])])

// 3. Staff Interno
router.group(() => {
    router.get('/dashboard', [DashboardController, 'staffInterno']).as('staff_interno.dashboard')
    router.get('/about',     [DashboardController, 'staffInternoAbout']).as('staff_interno.about')
})
.prefix('/staff-internal')
.as('staff_interno')
.use([middleware.jwtAuth(), middleware.role(['staff_interno'])])

// --- Rutas de IA y Chatbot (Protegidas) ---
const RagController = () => import('#controllers/rag_controller')
const EventsController = () => import('#controllers/events_controller')
const VenuesController = () => import('#controllers/venues_controller')
const UsersController = () => import('#controllers/users_controller')
const LoginControllerIntegration = () => import('#controllers/auth/login_controller')

router.group(() => {
    router.post('/chat', [RagController, 'chat']).as('rag.chat')
    router.post('/vectorize', [RagController, 'vectorizeVersion']).as('rag.vectorize')
})
.prefix('/api/ai')
.use([middleware.jwtAuth()]) // Todos los roles autenticados pueden usar el chatbot

// --- API Integrada con Frontend (Fichas Técnicas) ---
router.group(() => {
    // Auth legacy support
    router.post('/auth/login', [LoginControllerIntegration, 'login'])
    router.post('/auth/logout', [LoginControllerIntegration, 'logout'])
    // UsersController store handles registration for legacy auth
    router.post('/auth/register', [UsersController, 'store'])

    // Rutas protegidas de la API
    router.group(() => {
        // Events / Fichas Técnicas
        router.get('/events', [EventsController, 'index'])
        router.post('/events', [EventsController, 'store'])
        router.put('/events/:id', [EventsController, 'update'])
        router.patch('/events/:id/status', [EventsController, 'updateStatus'])
        router.delete('/events/:id', [EventsController, 'destroy'])

        // Venues / Locations
        router.get('/venues', [VenuesController, 'index'])
        router.post('/venues', [VenuesController, 'store'])
        router.put('/venues/:id', [VenuesController, 'update'])
        router.delete('/venues/:id', [VenuesController, 'destroy'])

        // Users
        router.get('/users', [UsersController, 'index'])
        router.post('/users', [UsersController, 'store'])
        router.put('/users/:id', [UsersController, 'update'])
        router.delete('/users/:id', [UsersController, 'destroy'])

        // Catalog
        const CatalogsController = () => import('#controllers/catalogs_controller')
        router.get('/organizations', [CatalogsController, 'getOrganizations'])
        router.get('/event-types', [CatalogsController, 'getEventTypes'])
        router.get('/catalog', [CatalogsController, 'index'])
        
        router.post('/catalog', [CatalogsController, 'store'])
        router.delete('/catalog/:id', [CatalogsController, 'destroy'])
    }).use([middleware.jwtAuth()])

}).prefix('/api') // Frontend points to /api
