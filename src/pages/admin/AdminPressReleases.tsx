import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Pin, Calendar, CalendarOff, Settings, Link2, Pencil as EditIcon } from 'lucide-react';
import { format } from 'date-fns';
import { WysiwygEditor } from '@/components/admin/WysiwygEditor';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { DraggableImagePosition } from '@/components/admin/DraggableImagePosition';

interface PressRelease {
  id: string;
  title: string;
  slug: string | null;
  summary: string | null;
  content: string;
  image_url: string | null;
  image_position: string | null;
  published: boolean | null;
  published_at: string | null;
  created_at: string;
  display_order: number | null;
  pinned: boolean | null;
  show_date: boolean | null;
}

// Função para gerar slug a partir do título
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-'); // Remove hífens duplicados
};

export default function AdminPressReleases() {
  const [items, setItems] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PressRelease | null>(null);
  const [homepageLimit, setHomepageLimit] = useState(5);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    image_url: '',
    image_position: 50,
    published: false,
    published_at: '',
    show_date: true,
    pinned: false,
  });
  const [customSlug, setCustomSlug] = useState(false);
  const { toast } = useToast();

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('press_releases')
      .select('*')
      .order('pinned', { ascending: false })
      .order('display_order', { ascending: true })
      .order('published_at', { ascending: false });
    
    if (data) setItems(data);
    setLoading(false);
  };

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('site_content')
      .select('metadata')
      .eq('section', 'settings')
      .single();
    
    const metadata = data?.metadata as Record<string, unknown> | null;
    if (metadata?.press_releases_homepage_limit) {
      setHomepageLimit(metadata.press_releases_homepage_limit as number);
    }
  };

  const saveHomepageLimit = async (limit: number) => {
    const { data: current } = await supabase
      .from('site_content')
      .select('metadata')
      .eq('section', 'settings')
      .single();
    
    const currentMetadata = (current?.metadata as Record<string, unknown>) || {};
    const newMetadata = {
      ...currentMetadata,
      press_releases_homepage_limit: limit,
    };

    const { error } = await supabase
      .from('site_content')
      .update({ metadata: newMetadata })
      .eq('section', 'settings');

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      setHomepageLimit(limit);
      toast({ title: 'Configuração salva!' });
    }
  };

  useEffect(() => {
    fetchItems();
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse the date or use current date if publishing without a date set
    let publishedAt = formData.published_at || null;
    if (formData.published && !publishedAt) {
      publishedAt = new Date().toISOString();
    }
    
    const slugValue = customSlug && formData.slug ? formData.slug : generateSlug(formData.title);
    
    const payload = {
      title: formData.title,
      slug: slugValue,
      summary: formData.summary || null,
      content: formData.content,
      image_url: formData.image_url || null,
      image_position: formData.image_position.toString(),
      published: formData.published,
      published_at: publishedAt,
      show_date: formData.show_date,
      pinned: formData.pinned,
    };

    let error;
    if (editingItem) {
      ({ error } = await supabase.from('press_releases').update(payload).eq('id', editingItem.id));
    } else {
      // Get max display_order for new items
      const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.display_order || 0)) + 1 : 0;
      ({ error } = await supabase.from('press_releases').insert({ ...payload, display_order: maxOrder }));
    }

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: editingItem ? 'Atualizado!' : 'Criado!' });
      setDialogOpen(false);
      resetForm();
      fetchItems();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    
    const { error } = await supabase.from('press_releases').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Excluído!' });
      fetchItems();
    }
  };

  const togglePublish = async (item: PressRelease) => {
    const newPublished = !item.published;
    const { error } = await supabase
      .from('press_releases')
      .update({ 
        published: newPublished,
        published_at: newPublished && !item.published_at ? new Date().toISOString() : item.published_at
      })
      .eq('id', item.id);
    
    if (!error) fetchItems();
  };

  const togglePin = async (item: PressRelease) => {
    const newPinned = !item.pinned;
    const { error } = await supabase
      .from('press_releases')
      .update({ pinned: newPinned })
      .eq('id', item.id);
    
    if (!error) {
      toast({ title: newPinned ? 'Fixado no topo!' : 'Removido do topo' });
      fetchItems();
    }
  };

  const toggleShowDate = async (item: PressRelease) => {
    const newShowDate = !item.show_date;
    const { error } = await supabase
      .from('press_releases')
      .update({ show_date: newShowDate })
      .eq('id', item.id);
    
    if (!error) fetchItems();
  };

  const moveItem = async (item: PressRelease, direction: 'up' | 'down') => {
    const currentIndex = items.findIndex(i => i.id === item.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= items.length) return;
    
    // Reassign sequential display_order to all items first, then swap
    const newItems = [...items];
    const temp = newItems[currentIndex];
    newItems[currentIndex] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    
    // Update all items with new sequential order
    const updates = newItems.map((it, idx) =>
      supabase.from('press_releases').update({ display_order: idx }).eq('id', it.id)
    );
    
    await Promise.all(updates);
    fetchItems();
  };

  const resetForm = () => {
    setFormData({ 
      title: '', 
      slug: '',
      summary: '', 
      content: '', 
      image_url: '', 
      image_position: 50,
      published: false,
      published_at: '',
      show_date: true,
      pinned: false,
    });
    setEditingItem(null);
    setCustomSlug(false);
  };

  const openEdit = (item: PressRelease) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      slug: item.slug || '',
      summary: item.summary || '',
      content: item.content,
      image_url: item.image_url || '',
      image_position: parseInt(item.image_position || '50'),
      published: item.published || false,
      published_at: item.published_at ? item.published_at.slice(0, 16) : '',
      show_date: item.show_date ?? true,
      pinned: item.pinned || false,
    });
    setCustomSlug(!!item.slug);
    setDialogOpen(true);
  };

  return (
    <AdminLayout title="Press Releases">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <p className="text-muted-foreground">Gerencie os comunicados de imprensa</p>
        <div className="flex gap-2">
          {/* Settings Dialog */}
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Settings className="h-4 w-4 mr-2" />Configurações</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurações de Exibição</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Quantidade na Homepage</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Quantos press releases aparecem em destaque na página inicial
                  </p>
                  <Select
                    value={homepageLimit.toString()}
                    onValueChange={(value) => saveHomepageLimit(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'notícia' : 'notícias'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Novo Press Release</Button>
            </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Editar' : 'Novo'} Press Release</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <Label>Título *</Label>
                    <Input 
                      value={formData.title} 
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        if (!customSlug) {
                          setFormData(prev => ({ ...prev, title: e.target.value, slug: generateSlug(e.target.value) }));
                        }
                      }} 
                      required 
                      placeholder="Título do press release"
                    />
                    {/* Preview do slug/URL */}
                    <div className="mt-2 p-2 bg-muted/50 rounded-md">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                          <Link2 className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            /press-releases/<span className="text-foreground font-medium">{customSlug && formData.slug ? formData.slug : generateSlug(formData.title) || 'titulo-do-release'}</span>
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => {
                            if (!customSlug) {
                              setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) }));
                            }
                            setCustomSlug(!customSlug);
                          }}
                        >
                          <EditIcon className="h-3 w-3 mr-1" />
                          {customSlug ? 'Auto' : 'Editar'}
                        </Button>
                      </div>
                      {customSlug && (
                        <Input
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') })}
                          placeholder="slug-personalizado"
                          className="mt-2 h-8 text-sm"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Resumo (opcional)</Label>
                    <Input 
                      value={formData.summary} 
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })} 
                      placeholder="Breve descrição"
                    />
                  </div>
                  <div>
                    <Label>Conteúdo *</Label>
                    <WysiwygEditor 
                      value={formData.content} 
                      onChange={(value) => setFormData({ ...formData, content: value })}
                      placeholder="Escreva o conteúdo do press release..."
                      minHeight={250}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <ImageUpload
                    value={formData.image_url}
                    onChange={(value) => setFormData({ ...formData, image_url: value })}
                    label="Imagem de Capa"
                    folder="press-releases"
                  />
                  
                  {/* Posicionamento da imagem */}
                  {formData.image_url && (
                    <div className="space-y-2">
                      <Label className="text-sm">Posição da Imagem</Label>
                      <DraggableImagePosition
                        imageUrl={formData.image_url}
                        position={formData.image_position}
                        onChange={(pos) => setFormData({ ...formData, image_position: pos })}
                      />
                    </div>
                  )}
                  <div className="space-y-3 p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={formData.published} 
                        onCheckedChange={(checked) => setFormData({ ...formData, published: checked })} 
                      />
                      <div>
                        <Label className="cursor-pointer">Publicar</Label>
                        <p className="text-xs text-muted-foreground">Visível no site</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={formData.pinned} 
                        onCheckedChange={(checked) => setFormData({ ...formData, pinned: checked })} 
                      />
                      <div>
                        <Label className="cursor-pointer">Fixar no Topo</Label>
                        <p className="text-xs text-muted-foreground">Aparece primeiro</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={formData.show_date} 
                        onCheckedChange={(checked) => setFormData({ ...formData, show_date: checked })} 
                      />
                      <div>
                        <Label className="cursor-pointer">Mostrar Data</Label>
                        <p className="text-xs text-muted-foreground">Exibir data no site</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Data de Publicação</Label>
                    <Input 
                      type="datetime-local"
                      value={formData.published_at}
                      onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Defina uma data personalizada
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingItem ? 'Salvar Alterações' : 'Criar Press Release'}
                </Button>
              </div>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum press release cadastrado. Clique em "Novo Press Release" para começar.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <Card 
              key={item.id} 
              className={`hover:shadow-md transition-shadow ${item.pinned ? 'border-primary/50 bg-primary/5' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Reorder buttons */}
                  <div className="flex sm:flex-col gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => moveItem(item, 'up')}
                      disabled={index === 0}
                      className="h-7 w-7"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => moveItem(item, 'down')}
                      disabled={index === items.length - 1}
                      className="h-7 w-7"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {item.image_url && (
                    <img src={item.image_url} alt="" className="w-full sm:w-32 h-24 object-cover rounded-lg" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{item.title}</h3>
                      {item.pinned && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary flex items-center gap-1">
                          <Pin className="h-3 w-3" /> Fixado
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xs rounded-full ${item.published ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-secondary text-muted-foreground'}`}>
                        {item.published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>
                    {item.summary && <p className="text-sm text-muted-foreground line-clamp-1">{item.summary}</p>}
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                      <span>Criado em {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm')}</span>
                      {item.published_at && (
                        <span className="flex items-center gap-1">
                          {item.show_date ? (
                            <>• Publicado: {format(new Date(item.published_at), 'dd/MM/yyyy')}</>
                          ) : (
                            <span className="text-muted-foreground/60">• Data oculta</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => togglePin(item)} 
                      title={item.pinned ? 'Remover do topo' : 'Fixar no topo'}
                      className={item.pinned ? 'text-primary' : ''}
                    >
                      <Pin className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => toggleShowDate(item)} 
                      title={item.show_date ? 'Ocultar data' : 'Mostrar data'}
                    >
                      {item.show_date ? <Calendar className="h-4 w-4" /> : <CalendarOff className="h-4 w-4" />}
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => togglePublish(item)} 
                      title={item.published ? 'Despublicar' : 'Publicar'}
                    >
                      {item.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
