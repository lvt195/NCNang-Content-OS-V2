import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface AdminAuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
}

export const authService = {
  /**
   * Log in with Email and Password
   */
  async signIn(email: string, password: string): Promise<{ user: User; isAdmin: boolean }> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error(
        'Supabase chưa được kết nối. Vui lòng cấu hình VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong file .env.'
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      throw new Error(
        error.message === 'Invalid login credentials'
          ? 'Email hoặc mật khẩu không chính xác.'
          : error.message
      );
    }

    if (!data.user) {
      throw new Error('Đăng nhập không thành công.');
    }

    // Verify if this user is actually registered in admin_users
    const isAdmin = await this.verifyAdminRole(data.user.id);
    if (!isAdmin) {
      // If authenticated account is not the authorized admin, sign them out immediately
      await supabase.auth.signOut();
      throw new Error('Tài khoản này không có quyền quản trị (Chỉ 1 tài khoản Admin duy nhất được cấp phép).');
    }

    return { user: data.user, isAdmin: true };
  },

  /**
   * Log out
   */
  async signOut(): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut();
    }
  },

  /**
   * Get currently active session
   */
  async getSession(): Promise<Session | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Verify if the user_id exists in public.admin_users
   */
  async verifyAdminRole(userId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase || !userId) return false;

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Admin check error:', error.message);
        return false;
      }

      return Boolean(data && data.user_id === userId);
    } catch {
      return false;
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: User | null, isAdmin: boolean) => void) {
    if (!isSupabaseConfigured || !supabase) {
      callback(null, false);
      return { unsubscribe: () => {} };
    }

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const isAdmin = await this.verifyAdminRole(session.user.id);
        callback(session.user, isAdmin);
      } else {
        callback(null, false);
      }
    });

    return {
      unsubscribe: () => listener.subscription.unsubscribe(),
    };
  },
};
