import React from 'react';
import { PlusCircle, BookOpen, Trophy, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="text-center py-20">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-blue-600">Quiz Maker</span>
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Create engaging quizzes, challenge yourself, and track your progress. 
          The ultimate platform for learning and testing knowledge.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <>
              <button
                onClick={() => window.location.href = '/create-quiz'}
                className="flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Create Quiz
              </button>
              <button
                onClick={() => window.location.href = '/quizzes'}
                className="flex items-center px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Take Quiz
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => window.location.href = '/register'}
                className="flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Get Started
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="flex items-center px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Why Choose Quiz Maker?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-shadow">
              <PlusCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Create Quizzes</h3>
              <p className="text-gray-600">
                Build custom quizzes with multiple choice questions. 
                Add titles, descriptions, and track performance.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-shadow">
              <BookOpen className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Take Quizzes</h3>
              <p className="text-gray-600">
                Challenge yourself with quizzes created by the community. 
                Get instant feedback and detailed results.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-shadow">
              <Trophy className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your quiz attempts, scores, and improvement over time. 
                View detailed analytics and insights.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Start Your Quiz Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who are already creating and taking quizzes. 
              It's free and takes less than a minute to get started.
            </p>
            <button
              onClick={() => window.location.href = '/register'}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Sign Up Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;