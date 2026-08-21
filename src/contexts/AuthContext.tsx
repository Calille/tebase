import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authService } from '@/services/authService';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import { DEMO_VIEWER, SKIP_AUTH } from '@/lib/authMode';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string, username: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<User>) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (SKIP_AUTH) {
      setUser(DEMO_VIEWER);
      setLoading(false);
      return;
    }

    // Check for existing session on mount
    const checkUser = async () => {
      try {
        setLoading(true);
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Error checking authentication:', err);
        setError('Failed to authenticate user');
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      // Clean up the subscription
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (username: string, password: string) => {
    if (SKIP_AUTH) {
      setUser(DEMO_VIEWER);
      return { error: null };
    }

    setLoading(true);
    setError(null);
    try {
      const { user: authUser, error: authError } = await authService.signIn(username, password);
      
      if (authError) {
        setError(authError);
        return { error: authError };
      }
      
      setUser(authUser);
      return { error: null };
    } catch (err) {
      const message = errorMessage(err, 'An error occurred during sign in');
      setError(message);
      console.error('Sign in error:', err);
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, username: string) => {
    setLoading(true);
    setError(null);
    try {
      const { user: authUser, error: authError } = await authService.signUp(email, password, name, username);
      
      if (authError) {
        setError(authError);
        return { error: authError };
      }
      
      setUser(authUser);
      return { error: null };
    } catch (err) {
      const message = errorMessage(err, 'An error occurred during sign up');
      setError(message);
      console.error('Sign up error:', err);
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (SKIP_AUTH) {
      setUser(DEMO_VIEWER);
      return { error: null };
    }

    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await authService.signOut();
      
      if (authError) {
        setError(authError);
        return { error: authError };
      }
      
      setUser(null);
      return { error: null };
    } catch (err) {
      const message = errorMessage(err, 'An error occurred during sign out');
      setError(message);
      console.error('Sign out error:', err);
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) {
      const message = 'No authenticated user';
      setError(message);
      return { error: message };
    }
    
    setLoading(true);
    setError(null);
    try {
      const { user: updatedUser, error: authError } = await authService.updateProfile(user.id, updates);
      
      if (authError) {
        setError(authError);
        return { error: authError };
      }
      
      setUser(updatedUser);
      return { error: null };
    } catch (err) {
      const message = errorMessage(err, 'An error occurred updating profile');
      setError(message);
      console.error('Update profile error:', err);
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await authService.resetPassword(email);
      
      if (authError) {
        setError(authError);
        return { error: authError };
      }
      return { error: null };
    } catch (err) {
      const message = errorMessage(err, 'An error occurred sending reset password email');
      setError(message);
      console.error('Reset password error:', err);
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await authService.updatePassword(password);
      
      if (authError) {
        setError(authError);
        return { error: authError };
      }
      return { error: null };
    } catch (err) {
      const message = errorMessage(err, 'An error occurred updating password');
      setError(message);
      console.error('Update password error:', err);
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 