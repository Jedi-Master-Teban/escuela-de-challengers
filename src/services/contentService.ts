// Content Service - Registry + Lazy Loading architecture
// Loads curriculum metadata from registry, and lessons on-demand via dynamic import

import type { Curriculum, Lesson, ChampionStrategy } from '../types/content';

// Cache for loaded lessons
const lessonCache = new Map<string, Lesson>();
const championCache = new Map<string, ChampionStrategy>();

/**
 * Get the full curriculum registry (modules and lesson references)
 * This is lightweight - just metadata, not full lesson content
 */
export async function getCurriculum(): Promise<Curriculum> {
  const registry = await import('../data/registry.json');
  return registry.default as Curriculum;
}

/**
 * Get a single lesson by its path (lazy loaded)
 * Uses Vite's dynamic import for code splitting
 * @param path - Path relative to lessons folder (e.g., "fundamentos/cs-basico.json")
 */
export async function getLesson(path: string): Promise<Lesson> {
  // Check cache first
  if (lessonCache.has(path)) {
    return lessonCache.get(path)!;
  }

  try {
    // Dynamic import - Vite handles this with code splitting
    const lessonModule = await import(`../data/lessons/${path}`);
    const lesson = lessonModule.default as Lesson;
    
    // Cache for future requests
    lessonCache.set(path, lesson);
    
    return lesson;
  } catch (error) {
    console.error(`Failed to load lesson: ${path}`, error);
    throw new Error(`Lesson not found: ${path}`);
  }
}

/**
 * Get a champion strategy guide by champion key (lazy loaded)
 * @param championKey - DataDragon champion key (e.g., "Ahri", "LeeSin")
 */
export async function getChampionStrategy(championKey: string): Promise<ChampionStrategy> {
  // Check cache first
  if (championCache.has(championKey)) {
    return championCache.get(championKey)!;
  }

  try {
    const strategyModule = await import(`../data/champions/${championKey.toLowerCase()}.json`);
    const strategy = strategyModule.default as ChampionStrategy;
    
    // Cache for future requests
    championCache.set(championKey, strategy);
    
    return strategy;
  } catch (error) {
    console.error(`Failed to load champion strategy: ${championKey}`, error);
    throw new Error(`Champion strategy not found: ${championKey}`);
  }
}

/**
 * Preload multiple lessons (useful for next lesson prefetch)
 * @param paths - Array of lesson paths to preload
 */
export async function preloadLessons(paths: string[]): Promise<void> {
  await Promise.all(paths.map(path => getLesson(path).catch(() => null)));
}

/**
 * Clear the lesson cache (useful for development/testing)
 */
export function clearCache(): void {
  lessonCache.clear();
  championCache.clear();
}

/**
 * Get all modules from the curriculum
 */
export async function getModules() {
  const curriculum = await getCurriculum();
  return curriculum.modules;
}

/**
 * Get a specific module by ID
 */
export async function getModuleById(moduleId: string) {
  const curriculum = await getCurriculum();
  return curriculum.modules.find(m => m.id === moduleId);
}
