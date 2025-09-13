import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { quizOperations, Quiz, Question } from '../lib/supabase';

const TakeQuiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (id) {
      fetchQuiz();
      setStartTime(new Date());
    }
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const { quiz, questions } = await quizOperations.fetchQuizWithQuestions(id!);
      setQuiz(quiz);
      setQuestions(questions);
      setSelectedAnswers({});
    } catch (err: any) {
      setError(err.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const currentQuestionId = questions[currentQuestion]?.id;
    if (currentQuestionId) {
      setSelectedAnswers(prev => ({
        ...prev,
        [currentQuestionId]: answerIndex
      }));
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !user || !startTime || questions.length === 0) return;

    const endTime = new Date();
    const timeTaken = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    
    let score = 0;
    questions.forEach(question => {
      const userAnswer = selectedAnswers[question.id];
      if (userAnswer === question.correct_answer) {
        score++;
      }
    });

    const percentage = Math.round((score / questions.length) * 100);

    try {
      const attempt = await quizOperations.submitQuizAttempt({
        quiz_id: quiz.id,
        answers: selectedAnswers,
        score,
        percentage,
        time_taken: timeTaken,
      });

      // Navigate to results page
      window.location.href = `/quiz/${quiz.id}/results?attemptId=${attempt.id}`;
    } catch (err: any) {
      setError(err.message || 'Failed to submit quiz');
    }
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

  if (!quiz || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Quiz not found</p>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQuestionId = currentQuestionData?.id;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
          <p className="opacity-90">{quiz.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm">
                {startTime && Math.floor((Date.now() - startTime.getTime()) / 1000 / 60)} min
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-200 h-2">
          <div 
            className="bg-blue-600 h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Content */}
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            {currentQuestionData.question}
          </h2>

          <div className="space-y-4">
            {currentQuestionData.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                  selectedAnswers[currentQuestionId] === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={index}
                  checked={selectedAnswers[currentQuestionId] === index}
                  onChange={() => handleAnswerSelect(index)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-4 text-lg text-gray-800">{option}</span>
              </label>
            ))}
          </div>

          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={() => window.location.href = '/quizzes'}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Exit Quiz
            </button>
            
            <button
              onClick={handleNext}
              disabled={!currentQuestionId || selectedAnswers[currentQuestionId] === undefined}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentQuestion < questions.length - 1 ? (
                <>
                  Next Question
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Submit Quiz
                  <CheckCircle className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;