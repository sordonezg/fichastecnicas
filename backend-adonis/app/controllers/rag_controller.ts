import { HttpContext } from '@adonisjs/core/http'
import { RagService } from '#services/rag_service'

export default class RagController {
  /**
   * Endpoint para el chatbot
   * Recibe { message: "pregunta" } y devuelve { response: "respuesta" }
   */
  async chat({ request, response }: HttpContext) {
    const userMessage = request.input('message')
    
    if (!userMessage) {
      return response.badRequest({ error: 'El mensaje es requerido' })
    }

    try {
      const ragService = new RagService()
      const answer = await ragService.chatRAG(userMessage)
      
      return response.ok({ response: answer })
    } catch (error) {
      console.error('Error en RAG Chat:', error)
      return response.internalServerError({ error: 'Ocurrió un error al procesar tu solicitud' })
    }
  }

  /**
   * Endpoint opcional para re-vectorizar una ficha de forma manual si es necesario
   */
  async vectorizeVersion({ request, response }: HttpContext) {
    const { eventId, versionContentId, content } = request.only(['eventId', 'versionContentId', 'content'])

    if (!eventId || !versionContentId || !content) {
      return response.badRequest({ error: 'Faltan parámetros: eventId, versionContentId, content' })
    }

    try {
      const ragService = new RagService()
      await ragService.vectorizeFichaTecnica(eventId, versionContentId, content)
      
      return response.ok({ message: 'Contenido vectorizado exitosamente' })
    } catch (error) {
      console.error('Error al vectorizar:', error)
      return response.internalServerError({ error: 'Ocurrió un error al vectorizar el contenido' })
    }
  }
}
