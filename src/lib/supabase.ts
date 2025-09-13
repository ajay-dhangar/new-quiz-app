import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Quiz data types
export interface Quiz {
  id: string;
  title: string;
  description: string;
  category?: string;
  difficulty?: string;
  author_name: string;
  author_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
  order_index: number;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  answers: Record<string, number>;
  score: number;
  percentage: number;
  completed_at: string;
  time_taken: number;
}

// Database operations
export const quizOperations = {
  // Create a new quiz
  async createQuiz(quizData: {
    title: string;
    description: string;
    category?: string;
    difficulty?: string;
    author_name: string;
    questions: Array<{
      question: string;
      options: string[];
      correct_answer: number;
      explanation?: string;
    }>;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Create quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert([{
        title: quizData.title,
        description: quizData.description,
        category: quizData.category || 'General',
        difficulty: quizData.difficulty || 'medium',
        author_name: quizData.author_name,
        author_id: user.id,
      }])
      .select()
      .single();

    if (quizError) throw quizError;

    // Create questions
    const questionsToInsert = quizData.questions.map((q, index) => ({
      quiz_id: quiz.id,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation || '',
      order_index: index,
    }));

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsToInsert);

    if (questionsError) throw questionsError;

    return quiz;
  },

  // Fetch all quizzes
  async fetchQuizzes() {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Fetch quiz with questions
  async fetchQuizWithQuestions(quizId: string) {
    const [quizResponse, questionsResponse] = await Promise.all([
      supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single(),
      supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true })
    ]);

    if (quizResponse.error) throw quizResponse.error;
    if (questionsResponse.error) throw questionsResponse.error;

    return {
      quiz: quizResponse.data,
      questions: questionsResponse.data,
    };
  },

  // Submit quiz attempt
  async submitQuizAttempt(attemptData: {
    quiz_id: string;
    answers: Record<string, number>;
    score: number;
    percentage: number;
    time_taken: number;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert([{
        quiz_id: attemptData.quiz_id,
        user_id: user.id,
        answers: attemptData.answers,
        score: attemptData.score,
        percentage: attemptData.percentage,
        time_taken: attemptData.time_taken,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Fetch user's quiz attempts
  async fetchUserAttempts() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quizzes (
          id,
          title
        )
      `)
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Fetch user's created quizzes
  async fetchUserQuizzes() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};