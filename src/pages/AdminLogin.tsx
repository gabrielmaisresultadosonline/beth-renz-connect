import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';

const STORAGE_KEY = 'admin_remember_login';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { user, loading: authLoading, isAdmin, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (authLoading) return;
    
    if (user && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    
    setCheckingAuth(false);
  }, [user, isAdmin, authLoading, navigate]);

  // Load saved email
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setEmail(data.email || '');
        setRememberMe(true);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      if (isCreating) {
        // Creating new account
        const { error } = await signUp(email, password);

        if (error) {
          toast({
            title: 'Erro ao criar conta',
            description: error.message,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        // Try to bootstrap first admin (only works for designated admin email)
        await supabase.rpc('bootstrap_first_admin', { p_email: email });

        // Save if "remember me" is checked
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ email }));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }

        toast({
          title: 'Conta criada com sucesso!',
          description: 'Você está sendo redirecionado...',
        });

        // The auth state change will trigger the useEffect to redirect
        return;
      }

      // Signing in
      const { error } = await signIn(email, password);

      if (error) {
        toast({
          title: 'Erro',
          description: 'Email ou senha incorretos.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Save if "remember me" is checked
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ email }));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }

      // Wait briefly for auth state to propagate, then navigate
      // The onAuthStateChange will update isAdmin, then useEffect redirects
      toast({
        title: 'Login realizado!',
        description: 'Redirecionando...',
      });

    } catch {
      toast({
        title: 'Erro ao entrar',
        description: 'Não foi possível acessar agora. Tente novamente.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  // Show loading while checking auth status
  if (checkingAuth || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={logo} alt="Beth Renz" className="h-12 mx-auto mb-4" />
          <CardTitle className="font-display">Área Administrativa</CardTitle>
          <CardDescription>
            {isCreating ? 'Criar nova conta de administrador' : 'Entre com suas credenciais'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <Input 
              type="password" 
              placeholder="Senha (mínimo 6 caracteres)" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength={6}
            />
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe} 
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label 
                htmlFor="remember" 
                className="text-sm text-muted-foreground cursor-pointer select-none"
              >
                Lembrar meu email
              </Label>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (isCreating ? 'Criando...' : 'Entrando...') : (isCreating ? 'Criar Conta' : 'Entrar')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsCreating(!isCreating)}
              className="text-sm text-primary hover:underline"
            >
              {isCreating ? 'Já tenho uma conta' : 'Criar nova conta de administrador'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
