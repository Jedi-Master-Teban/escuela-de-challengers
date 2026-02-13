# Changelog - Academia para Challengers

## [Unreleased]

### Agregado (Fase 4: Laboratorio Hextech)

#### Constructor de Runas (Rune Builder)

- Interfaz Click-to-Select para crear páginas de runas personalizadas
- Selección de árbol primario y secundario
- Selección de fragmentos de estadísticas
- Simulador de estadísticas bonificadas
- Sugerencias de sinergia entre runas
- Guardar y limpiar páginas de runas

#### Mejoras al Laboratorio

- **Constructor de Builds**: Constructor de runas integrado con estadísticas en tiempo real
- **Análisis de Sinergia**: Explicaciones visuales de por qué ciertas combinaciones funcionan (ej: Pyke + Nami, Yasuo + Knockups)
- **Estabilidad mejorada**: Corregido problema de doble carga al cambiar de rol
- **Layout responsive**: Mejorado el selector de equipo en Synergy Tab para móviles
- **Sistema de recomendación por rol**: Ahora cuando el scraping falla o no hay datos estáticos, se generan recomendaciones basadas en el rol del campeón
- **Más builds de campeones**: Añadidas builds para Caitlyn, Akali, Kaisa, Malphite, Nami y Lee Sin

### Corregido

- Eliminado doble llamado a `loadBuildData()` en ChampionBuild (causaba doble fetch)
- Mejorado manejo de datos nulos en tips de build
- Layout de Synergy Tab ahora responsive (sin borde en móviles)
- Mejorada la resiliencia de datos con fallbacks visuales
- **Items vacíos**: Solucionado el problema donde items y botas no se mostraban cuando el scraping fallaba

---

## [0.2.0] - 2026-02-11

### Agregado

- Efecto parallax mejorado con fondo fijo visible en toda la landing page
- Íconos de arquetipos en el Lab (Campeones) con tooltips
- Redes sociales en footer de landing (Twitter, Discord, YouTube)
- Documentación para desarrolladores (DEVELOPER.md)
- Gamification Widgets (Achievements, Leaderboard, Rewards)

### Cambiado

- Secciones de landing ahora son transparentes para mostrar el parallax
- Botones de filtro de roles ahora usan íconos en lugar de texto

### Corregido

- Espaciado del logo en página de login
- Título del navbar cambiado a "Academia para Challengers"
- Removido título duplicado "Artista Invitado" en Home

---

## [0.1.0] - 2026-02-08

### Agregado

- Landing page con efecto parallax
- Sistema de login con Firebase Auth
- Laboratorio Hextech (Campeones, Items, Runas)
- Módulos de cursos con progreso
- Sistema de quizzes
- Dashboard con estadísticas
- NewsCarousel en página Home
- Íconos de roles (Top, Jungle, Mid, ADC, Support)

---

## Roadmap Completo

### Fase 1: Fundamentos y Autenticación ✅

- Tech Stack: React, Vite, TailwindCSS, Firebase (Auth/Firestore)
- Sistema de Login/Registro con persistencia
- Protección de rutas (Rutas privadas vs públicas)

### Fase 2: Experiencia de Usuario & Diseño Hextech ✅

- Diseño "Hextech" inspirado en el cliente de LoL
- Componentes reutilizables: HextechCard, HextechButton
- Dashboard V3 con layout responsivo

### Fase 3: Conexión con Riot Games API ✅

- Integración con Riot API para datos reales
- Perfil de usuario real en el Dashboard
- Actualización automática de rango y estadísticas

### Fase 4: Laboratorio Hextech (Editor de Runas) ✅

- Constructor de Runas (Click-to-Select)
- Análisis de Sinergia entre campeones
- Simulador de Estadísticas
- Mejoras de estabilidad y responsive

### Fase 5: Análisis Avanzado de Partidas (Próxima)

- Mapas de Calor (Heatmaps)
- Orden de Habilidades (secuencia de leveo)
- Gold Advantage Graph

### Fase 6: Comunidad y Torneos

- Leaderboard automatizado
- Torneos Automatizados con verificación por API

### Fase 7: Infraestructura y Monetización

- Pasarela de Pagos (Stripe)
- Venta de "Pases de Batalla" o Suscripción

### Fase 8: Funciones Futuras (Backlog)

- AI Coach (basado en LLMs)
