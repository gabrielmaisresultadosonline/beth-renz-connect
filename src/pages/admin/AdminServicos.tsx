import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, GripVertical, Target, Newspaper, PenTool, User, Video, Briefcase, Mic, Share2, TrendingUp, AlertTriangle, Users, Lightbulb, LucideIcon } from 'lucide-react';

const iconOptions = [
  { value: 'Target', label: 'Alvo', icon: Target },
  { value: 'Newspaper', label: 'Jornal', icon: Newspaper },
  { value: 'PenTool', label: 'Caneta', icon: PenTool },
  { value: 'User', label: 'Usuário', icon: User },
  { value: 'Video', label: 'Vídeo', icon: Video },
  { value: 'Briefcase', label: 'Maleta', icon: Briefcase },
  { value: 'Mic', label: 'Microfone', icon: Mic },
  { value: 'Share2', label: 'Compartilhar', icon: Share2 },
  { value: 'TrendingUp', label: 'Tendência', icon: TrendingUp },
  { value: 'AlertTriangle', label: 'Alerta', icon: AlertTriangle },
  { value: 'Users', label: 'Usuários', icon: Users },
  { value: 'Lightbulb', label: 'Lâmpada', icon: Lightbulb },
];

const iconMap: Record<string, LucideIcon> = {
  Target, Newspaper, PenTool, User, Video, Briefcase, Mic, Share2, TrendingUp, AlertTriangle, Users, Lightbulb,
};

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  how_we_do: string | null;
  display_order: number;
  active: boolean;
}

export default function AdminServicos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Service | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    icon: 'Briefcase',
    features: '',
    how_we_do: '',
    active: true,
  });

  const { data: services, isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const { data } = await supabase
        .from('services')
        .select('*')
        .order('display_order');
      return data as Service[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const featuresArray = data.features.split('\n').map(f => f.trim()).filter(f => f.length > 0);
      
      if (editing) {
        const { error } = await supabase
          .from('services')
          .update({
            title: data.title,
            description: data.description,
            icon: data.icon,
            features: featuresArray,
            how_we_do: data.how_we_do || null,
            active: data.active,
          })
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const maxOrder = services?.reduce((max, s) => Math.max(max, s.display_order || 0), 0) || 0;
        const { error } = await supabase
          .from('services')
          .insert([{
            title: data.title,
            description: data.description,
            icon: data.icon,
            features: featuresArray,
            how_we_do: data.how_we_do || null,
            active: data.active,
            display_order: maxOrder + 1,
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setDialogOpen(false);
      setEditing(null);
      resetForm();
      toast({ title: 'Serviço salvo com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao salvar serviço', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({ title: 'Serviço removido!' });
    },
  });

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      icon: 'Briefcase',
      features: '',
      how_we_do: '',
      active: true,
    });
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    setForm({
      title: service.title,
      description: service.description,
      icon: service.icon,
      features: service.features.join('\n'),
      how_we_do: service.how_we_do || '',
      active: service.active,
    });
    setDialogOpen(true);
  };

  const getIcon = (iconName: string): LucideIcon => iconMap[iconName] || Briefcase;

  return (
    <AdminLayout title="Serviços">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Gerenciar Serviços</h2>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditing(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editing ? 'Editar Serviço' : 'Novo Serviço'}
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveMutation.mutate(form);
                }}
                className="space-y-4"
              >
                <div>
                  <Label>Título</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    placeholder="Ex: Assessoria de Imprensa"
                  />
                </div>
                
                <div>
                  <Label>Ícone</Label>
                  <Select value={form.icon} onValueChange={(value) => setForm({ ...form, icon: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => {
                        const IconComp = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <IconComp className="h-4 w-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    required
                    placeholder="Descreva o serviço..."
                  />
                </div>
                
                <div>
                  <Label>Subtítulo dos Itens (opcional)</Label>
                  <Input
                    value={form.how_we_do}
                    onChange={(e) => setForm({ ...form, how_we_do: e.target.value })}
                    placeholder="Ex: Como fazemos? / O que oferecemos:"
                  />
                </div>
                
                <div>
                  <Label>Itens/Features (um por linha)</Label>
                  <Textarea
                    value={form.features}
                    onChange={(e) => setForm({ ...form, features: e.target.value })}
                    rows={6}
                    placeholder="Conhecendo a empresa
Conhecendo seu público-alvo
Identificando oportunidades"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.active}
                    onCheckedChange={(checked) => setForm({ ...form, active: checked })}
                  />
                  <Label>Ativo</Label>
                </div>
                
                <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : (
          <div className="space-y-4">
            {services?.map((service) => {
              const IconComp = getIcon(service.icon);
              return (
                <Card key={service.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <IconComp className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{service.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{service.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {service.features.length} itens
                        </span>
                        {!service.active && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                            Inativo
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEdit(service)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm('Remover este serviço?')) {
                            deleteMutation.mutate(service.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}