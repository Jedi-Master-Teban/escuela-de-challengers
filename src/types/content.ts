// Content Types - Contracts for lesson data from NotebookLM
// Following the schema defined in PROJECT_MANIFESTO.md

/**
 * Individual quiz question within a lesson
 */
export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correct_answer?: number; // Legacy format
  correct_index?: number; // NotebookLM format
  explanation?: string;
}

/**
 * A single lesson with video content and quiz
 */
export interface Lesson {
  id: string;
  title: string;
  description?: string;
  summary?: string; // NotebookLM format - short description
  content_md?: string; // NotebookLM - full lesson content in markdown
  cheat_sheet_md?: string; // NotebookLM - markdown cheat sheet
  video_id: string; // YouTube video ID
  duration?: string; // Duration as string (e.g., "10 min")
  duration_minutes?: number; // Duration as number
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  quiz: QuizQuestion[];
  resources?: {
    title: string;
    url: string;
  }[];
}

/**
 * Reference to a lesson in the registry (lightweight)
 */
export interface LessonRef {
  id: string;
  title: string;
  path: string; // Path to JSON file (e.g., "fundamentos/cs-basico.json")
  duration_minutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * A module containing multiple lessons
 */
export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji or icon identifier
  order: number;
  lessons: LessonRef[];
}

/**
 * Champion-specific strategy content
 */
export interface ChampionStrategy {
  id: string;
  champion_name: string;
  champion_key: string; // DataDragon key (e.g., "Ahri")
  role: 'top' | 'jungle' | 'mid' | 'adc' | 'support';
  difficulty_rating: number; // 1-10
  strengths: string[];
  weaknesses: string[];
  combos: {
    name: string;
    keys: string; // e.g., "E > Q > W > R"
    description: string;
  }[];
  matchups: {
    champion_key: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tips: string[];
  }[];
  item_builds: {
    name: string;
    items: string[]; // Item names from DataDragon
    when_to_use: string;
  }[];
}

/**
 * The curriculum registry structure
 */
export interface Curriculum {
  version: string;
  last_updated: string;
  modules: Module[];
}
