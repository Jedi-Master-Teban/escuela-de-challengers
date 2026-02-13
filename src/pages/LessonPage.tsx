// LessonPage - Displays a single lesson with video and quiz
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Lesson } from '../types/content';
import { getLesson } from '../services/contentService';
import { useAuth } from '../contexts/AuthContext';
import { markLessonComplete, isLessonCompleted } from '../services/firebase/progressService';
import { HextechButton, HextechCard } from '../components/hextech';
import { VideoPlayer, QuizComponent, MarkdownRenderer } from '../components/lesson';

type Tab = 'video' | 'content' | 'quiz' | 'resources';

export default function LessonPage() {
  const { moduleId, lessonPath } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('video');
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [_quizScore, setQuizScore] = useState({ score: 0, total: 0 });
  const [_savingProgress, setSavingProgress] = useState(false);
  const [_alreadyCompleted, setAlreadyCompleted] = useState(false);

  useEffect(() => {
    const loadLesson = async () => {
      if (!moduleId || !lessonPath) return;
      
      try {
        setLoading(true);
        const fullPath = `${moduleId}/${lessonPath}.json`;
        const lessonData = await getLesson(fullPath);
        setLesson(lessonData);
      } catch (err) {
        setError('No se pudo cargar la lección');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [moduleId, lessonPath]);

  // Check if lesson is already completed
  useEffect(() => {
    async function checkProgress() {
      if (!user || !moduleId || !lessonPath) return;
      const lessonId = `${moduleId}/${lessonPath}`;
      const completed = await isLessonCompleted(user.uid, lessonId);
      if (completed) {
        setAlreadyCompleted(true);
        setQuizCompleted(true);
      }
    }
    checkProgress();
  }, [user, moduleId, lessonPath]);

  const handleQuizComplete = async (score: number, total: number) => {
    setQuizCompleted(true);
    setQuizScore({ score, total });

    // Save progress to Firestore
    if (user && moduleId && lessonPath) {
      setSavingProgress(true);
      try {
        const lessonId = `${moduleId}/${lessonPath}`;
        const scorePercent = Math.round((score / total) * 100);
        await markLessonComplete(user.uid, lessonId, scorePercent);
        console.log('Progreso guardado:', { lessonId, scorePercent });
      } catch (err) {
        console.error('Error guardando progreso:', err);
      } finally {
        setSavingProgress(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-hextech-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-hextech-gold/30 border-t-hextech-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-hextech-gold">Cargando lección...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-hextech-black flex items-center justify-center">
        <HextechCard variant="gradient" className="text-center max-w-md">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-hextech-gold mb-2">Lección no encontrada</h2>
          <p className="text-gray-400 mb-6">{error || 'Esta lección no está disponible.'}</p>
          <HextechButton variant="outline" onClick={() => navigate('/modules')}>
            Volver a Módulos
          </HextechButton>
        </HextechCard>
      </div>
    );
  }

  const difficultyColors = {
    beginner: 'text-green-400',
    intermediate: 'text-amber-400',
    advanced: 'text-red-400',
  };

  const difficultyLabels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  };

  return (
    <div className="min-h-screen bg-hextech-black pt-16">
      {/* Header */}
      <header className="bg-hextech-blue/80 border-b border-hextech-gold/20 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <Link to="/modules" className="text-gray-400 hover:text-hextech-gold transition-colors text-sm mb-2 inline-block">
            ← Volver a Módulos
          </Link>
          <h1 className="text-2xl font-bold text-hextech-gold">{lesson.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm">
            {lesson.difficulty && (
              <>
                <span className={difficultyColors[lesson.difficulty]}>
                  {difficultyLabels[lesson.difficulty]}
                </span>
                <span className="text-gray-400">•</span>
              </>
            )}
            {(lesson.duration_minutes || lesson.duration) && (
              <>
                <span className="text-gray-400">{lesson.duration || `${lesson.duration_minutes} min`}</span>
                <span className="text-gray-400">•</span>
              </>
            )}
            <span className="text-gray-400">{lesson.quiz.length} preguntas</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['video', 'content', 'quiz', 'resources'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-6 py-2 rounded-t-lg font-medium transition-all duration-200
                ${activeTab === tab
                  ? 'bg-hextech-blue/80 text-hextech-gold border-t-2 border-x-2 border-hextech-gold/30'
                  : 'text-gray-400 hover:text-hextech-gold hover:bg-hextech-blue/30'
                }
              `}
            >
              {tab === 'video' && '🎬 Video'}
              {tab === 'content' && '📖 Contenido'}
              {tab === 'quiz' && `📝 Quiz ${quizCompleted ? '✓' : ''}`}
              {tab === 'resources' && '📚 Recursos'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-hextech-blue/30 rounded-lg p-6 border border-hextech-gold/20">
          {activeTab === 'video' && (
            <div className="space-y-6">
              <VideoPlayer videoId={lesson.video_id} title={lesson.title} />
              <p className="text-gray-300">{lesson.description || lesson.summary}</p>
              <div className="flex flex-wrap gap-2">
                {(lesson.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm bg-hextech-gold/10 text-hextech-gold rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="pt-4">
                <HextechButton variant="primary" onClick={() => setActiveTab('quiz')}>
                  Comenzar Quiz →
                </HextechButton>
              </div>
            </div>
          )}

          {activeTab === 'quiz' && (
            <QuizComponent 
              questions={lesson.quiz} 
              onComplete={handleQuizComplete} 
              onReviewMaterial={() => setActiveTab('content')}
            />
          )}

          {activeTab === 'content' && (
            <div className="space-y-8">
              {lesson.content_md ? (
                <MarkdownRenderer content={lesson.content_md} />
              ) : (
                <p className="text-gray-400">No hay contenido de texto disponible para esta lección. Mira el video para aprender.</p>
              )}
              
              {lesson.cheat_sheet_md && (
                <div className="mt-8 p-6 bg-hextech-gold/5 rounded-lg border border-hextech-gold/30">
                  <h3 className="text-xl font-bold text-hextech-gold mb-4">📋 Cheat Sheet</h3>
                  <MarkdownRenderer content={lesson.cheat_sheet_md} />
                </div>
              )}
            </div>
          )}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-hextech-gold mb-4">Recursos Adicionales</h3>
              {lesson.resources && lesson.resources.length > 0 ? (
                lesson.resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-lg border border-hextech-gold/20 hover:border-hextech-gold/50 hover:bg-hextech-gold/5 transition-all"
                  >
                    <span className="text-hextech-gold">📄 {resource.title}</span>
                    <span className="text-gray-500 text-sm ml-2">↗</span>
                  </a>
                ))
              ) : (
                <p className="text-gray-400">No hay recursos adicionales para esta lección.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
