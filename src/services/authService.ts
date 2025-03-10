import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  role?: string;
  avatar_url?: string;
}

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      console.log("Getting current user from Supabase...");
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("Error in getUser:", error);
        return null;
      }
      
      console.log("Supabase auth user:", user);
      
      if (!user) {
        console.log("No authenticated user found");
        return null;
      }
      
      // Get the user profile from the profiles table
      console.log("Fetching user profile for ID:", user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }
      
      console.log("User profile:", profile);
      
      return {
        id: user.id,
        email: user.email || '',
        username: profile?.username || user.email?.split('@')[0] || '',
        name: profile?.name || user.email?.split('@')[0] || '',
        role: profile?.role || 'user',
        avatar_url: profile?.avatar_url
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  async signIn(usernameOrEmail: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      // First, check if the input is an email (contains @)
      const isEmail = usernameOrEmail.includes('@');
      
      let email = '';
      
      // If it's not an email, we need to look up the email by username
      if (!isEmail) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', usernameOrEmail)
          .single();
          
        if (profileError || !profileData) {
          return { user: null, error: 'Username not found' };
        }
        
        email = profileData.email;
      } else {
        email = usernameOrEmail;
      }
      
      // Now sign in with the email
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { user: null, error: error.message };
      }
      
      if (!data.user) {
        return { user: null, error: 'No user returned from authentication' };
      }
      
      // Get the user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        username: profile?.username || data.user.email?.split('@')[0] || '',
        name: profile?.name || data.user.email?.split('@')[0] || '',
        role: profile?.role || 'user',
        avatar_url: profile?.avatar_url
      };
      
      return { user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message || 'An error occurred during sign in' };
    }
  },
  
  async signUp(email: string, password: string, name: string, username: string): Promise<{ user: User | null; error: string | null }> {
    try {
      // First check if username is already taken
      const { data: existingUser, error: usernameError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();
        
      if (existingUser) {
        return { user: null, error: 'Username is already taken' };
      }
      
      // Now create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        return { user: null, error: error.message };
      }
      
      if (!data.user) {
        return { user: null, error: 'No user returned from registration' };
      }
      
      // Create a profile for the new user
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: email,
            username: username,
            name: name,
            role: 'user',
            created_at: new Date()
          }
        ]);
      
      if (profileError) {
        console.error('Error creating user profile:', profileError);
        return { user: null, error: 'Error creating user profile' };
      }
      
      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        username: username,
        name: name,
        role: 'user'
      };
      
      return { user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message || 'An error occurred during sign up' };
    }
  },
  
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: error.message };
      }
      
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'An error occurred during sign out' };
    }
  },
  
  async updateProfile(userId: string, updates: Partial<User>): Promise<{ user: User | null; error: string | null }> {
    try {
      // If updating username, check if it's already taken
      if (updates.username) {
        const { data: existingUser, error: usernameError } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', updates.username)
          .neq('id', userId)
          .single();
          
        if (existingUser) {
          return { user: null, error: 'Username is already taken' };
        }
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username: updates.username,
          name: updates.name,
          role: updates.role,
          avatar_url: updates.avatar_url,
          updated_at: new Date()
        })
        .eq('id', userId);
      
      if (error) {
        return { user: null, error: error.message };
      }
      
      // Get the updated user
      const updatedUser = await this.getCurrentUser();
      
      return { user: updatedUser, error: null };
    } catch (error: any) {
      return { user: null, error: error.message || 'An error occurred updating profile' };
    }
  },
  
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        return { error: error.message };
      }
      
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'An error occurred sending reset password email' };
    }
  },
  
  async updatePassword(password: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) {
        return { error: error.message };
      }
      
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'An error occurred updating password' };
    }
  }
}; 