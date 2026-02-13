# Guía del Desarrollador - Academia para Challengers

## 📁 Estructura del Proyecto

```
src/
├── assets/
│   └── icons/
│       ├── archetypes/     # Íconos de roles (fighter.png, mage.png, etc.)
│       ├── items/          # Íconos de categorías de items (PENDIENTE)
│       └── roles/          # Íconos de posiciones (Top, Jungle, etc.)
├── components/
│   ├── home/               # Componentes de la página Home
│   ├── lab/                # Componentes del Laboratorio Hextech
│   └── lesson/             # Componentes de lecciones
├── contexts/               # React Contexts (Auth, etc.)
├── hooks/                  # Custom hooks (useParallax, etc.)
├── pages/                  # Páginas principales
├── services/               # Servicios (Firebase, DataDragon API)
└── data/                   # Datos estáticos (lessons, builds)
```

## 🔗 Configuración de Links

### Redes Sociales (Landing Page Footer)

Archivo: `src/pages/LandingPage.tsx` (líneas ~295-330)

```tsx
// Twitter/X
<a href="TU_LINK_TWITTER" target="_blank" ...>

// Discord
<a href="TU_LINK_DISCORD" target="_blank" ...>

// YouTube
<a href="TU_LINK_YOUTUBE" target="_blank" ...>
```

## 🎨 Ubicación de Assets

### Íconos de Arquetipos (Lab - Campeones)

```
src/assets/icons/archetypes/
├── all.png        # Cuadrícula 3x3
├── fighter.png    # Luchador
├── tank.png       # Tanque
├── mage.png       # Mago
├── assassin.png   # Asesino
├── marksman.png   # Tirador
└── support.png    # Soporte
```

### Íconos de Categorías de Items (Lab - Items)

```
src/assets/icons/items/
├── attack_damage.png    # Daño de Ataque
├── ability_power.png    # Poder de Habilidad
├── attack_speed.png     # Velocidad de Ataque
├── critical.png         # Crítico
├── health.png           # Vida
├── armor.png            # Armadura
├── magic_resist.png     # Resistencia Mágica
├── lifesteal.png        # Robo de Vida
├── mana.png             # Maná y Regeneración
├── boots.png            # Botas
└── starter.png          # Items Iniciales
```

## 🔥 Firebase

### Usuario Demo

- **Email:** `demo@academia-challengers.com`
- **Contraseña:** `DemoChallenger2026!`

> ⚠️ El progreso de la cuenta demo es compartido. En producción, cada usuario tendrá su propio progreso.

### Estructura de Firestore

```
users/
  {userId}/
    progress/
      {lessonId}/
        - completedAt: Timestamp
        - quizScore: number
        - lessonId: string
```

## 🎬 Efecto Parallax

El fondo parallax está implementado con posición **fija** (`fixed`) para que sea visible detrás de todas las secciones.

Archivo: `src/pages/LandingPage.tsx`

- Líneas 79-90: Contenedor fijo del parallax
- Hook: `src/hooks/useParallax.ts`

## 📋 Archivos Importantes

| Archivo              | Descripción                     |
| -------------------- | ------------------------------- |
| `LandingPage.tsx`    | Página pública con parallax     |
| `HomePage.tsx`       | Página de inicio post-login     |
| `ChampionGrid.tsx`   | Grid de campeones con filtros   |
| `ItemBrowser.tsx`    | Navegador de items              |
| `progressService.ts` | Gestión de progreso en Firebase |
