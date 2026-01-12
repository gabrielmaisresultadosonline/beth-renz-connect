import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const mountedRef = useRef(true);

  const checkAdminStatus = async (userId: string) => {
    // Prefer server-side verification (more robust with RLS)
    const { data: adminData, error: adminError } = await supabase.rpc('is_current_user_admin');

    if (!mountedRef.current) return;

    if (!adminError) {
      setIsAdmin(Boolean(adminData));
      return;
    }

    // Fallback: read own profile row
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', userId)
      .maybeSingle();

    if (!mountedRef.current) return;

    if (profileError) {
      setIsAdmin(false);
      return;
    }

    setIsAdmin(Boolean(profile?.is_admin));
  };

  useEffect(() => {
    mountedRef.current = true;

    const applySession = (nextSession: Session | null) => {
      if (!mountedRef.current) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      // Do not block the entire app while admin verification runs.
      setLoading(false);

      if (!nextSession?.user) {
        setIsAdmin(false);
        return;
      }

      // Reset until verified for the current user
      setIsAdmin(false);
      void checkAdminStatus(nextSession.user.id);
    };

    // Subscribe FIRST (prevents race conditions)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession);
    });

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
