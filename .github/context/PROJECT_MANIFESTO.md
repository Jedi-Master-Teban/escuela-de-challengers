# ACADEMIA PARA CHALLENGERS - PROJECT MANIFESTO

**Version:** 1.0.0 (Feb 2026)
**Status:** Active Development (Prototype Phase)

## 1. MISIÓN Y VISIÓN

Construir la plataforma educativa definitiva para jugadores de League of Legends, superando a las academias tradicionales mediante herramientas interactivas, datos en tiempo real y una experiencia de usuario inmersiva (UI Hextech).
**Core Value:** "De Hierro a Challenger con datos, no con suerte."

## 2. STACK TECNOLÓGICO (INNEGOCIABLE)

- **IDE:** Google Antigravity.
- **AI Core:** Gemini 3.0 Pro (Logic) + Google Stitch (UI Gen).
- **Frontend:** React 19 + Vite + TypeScript.
- **Styling:** TailwindCSS (Configurado con tokens de diseño Hextech).
- **Backend (BaaS):** Firebase (Auth & Firestore).
  - _Constraint:_ Toda lógica de backend debe estar abstraída en una "Service Layer" (`src/services`) para permitir una futura migración a SQL/Supabase sin romper el frontend.
- **Data Source:** Riot Games API (DataDragon) + JSON local para currículo.
- **Hosting:** GitHub Pages.
- **Auditoría:** Jules AI (External Security & Quality Check).

## 3. SISTEMA DE DISEÑO "HEXTECH"

El agente `ui-architect` debe forzar estas reglas en Stitch:

### Paleta de Colores

- **Hextech Gold:** `#C8AA6E` (Bordes, Títulos principales, Acentos).
- **Deep Blue:** `#091428` (Fondos, Tarjetas).
- **Hextech Magic:** `#0AC8B9` (Brillos, Botones de acción, Energía).
- **Void Purple:** `#3C184E` (Estados de error o peligro).
- **Grey Stone:** `#A09B8C` (Textos secundarios, bordes inactivos).

### Tipografía & UI

- **Headers:** `Beaufort` (o similar Serif fuerte como 'Cinzel').
- **Body:** `Spiegel` (o Sans-serif legible como 'Roboto'/'Inter').
- **Formas:** Angulares, metálicas, bordes biselados. Evitar el "Material Design" redondo estándar.

## 4. ARQUITECTURA DE DATOS

### A. Datos Estáticos (Riot API)

- **Endpoint:** `ddragon.leagueoflegends.com`
- **Regla de Oro:** NUNCA hardcodear la versión del parche.
- **Flujo:** Al iniciar la app, consultar `versions.json`, guardar la última versión en el estado global (Context/Zustand) y usarla para todas las llamadas de imágenes y datos.

### B. Contenidos Educativos (Local JSON)

- Ubicación: `src/data/curriculum.json`
- Estructura estricta para validación con NotebookLM:
  ```json
  {
    "modules": [
      {
        "id": "module_01",
        "title": "Fundamentos de Wave Management",
        "lessons": [
          {
            "id": "lesson_01_01",
            "title": "Slow Push vs Fast Push",
            "video_id": "dQw4w9WgXcQ", // Placeholder inicial
            "summary": "Markdown string...",
            "quiz": [{ "q": "...", "options": ["..."], "correct": 0 }]
          }
        ]
      }
    ]
  }
  ```

### C. Datos de Usuario (Firebase)

- **Colección users**:
  - uid: string
  - completed_lessons: array[string] (IDs de lecciones)
  - subscription_status: 'free' | 'premium'

## 5. REGLAS DE DESARROLLO (AGENT BEHAVIOR)

- **Mobile First, Desktop Rich: La UI debe ser responsive, pero en Desktop debe lucir como el cliente del juego**.
- **Seguridad (Jules Protocol)**:
  - Nunca commitear API Keys reales. Usar .env.
  - Sanitizar cualquier HTML inyectado desde los JSONs de lecciones.
- **Performance**:
  - Usar React.memo y useCallback en componentes de listas largas (ej: Lista de 160+ Campeones).
  - Cargar imágenes de DataDragon con lazy-loading.
- **Monetización**: Preparar la UI para "Bloqueo de contenido Premium". Los componentes deben aceptar una prop isLocked.
