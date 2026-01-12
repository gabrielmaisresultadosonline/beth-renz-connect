import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Phone, Linkedin, Instagram, Facebook, Youtube, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Contato() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('contact_messages').insert([form]);
    setLoading(false);
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível enviar sua mensagem.', variant: 'destructive' });
    } else {
      setSent(true);
      toast({ title: 'Mensagem enviada!', description: 'Entraremos em contato em breve.' });
    }
  };

  return (
    <Layout>
      <PageHero title="Contato" subtitle="Estamos prontos para atender você" />
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-display font-bold mb-6">Fale Conosco</h2>
              <div className="space-y-4 mb-8">
                <a href="mailto:imprensa@bethrenz.com.br" className="flex items-center gap-3 text-muted-foreground hover:text-primary"><Mail className="h-5 w-5" />imprensa@bethrenz.com.br</a>
                <a href="tel:+5551981284627" className="flex items-center gap-3 text-muted-foreground hover:text-primary"><Phone className="h-5 w-5" />(51) 98128-4627</a>
              </div>
              <h3 className="font-semibold mb-4">Redes Sociais</h3>
              <div className="flex gap-3">
                <a href="#" className="p-3 rounded-full bg-accent hover:bg-primary hover:text-primary-foreground transition-colors"><Linkedin className="h-5 w-5" /></a>
                <a href="#" className="p-3 rounded-full bg-accent hover:bg-primary hover:text-primary-foreground transition-colors"><Instagram className="h-5 w-5" /></a>
                <a href="#" className="p-3 rounded-full bg-accent hover:bg-primary hover:text-primary-foreground transition-colors"><Facebook className="h-5 w-5" /></a>
                <a href="#" className="p-3 rounded-full bg-accent hover:bg-primary hover:text-primary-foreground transition-colors"><Youtube className="h-5 w-5" /></a>
              </div>
            </div>
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                {sent ? (
                  <div className="text-center py-8"><CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" /><h3 className="text-xl font-semibold mb-2">Mensagem Enviada!</h3><p className="text-muted-foreground">Retornaremos em breve.</p></div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input placeholder="Seu nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    <Input type="email" placeholder="Seu email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    <Input placeholder="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    <Textarea placeholder="Sua mensagem" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
                    <Button type="submit" className="w-full" disabled={loading}><Send className="h-4 w-4 mr-2" />{loading ? 'Enviando...' : 'Enviar Mensagem'}</Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
