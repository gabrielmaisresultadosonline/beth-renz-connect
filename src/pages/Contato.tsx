import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Phone, Linkedin, Instagram, Facebook, Youtube, Send, CheckCircle, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function Contato() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Bot detection field
  const { toast } = useToast();

  const validateForm = (): boolean => {
    // Name validation
    if (form.name.length < 2 || form.name.length > 200) {
      toast({ title: 'Erro', description: 'Nome deve ter entre 2 e 200 caracteres.', variant: 'destructive' });
      return false;
    }

    // Email validation
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(form.email) || form.email.length > 320) {
      toast({ title: 'Erro', description: 'Por favor, insira um email válido.', variant: 'destructive' });
      return false;
    }

    // Phone validation (optional but if provided must be valid)
    if (form.phone && form.phone.length > 0) {
      const phoneRegex = /^[0-9\s\(\)\+\-]{7,20}$/;
      if (!phoneRegex.test(form.phone)) {
        toast({ title: 'Erro', description: 'Telefone deve conter apenas números e ter entre 7 e 20 caracteres.', variant: 'destructive' });
        return false;
      }
    }

    // Message validation
    if (form.message.length < 10 || form.message.length > 5000) {
      toast({ title: 'Erro', description: 'Mensagem deve ter entre 10 e 5000 caracteres.', variant: 'destructive' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Bot detection - if honeypot field is filled, silently reject
    if (honeypot) {
      // Simulate success to not reveal bot detection
      setSent(true);
      return;
    }
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-contact`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone || null,
            message: form.message,
            honeypot,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: 'Limite atingido',
            description: data.error || 'Muitas tentativas. Aguarde antes de tentar novamente.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erro',
            description: data.error || 'Não foi possível enviar sua mensagem.',
            variant: 'destructive',
          });
        }
      } else {
        setSent(true);
        toast({ title: 'Mensagem enviada!', description: 'Entraremos em contato em breve.' });
      }
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar sua mensagem. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const socialLinks = [
    { icon: Linkedin, href: 'https://www.linkedin.com/in/elizabethrenz/', label: 'LinkedIn' },
    { icon: Instagram, href: 'https://www.instagram.com/bethrenz/', label: 'Instagram' },
    { icon: Facebook, href: 'https://www.facebook.com/elizabeth.renz.3', label: 'Facebook' },
    { icon: Youtube, href: 'https://www.youtube.com/@BetheCiapodcast', label: 'YouTube' },
  ];

  return (
    <Layout>
      <PageHero title="Contato" subtitle="Estamos prontos para atender você" />
      
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <AnimatedSection direction="left">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
                  Fale Conosco
                </h2>
                <p className="text-muted-foreground mb-8">
                  Entre em contato para saber como podemos impulsionar a comunicação da sua empresa.
                </p>

                <div className="space-y-6 mb-10">
                  <motion.a
                    href="mailto:imprensa@bethrenz.com.br"
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-secondary hover:bg-primary/10 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                      <Mail className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-semibold text-foreground">imprensa@bethrenz.com.br</p>
                    </div>
                  </motion.a>

                  <motion.a
                    href="tel:+5551981846227"
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-secondary hover:bg-primary/10 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                      <Phone className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p className="font-semibold text-foreground">(51) 98184-6227</p>
                    </div>
                  </motion.a>

                  <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Localização</p>
                      <p className="font-semibold text-foreground">Rio Grande do Sul, Brasil</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-4">Redes Sociais</h3>
                  <div className="flex gap-3">
                    {socialLinks.map((social, index) => (
                      <motion.a
                        key={social.label}
                        href={social.href}
                        whileHover={{ y: -5, scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                        aria-label={social.label}
                      >
                        <social.icon className="h-5 w-5" />
                      </motion.a>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right">
              <Card className="bg-card border-border shadow-card overflow-hidden">
                <CardContent className="p-8">
                  {sent ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-12"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
                      >
                        <CheckCircle className="h-10 w-10 text-primary" />
                      </motion.div>
                      <h3 className="text-2xl font-display font-bold text-foreground mb-3">
                        Mensagem Enviada!
                      </h3>
                      <p className="text-muted-foreground">
                        Obrigado pelo contato. Retornaremos em breve.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Honeypot field - hidden from users, catches bots */}
                      <input
                        type="text"
                        name="website"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                        style={{ display: 'none' }}
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                      />
                      <div>
                        <Input
                          placeholder="Seu nome"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                          minLength={2}
                          maxLength={200}
                          className="h-12 bg-secondary border-0"
                        />
                      </div>
                      <div>
                        <Input
                          type="email"
                          placeholder="Seu email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          required
                          maxLength={320}
                          className="h-12 bg-secondary border-0"
                        />
                      </div>
                      <div>
                        <Input
                          type="tel"
                          placeholder="Telefone (opcional)"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          maxLength={20}
                          className="h-12 bg-secondary border-0"
                        />
                      </div>
                      <div>
                        <Textarea
                          placeholder="Sua mensagem (mínimo 10 caracteres)"
                          rows={5}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          required
                          minLength={10}
                          maxLength={5000}
                          className="bg-secondary border-0 resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                          {form.message.length}/5000
                        </p>
                      </div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button type="submit" className="w-full h-12 shine" disabled={loading}>
                          <Send className="h-4 w-4 mr-2" />
                          {loading ? 'Enviando...' : 'Enviar Mensagem'}
                        </Button>
                      </motion.div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </Layout>
  );
}
