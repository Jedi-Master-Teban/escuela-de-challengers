import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';

export interface LessonProgress {
  lessonId: string;
  completedAt: Timestamp | null;
  quizScore?: number;
}

export interface UserStats {
  lessonsCompleted: number;
  totalQuizScore: number;
  lastActive: Timestamp | null;
}

/**
 * Marks a lesson as completed for a user
 */
export async function markLessonComplete(
  userId: string, 
  lessonId: string, 
  quizScore?: number
): Promise<void> {
  const progressRef = doc(db, 'users', userId, 'progress', lessonId.replace(/\//g, '_'));
  
  await setDoc(progressRef, {
    lessonId,
    completedAt: serverTimestamp(),
    ...(quizScore !== undefined && { quizScore })
  });
}

/**
 * Gets the completion status of a specific lesson
 */
export async function getLessonProgress(
  userId: string, 
  lessonId: string
): Promise<LessonProgress | null> {
  const progressRef = doc(db, 'users', userId, 'progress', lessonId.replace(/\//g, '_'));
  const snapshot = await getDoc(progressRef);
  
  if (snapshot.exists()) {
    return snapshot.data() as LessonProgress;
  }
  
  return null;
}

/**
 * Gets all completed lessons for a user
 */
export async function getAllCompletedLessons(userId: string): Promise<LessonProgress[]> {
  const progressRef = collection(db, 'users', userId, 'progress');
  const snapshot = await getDocs(progressRef);
  
  return snapshot.docs.map(doc => doc.data() as LessonProgress);
}

/**
 * Gets completed lessons for a specific module
 */
export async function getModuleProgress(
  userId: string, 
  moduleId: string
): Promise<LessonProgress[]> {
  const progressRef = collection(db, 'users', userId, 'progress');
  const q = query(progressRef, where('lessonId', '>=', moduleId), where('lessonId', '<', moduleId + '\uf8ff'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => doc.data() as LessonProgress);
}

/**
 * Gets user statistics (total progress)
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const completedLessons = await getAllCompletedLessons(userId);
  
  const totalQuizScore = completedLessons.reduce((sum, lesson) => {
    return sum + (lesson.quizScore || 0);
  }, 0);
  
  const lastCompleted = completedLessons.reduce((latest, lesson) => {
    if (!lesson.completedAt) return latest;
    if (!latest) return lesson.completedAt;
    return lesson.completedAt.toMillis() > latest.toMillis() ? lesson.completedAt : latest;
  }, null as Timestamp | null);
  
  return {
    lessonsCompleted: completedLessons.length,
    totalQuizScore,
    lastActive: lastCompleted
  };
}

/**
 * Checks if a specific lesson is completed
 */
export async function isLessonCompleted(userId: string, lessonId: string): Promise<boolean> {
  const progress = await getLessonProgress(userId, lessonId);
  return progress !== null;
}
