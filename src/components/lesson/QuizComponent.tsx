// QuizComponent - Interactive quiz for lessons
import { useState } from 'react';
import type { QuizQuestion } from '../../types/content';
import { HextechButton, HextechCard } from '../hextech';

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
  onReviewMaterial?: () => void;
}

export default function QuizComponent({ questions, onComplete, onReviewMaterial }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentIndex];
  // Support both correct_answer (legacy) and correct_index (NotebookLM)
  const getCorrectIndex = (q: QuizQuestion) => q.correct_index ?? q.correct_answer ?? 0;
  const correctIndex = getCorrectIndex(currentQuestion);
  const isCorrect = selectedAnswer === correctIndex;
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelectAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      const finalScore = correctAnswers + (isCorrect ? 1 : 0);
      setIsCompleted(true);
      onComplete(finalScore, questions.length);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectAnswers(0);
    setIsCompleted(false);
  };

  if (isCompleted) {
    const finalScore = correctAnswers;
    const percentage = Math.round((finalScore / questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <HextechCard variant="glow" className="text-center">
        <div className="text-6xl mb-4">{passed ? '🏆' : '📚'}</div>
        <h3 className="text-2xl font-bold text-hextech-gold mb-2">
          {passed ? '¡Felicidades, Invocador!' : 'Sigue Practicando'}
        </h3>
        <p className="text-gray-300 mb-4">
          Obtuviste <span className="text-hextech-gold font-bold">{finalScore}</span> de{' '}
          <span className="text-hextech-gold font-bold">{questions.length}</span> respuestas correctas
        </p>
        <div className="text-4xl font-bold mb-6" style={{ color: passed ? '#22c55e' : '#f59e0b' }}>
          {percentage}%
        </div>
        <div className="flex gap-4 justify-center">
          {!passed && (
            <HextechButton variant="outline" onClick={handleRetry}>
              Reintentar Quiz
            </HextechButton>
          )}
          <HextechButton 
            variant="primary" 
            onClick={passed ? undefined : onReviewMaterial}
          >
            {passed ? 'Siguiente Lección' : 'Revisar Material'}
          </HextechButton>
        </div>
      </HextechCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-sm">
          Pregunta {currentIndex + 1} de {questions.length}
        </span>
        <div className="flex-1 h-2 bg-hextech-blue/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-hextech-gold to-amber-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <HextechCard variant="gradient">
        <h3 className="text-xl font-bold text-hextech-gold mb-6">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            let optionStyles = 'border-hextech-gold/30 hover:border-hextech-gold/60';
            
            if (showResult) {
              if (index === correctIndex) {
                optionStyles = 'border-green-500 bg-green-500/10';
              } else if (index === selectedAnswer && !isCorrect) {
                optionStyles = 'border-red-500 bg-red-500/10';
              }
            } else if (selectedAnswer === index) {
              optionStyles = 'border-hextech-gold bg-hextech-gold/10';
            }

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={showResult}
                className={`
                  w-full p-4 text-left rounded-lg border-2 transition-all duration-200
                  ${optionStyles}
                  ${!showResult && 'hover:bg-hextech-gold/5 cursor-pointer'}
                  ${showResult && 'cursor-default'}
                `}
              >
                <span className="text-hextech-gold font-bold mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className="text-gray-200">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showResult && currentQuestion.explanation && (
          <div className={`mt-6 p-4 rounded-lg ${isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
            <p className="text-sm">
              <span className={`font-bold ${isCorrect ? 'text-green-400' : 'text-amber-400'}`}>
                {isCorrect ? '✓ ¡Correcto!' : '✗ Incorrecto'}
              </span>
              <span className="text-gray-300 ml-2">{currentQuestion.explanation}</span>
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex justify-end gap-4">
          {!showResult ? (
            <HextechButton
              variant="primary"
              onClick={handleCheckAnswer}
              disabled={selectedAnswer === null}
            >
              Verificar Respuesta
            </HextechButton>
          ) : (
            <HextechButton variant="primary" onClick={handleNextQuestion}>
              {isLastQuestion ? 'Ver Resultados' : 'Siguiente Pregunta'}
            </HextechButton>
          )}
        </div>
      </HextechCard>
    </div>
  );
}
