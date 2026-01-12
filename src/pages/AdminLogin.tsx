import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isCreating) {
      // Creating new account
      const { error } = await signUp(email, password);
      setLoading(false);
      
      if (error) {
        toast({ 
          title: 'Erro ao criar conta', 
          description: error.message, 
          variant: 'destructive' 
        });
      } else {
        // Create profile with admin flag
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          await supabase.from('profiles').insert({
            user_id: userData.user.id,
            email: email,
            is_admin: true
          });
        }
        
        toast({ 
          title: 'Conta criada com sucesso!', 
          description: 'Você já está logado.',
        });
        navigate('/admin/dashboard');
      }
    } else {
      // Signing in
      const { error } = await signIn(email, password);
      setLoading(false);
      
      if (error) {
        toast({ 
          title: 'Erro', 
          description: 'Email ou senha incorretos.', 
          variant: 'destructive' 
        });
      } else {
        navigate('/admin/dashboard');
      }
    }
  };

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
