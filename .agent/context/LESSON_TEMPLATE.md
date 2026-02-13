# 📋 Plantilla JSON para Lecciones - Academia para Challengers

Esta plantilla define el formato estándar para crear lecciones compatibles con el sistema de contenido.

## Plantilla Completa

```json
{
  "id": "lesson_X_Y",
  "title": "Título de la Lección",
  "video_id": "ID_DE_YOUTUBE_11_CHARS",
  "duration": "10 min",
  "summary": "Descripción corta de 1-2 oraciones que aparece bajo el video.",
  "content_md": "# Título Principal\n\nPárrafo de introducción con **negritas** y *cursivas*.\n\n## Sección 1\n\nContenido de la sección.\n\n* Punto con viñeta\n* Otro punto\n\n### Subsección\n\nMás contenido...\n\n## Conclusión\n\nResumen final.",
  "cheat_sheet_md": "## Resumen Rápido\n\n### 🎯 Concepto Clave 1\n* Detalle importante\n\n### 💡 Concepto Clave 2\n* Tip práctico",
  "quiz": [
    {
      "question": "¿Pregunta del quiz?",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correct_index": 0,
      "explanation": "Explicación de la respuesta correcta."
    }
  ],
  "resources": [
    {
      "title": "Nombre del Recurso",
      "url": "https://example.com/recurso"
    }
  ]
}
```

## Referencia de Campos

| Campo            | Tipo   | Requerido | Descripción                                        |
| ---------------- | ------ | --------- | -------------------------------------------------- |
| `id`             | string | ✅        | Formato: `lesson_MODULO_NUMERO` (ej: `lesson_1_2`) |
| `title`          | string | ✅        | Título visible de la lección                       |
| `video_id`       | string | ✅        | ID de YouTube (11 caracteres después de `v=`)      |
| `duration`       | string | ⚠️        | Duración legible (ej: "15 min")                    |
| `summary`        | string | ✅        | 1-2 oraciones para pestaña Video                   |
| `content_md`     | string | ⚠️        | Contenido completo en Markdown                     |
| `cheat_sheet_md` | string | ⚠️        | Resumen rápido en Markdown                         |
| `quiz`           | array  | ✅        | Mínimo 1 pregunta, recomendado 3+                  |
| `resources`      | array  | ⚠️        | Links externos útiles                              |

## Reglas de Escape en JSON

```
Newline     → \n
Comillas    → \"
Tab         → \t
Backslash   → \\
```

## Estructura de Carpetas

```
src/data/lessons/
├── fundamentos/           ← Módulo 1: lesson_1_X
├── macro-juego/           ← Módulo 2: lesson_2_X
├── mecanicas-avanzadas/   ← Módulo 3: lesson_3_X
└── mentalidad/            ← Módulo 4: lesson_4_X
```

## Registro en registry.json

Después de crear el archivo JSON, agrégalo al `src/data/registry.json`:

```json
{
  "id": "lesson_1_2",
  "title": "Título de la Lección",
  "path": "fundamentos/nombre-archivo.json",
  "duration_minutes": 15,
  "difficulty": "beginner"
}
```

**Valores de `difficulty`:** `"beginner"`, `"intermediate"`, `"advanced"`

## Markdown Soportado

- `# H1`, `## H2`, `### H3` - Headers
- `**bold**`, `*italic*` - Estilos
- `* item` o `- item` - Listas
- `` `code` `` - Código inline
- `> quote` - Citas

## Ejemplo de Quiz

```json
"quiz": [
  {
    "question": "¿Cuánto HP tiene el Nexus en S16?",
    "options": [
      "4,000 HP",
      "5,500 HP",
      "6,000 HP",
      "10,000 HP"
    ],
    "correct_index": 1,
    "explanation": "El Nexus tiene 5,500 HP con regeneración de 20 HP/s."
  }
]
```

> **Nota:** `correct_index` es 0-indexed (primera opción = 0)
