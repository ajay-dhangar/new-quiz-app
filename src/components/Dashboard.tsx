import React, { useState, useEffect } from 'react';
import { Trophy, BookOpen, TrendingUp, User, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { quizOperations, Quiz } from '../lib/supabase';


interface Attempt {
  id: string;
  quiz_id: string;
  score: number;
  time_taken: number;
  created_at: string;
  quizzes: {
    id: string;
    title: string;
  };
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [userQuizzes, setUserQuizzes] = useState<Quiz[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<Attempt[]>([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [userQuizzes, userAttempts] = await Promise.all([
        quizOperations.fetchUserQuizzes(),
        quizOperations.fetchUserAttempts(),
      ]);

      const quizzesData = userQuizzes || [];
      const attemptsData = userAttempts || [];

      setUserQuizzes(quizzesData);
      setRecentAttempts(attemptsData.slice(0, 5)); // Show only 5 recent attempts

      // Calculate stats
      const totalAttempts = attemptsData.length;
      const totalScore = attemptsData.reduce((sum, attempt) => sum + attempt.score, 0);
      const averageScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;
      const bestScore = attemptsData.reduce((max, attempt) => 
        Math.max(max, attempt.score), 0
      );

      setStats({
        totalQuizzes: quizzesData.length,
        totalAttempts,
        averageScore,
        bestScore,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.email}!
            </h1>
            <p className="text-gray-600">
              Here's your quiz activity overview
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => window.location.href = '/create-quiz'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Quiz
            </button>
            <button
              onClick={() => window.location.href = '/quizzes'}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Browse Quizzes
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Quizzes Created</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalQuizzes}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Quizzes Taken</p>
              <p className="text-3xl font-bold text-green-600">{stats.totalAttempts}</p>
            </div>
            <Trophy className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Average Score</p>
              <p className="text-3xl font-bold text-purple-600">{stats.averageScore}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Best Score</p>
              <p className="text-3xl font-bold text-orange-600">{stats.bestScore}</p>
            </div>
            <Trophy className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* My Quizzes */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Quizzes</h2>
          
          {userQuizzes.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">You haven't created any quizzes yet</p>
              <button
                onClick={() => window.location.href = '/create-quiz'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Quiz
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userQuizzes.map((quiz) => (
                <div key={quiz.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{quiz.title}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{quiz.description}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(quiz.created_at)}</span>
                        <span className="mx-2">•</span>
                        <span>Quiz available</span>
                      </div>
                    </div>
                    <button
                      onClick={() => window.location.href = `/quiz/${quiz.id}`}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Attempts */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Attempts</h2>
          
          {recentAttempts.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No quiz attempts yet</p>
              <button
                onClick={() => window.location.href = '/quizzes'}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Take Your First Quiz
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentAttempts.map((attempt) => (
                <div key={attempt.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{attempt.quizzes?.title}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Trophy className="h-4 w-4 mr-1" />
                        <span>Score: {attempt.score}</span>
                        <span className="mx-2">•</span>
                        <span>{formatTime(attempt.time_taken)}</span>
                        <span className="mx-2">•</span>
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(attempt.created_at)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => window.location.href = `/quiz/${attempt.quiz_id}`}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Retake
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;