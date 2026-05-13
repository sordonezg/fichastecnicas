# Documentación de Agentes y Arquitectura del Proyecto (CAM)

Este documento sirve como la **Fuente de Verdad** para cualquier agente de IA o desarrollador que trabaje en el sistema de Fichas Técnicas del Centro de Apoyo Multidisciplinario (CAM).

## 🏗️ Arquitectura General

El proyecto sigue una arquitectura **Headless API** con una separación clara entre el backend y el frontend.

### Backend (AdonisJS 6)
*   **Framework**: AdonisJS 6 (Node.js).
*   **Base de Datos**: PostgreSQL alojado en Supabase.
*   **ORM**: Lucid ORM para la mayoría de las operaciones, `db.rawQuery` para operaciones vectoriales.
*   **Autenticación**: JWT Stateless (implementación personalizada vía `JwtAuthMiddleware`).
*   **Validación**: VineJS para validación de entrada en todos los endpoints.

### Frontend (React)
*   **Framework**: React con Vite.
*   **Estilo**: CSS Vanilla con un enfoque en estética premium (vibrant colors, glassmorphism, micro-animations).
*   **Estado**: React Hooks (useState, useEffect, useContext).
*   **API**: Axios con interceptores para el manejo del token JWT.

---

## 🔑 Sistema de Autenticación y Roles

El sistema utiliza un middleware personalizado (`jwtAuth`) para proteger las rutas.

### Roles de Usuario:
1.  **admin**: Acceso total al sistema, reportes y configuración.
2.  **auxiliar**: Puede gestionar venues y cambiar estados de fichas (aceptar/rechazar).
3.  **staff_interno**: Usuarios que crean y editan sus propias fichas técnicas.
4.  **direccion**: Rol especial con capacidad de "sobreescritura" de reservas en caso de conflictos.

---

## 📅 Lógica de Negocio: Fichas Técnicas

La entidad principal es el `Event`, pero la información detallada vive en sus versiones.

### Modelo de Datos:
*   **Event**: Contenedor principal (Estado actual, Recinto asignado).
*   **EventVersion**: Registro de versiones. Solo una es `isCurrentVersion = true`.
*   **VersionContent**: Los datos técnicos (nombre, objetivo, descripción, dress code).
*   **VersionActivity**: La agenda o "Minuto a Minuto" vinculada a una versión específica.

### Flujo de Creación:
1.  Se valida el solapamiento de horarios en el recinto.
2.  Se crea el `Event` y su primera `EventVersion`.
3.  Se disparan los procesos de **Vectorización** para la IA.

---

## 🤖 Sistema de IA y RAG

### Componentes:
*   **RagService**: Orquestador en el backend.
*   **Embeddings**: OpenAI `text-embedding-3-small` (1536 dimensiones).
*   **Chatbot**: GPT-4o-mini integrado en el layout del frontend.

### Seguridad IA:
*   **Prompt Isolation**: Delimitadores `<contexto>` para evitar Prompt Injection.
*   **Contextualización**: La IA solo responde basándose en los datos de las fichas técnicas del CAM.

---

## 🛠️ Guía para Desarrolladores / Agentes de IA

Si vas a modificar este código, sigue estas reglas:

1.  **Seguridad**: Siempre verifica la propiedad de los recursos en los controladores (Autorización a nivel de registro).
2.  **Tipos**: Todas las fechas en el backend deben ser objetos `DateTime` de Luxon. Asegúrate de usar `@column.dateTime()` en los modelos.
3.  **Transacciones**: Cualquier operación que involucre más de un modelo (ej: crear Evento + Versión + Actividades) DEBE usar `db.transaction()`.
4.  **IA**: Si agregas campos a la ficha técnica, actualiza el prompt de vectorización en `EventsController` para que la IA los reconozca.
5.  **Aesthetics**: El frontend debe sentirse premium. No uses componentes genéricos; prefiere el diseño visualmente impactante definido en `index.css`.

---
*Última actualización: Mayo 2026*
