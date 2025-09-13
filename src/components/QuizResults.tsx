import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Trophy, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { quizOperations, Quiz, Question, QuizAttempt } from '../lib/supabase';
import { supabase } from '../lib/supabase';

const QuizResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id && attemptId && user) {
      fetchQuizAndAttempt();
    }
  }, [id, attemptId, user]);

  const fetchQuizAndAttempt = async () => {
    try {
      const [quizWithQuestions, attemptResponse] = await Promise.all([
        quizOperations.fetchQuizWithQuestions(id!),
        supabase
          .from('quiz_attempts')
          .select('*')
          .eq('id', attemptId)
          .eq('user_id', user!.id)
          .single(),
      ]);

      if (attemptResponse.error) throw attemptResponse.error;

      setQuiz(quizWithQuestions.quiz);
      setQuestions(quizWithQuestions.questions);
      setAttempt(attemptResponse.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'Excellent work! 🎉';
    if (percentage >= 80) return 'Great job! 👏';
    if (percentage >= 70) return 'Good effort! 👍';
    if (percentage >= 60) return 'Not bad! Keep practicing! 💪';
    return 'Keep studying and try again! 📚';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.href = '/quizzes'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (!quiz || !attempt || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Results not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Results Header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
          <Trophy className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Quiz Completed!</h1>
          <p className="text-xl opacity-90">{quiz.title}</p>
        </div>

        <div className="p-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(attempt.score, questions.length)}`}>
                {attempt.score}/{questions.length}
              </div>
              <p className="text-gray-600">Score</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(attempt.score, questions.length)}`}>
                {attempt.percentage ?? ((attempt.score / questions.length) * 100).toFixed(0)}%
              </div>
              <p className="text-gray-600">Accuracy</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-4xl font-bold mb-2 text-blue-600">
                {formatTime(attempt.time_taken)}
              </div>
              <p className="text-gray-600">Time Taken</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-2xl font-semibold text-gray-900 mb-4">
              {getScoreMessage(attempt.score, questions.length)}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.location.href = `/quiz/${quiz.id}`}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Quiz
              </button>
              <button
                onClick={() => window.location.href = '/quizzes'}
                className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Browse Quizzes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Results</h2>

        <div className="space-y-6">
          {questions.map((question, index) => {
            const userAnswerIndex = attempt.answers?.[question.id];
            const isCorrect = userAnswerIndex === question.correct_answer;

            return (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {index + 1}. {question.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {isCorrect ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => {
                    const isUserAnswer = userAnswerIndex === optionIndex;
                    const isCorrectAnswer = question.correct_answer === optionIndex;

                    let className = 'p-3 rounded-lg border ';
                    if (isCorrectAnswer) {
                      className += 'bg-green-50 border-green-200 text-green-800';
                    } else if (isUserAnswer) {
                      className += 'bg-red-50 border-red-200 text-red-800';
                    } else {
                      className += 'bg-gray-50 border-gray-200 text-gray-600';
                    }

                    return (
                      <div key={optionIndex} className={className}>
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          <div className="flex items-center space-x-2">
                            {isCorrectAnswer && <CheckCircle className="h-4 w-4 text-green-600" />}
                            {isUserAnswer && !isCorrectAnswer && <XCircle className="h-4 w-4 text-red-600" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
