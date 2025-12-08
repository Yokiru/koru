import { supabase } from './supabase';

/**
 * Quiz Service - Handle all quiz-related database operations
 */

// Save a new quiz to the database
export const saveQuiz = async (userId, quizData) => {
    try {
        const { data, error } = await supabase
            .from('quizzes')
            .insert({
                user_id: userId,
                topic: quizData.topic,
                type: quizData.type,
                difficulty: quizData.difficulty,
                mode: quizData.mode,
                num_questions: quizData.questions?.length || quizData.numQuestions,
                questions: quizData.questions,
                status: 'created',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error saving quiz:', error);
        return { data: null, error };
    }
};

// Get all quizzes for a user
export const getUserQuizzes = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('quizzes')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return { data: data || [], error: null };
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        return { data: [], error };
    }
};

// Get a single quiz by ID
export const getQuizById = async (quizId) => {
    try {
        const { data, error } = await supabase
            .from('quizzes')
            .select('*')
            .eq('id', quizId)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching quiz:', error);
        return { data: null, error };
    }
};

// Update quiz (e.g., after completing)
export const updateQuiz = async (quizId, updates) => {
    try {
        const { data, error } = await supabase
            .from('quizzes')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', quizId)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error updating quiz:', error);
        return { data: null, error };
    }
};

// Delete a quiz
export const deleteQuiz = async (quizId) => {
    try {
        const { error } = await supabase
            .from('quizzes')
            .delete()
            .eq('id', quizId);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Error deleting quiz:', error);
        return { error };
    }
};

// Save quiz result after completion
export const saveQuizResult = async (quizId, userId, results) => {
    try {
        const { data, error } = await supabase
            .from('quizzes')
            .update({
                score: results.score,
                total_questions: results.totalQuestions,
                answers: results.answers,
                completed: true,
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', quizId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error saving quiz result:', error);
        return { data: null, error };
    }
};
