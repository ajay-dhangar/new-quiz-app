import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, BookOpen, Trophy, LogOut, Menu, X } from 'lucide-react';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import CreateQuiz from './components/CreateQuiz';
import QuizList from './components/QuizList';
import TakeQuiz from './components/TakeQuiz';
import QuizResults from './components/QuizResults';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function NavBar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-xl font-bold text-gray-800">Quiz Maker</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">Welcome, {user.email}</span>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <User className="h-4 w-4 mr-1" />
                  Dashboard
                </button>
                <button
                  onClick={logout}
                  className="flex items-center px-3 py-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => window.location.href = '/register'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4">
            {user ? (
              <>
                <div className="px-4 py-2 text-gray-700">Welcome, {user.email}</div>
                <button
                  onClick={() => {
                    window.location.href = '/dashboard';
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    window.location.href = '/login';
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    window.location.href = '/register';
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  Register
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/quizzes" element={<QuizList />} />
          <Route path="/quiz/:id" element={<TakeQuiz />} />
          <Route path="/quiz/:id/results" element={<QuizResults />} />
          <Route 
            path="/create-quiz" 
            element={user ? <CreateQuiz /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" />} 
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;