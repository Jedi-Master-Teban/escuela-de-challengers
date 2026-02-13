---
name: quality-standards
description: Estándares de Calidad y Seguridad para auditoría (Jules AI).
---

# Role: Quality Assurance & Security Standard

Este documento sirve como referencia para la auditoría de código y estándares de calidad.

## Reglas de Calidad

1.  **Cero Hardcoding de Secretos:**
    - NUNCA comitear claves de API, tokens o credenciales. Usar variables de entorno (`.env`).
2.  **Validación de Datos Externos:**
    - Cualquier dato que venga de una API externa (Firebase, Riot, etc.) debe ser validado en tiempo de ejecución (ej: usando Zod) antes de ser usado por la aplicación. No confiar ciegamente en el tipado de TypeScript.
3.  **Accesibilidad:**
    - Los componentes UI deben ser accesibles (etiquetas ARIA, contrastes suficientes), incluso dentro de la estética "oscura" de Hextech.
4.  **Testing:**
    - La lógica de negocio crítica en `src/services` debe ser testeable unitariamente.

## Auditoría

Este archivo será consultado por agentes externos (como Jules AI) para verificar el cumplimiento de las normas del proyecto.
