// ModulesPage - List all available modules with lessons
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Module } from '../types/content';
import { getModules } from '../services/contentService';
import { useAuth } from '../contexts/AuthContext';
import { getAllCompletedLessons } from '../services/firebase/progressService';
import { HextechCard } from '../components/hextech';

import logo from '../assets/logo.png';

export default function ModulesPage() {
  const { user } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadModules = async () => {
      try {
        const data = await getModules();
        setModules(data.sort((a, b) => a.order - b.order));
      } catch (err) {
        console.error('Failed to load modules:', err);
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, []);

  // Fetch user progress
  useEffect(() => {
    async function loadProgress() {
      if (!user) return;
      try {
        const progress = await getAllCompletedLessons(user.uid);
        const completedIds = new Set(progress.map(p => p.lessonId));
        setCompletedLessons(completedIds);
      } catch (err) {
        console.error('Failed to load progress:', err);
      }
    }
    loadProgress();
  }, [user]);

  const difficultyColors = {
    beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
    intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-hextech-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-hextech-gold/30 border-t-hextech-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hextech-black">
      {/* Header */}
      <header className="bg-hextech-blue/80 border-b border-hextech-gold/20 py-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="AC" className="w-10 h-10 object-contain rounded-full" />
              <span className="text-hextech-gold font-bold text-lg hidden sm:block">Academia para Challengers</span>
            </Link>
          </div>
          <Link to="/dashboard" className="text-gray-400 hover:text-hextech-gold transition-colors">
            Mi Progreso
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-hextech-gold mb-2">Módulos de Aprendizaje</h1>
        <p className="text-gray-400 mb-8">Domina cada aspecto del juego paso a paso</p>

        <div className="space-y-8">
          {modules.map((module) => (
            <div key={module.id}>
              <HextechCard variant="gradient" hover={false}>
                <div className="flex items-start gap-4 mb-6">
                  <span className="text-4xl">{module.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-hextech-gold">{module.title}</h2>
                    <p className="text-gray-400">{module.description}</p>
                  </div>
                </div>

                {module.lessons.length > 0 ? (
                  <div className="space-y-3">
                    {module.lessons.map((lesson, index) => {
                      // Extract folder and filename from registry path
                      const pathParts = lesson.path.replace('.json', '').split('/');
                      const folder = pathParts[0];
                      const lessonSlug = pathParts[pathParts.length - 1];
                      const lessonId = `${folder}/${lessonSlug}`;
                      const isCompleted = completedLessons.has(lessonId);
                      
                      return (
                      <Link
                        key={lesson.id}
                        to={`/lesson/${folder}/${lessonSlug}`}
                        className="flex items-center justify-between p-4 rounded-lg bg-hextech-black/50 border border-hextech-gold/10 hover:border-hextech-gold/40 hover:bg-hextech-black/70 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            isCompleted 
                              ? 'bg-green-500/30 text-green-400 border border-green-500/50' 
                              : 'bg-hextech-gold/20 text-hextech-gold'
                          }`}>
                            {isCompleted ? '✓' : index + 1}
                          </span>
                          <div>
                            <span className="text-gray-200 group-hover:text-hextech-gold transition-colors">
                              {lesson.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-gray-500 text-sm">{lesson.duration_minutes} min</span>
                              <span className={`text-xs px-2 py-0.5 rounded border ${difficultyColors[lesson.difficulty]}`}>
                                {lesson.difficulty === 'beginner' && 'Principiante'}
                                {lesson.difficulty === 'intermediate' && 'Intermedio'}
                                {lesson.difficulty === 'advanced' && 'Avanzado'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-hextech-gold opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </span>
                      </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-2xl block mb-2">🔒</span>
                    Próximamente
                  </div>
                )}
              </HextechCard>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
