import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { WysiwygEditor } from '@/components/admin/WysiwygEditor';
import { ImageUpload } from '@/components/admin/ImageUpload';

interface Tip {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  published: boolean | null;
  created_at: string;
  slug: string | null;
}

export default function AdminDicas() {
  const [items, setItems] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Tip | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    published: false,
    slug: '',
  });
  const { toast } = useToast();

  const fetchItems = async () => {
    const { data } = await supabase.from('tips').select('*').order('created_at', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      content: formData.content,
      image_url: formData.image_url || null,
      published: formData.published,
      slug: formData.slug.trim() || null, // Trigger will generate if empty
    };

    let error;
    if (editingItem) {
      ({ error } = await supabase.from('tips').update(payload).eq('id', editingItem.id));
    } else {
      ({ error } = await supabase.from('tips').insert(payload));
    }

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso!' });
      setDialogOpen(false);
      resetForm();
      fetchItems();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta dica?')) return;
    const { error } = await supabase.from('tips').delete().eq('id', id);
    if (!error) { toast({ title: 'Excluído!' }); fetchItems(); }
  };

  const togglePublish = async (item: Tip) => {
    const { error } = await supabase.from('tips').update({ published: !item.published }).eq('id', item.id);
    if (!error) fetchItems();
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', image_url: '', published: false, slug: '' });
    setEditingItem(null);
  };

  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const openEdit = (item: Tip) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      image_url: item.image_url || '',
      published: item.published ?? false,
      slug: item.slug || '',
    });
    setDialogOpen(true);
  };

  return (
    <AdminLayout title="Dicas de Comunicação">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <p className="text-muted-foreground">Gerencie as dicas e artigos</p>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nova Dica</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Editar' : 'Nova'} Dica</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <Label>Título *</Label>
                    <Input 
                      value={formData.title} 
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        const updates: any = { title: newTitle };
                        // Auto-generate slug if slug is empty or matches previous auto-generated slug
                        if (!formData.slug || formData.slug === generateSlugFromTitle(formData.title)) {
                          updates.slug = generateSlugFromTitle(newTitle);
                        }
                        setFormData({ ...formData, ...updates });
                      }} 
                      required 
                      placeholder="Título da dica"
                    />
                  </div>
                  <div>
                    <Label>URL Amigável (slug)</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={formData.slug} 
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} 
                        placeholder="url-amigavel-da-dica"
                        className="font-mono text-sm"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setFormData({ ...formData, slug: generateSlugFromTitle(formData.title) })}
                      >
                        Gerar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Deixe vazio para gerar automaticamente a partir do título
                    </p>
                  </div>
                  <div>
                    <Label>Conteúdo *</Label>
                    <WysiwygEditor 
                      value={formData.content} 
                      onChange={(value) => setFormData({ ...formData, content: value })}
                      placeholder="Escreva o conteúdo da dica..."
                      minHeight={200}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <ImageUpload
                    value={formData.image_url}
                    onChange={(value) => setFormData({ ...formData, image_url: value })}
                    label="Imagem de Capa"
                    folder="dicas"
                  />
                  
                  <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                    <Switch 
                      checked={formData.published} 
                      onCheckedChange={(checked) => setFormData({ ...formData, published: checked })} 
                    />
                    <div>
                      <Label className="cursor-pointer">Publicar</Label>
                      <p className="text-xs text-muted-foreground">Visível no site</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingItem ? 'Salvar' : 'Criar Dica'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : items.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhuma dica cadastrada</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {item.image_url && <img src={item.image_url} alt="" className="w-full sm:w-32 h-24 object-cover rounded-lg" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{item.title}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${item.published ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-secondary text-muted-foreground'}`}>
                        {item.published ? 'Publicada' : 'Rascunho'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.content
                        .replace(/<[^>]+>/g, '') // Remove all HTML tags
                        .replace(/style="[^"]*"/gi, '') // Remove style attributes
                        .replace(/--tw-[^:;]+:[^;]+;?/gi, '') // Remove Tailwind CSS vars
                        .replace(/margin[^:]*:[^;]+;?/gi, '')
                        .replace(/padding[^:]*:[^;]+;?/gi, '')
                        .replace(/border[^:]*:[^;]+;?/gi, '')
                        .replace(/font[^:]*:[^;]+;?/gi, '')
                        .replace(/color:[^;]+;?/gi, '')
                        .replace(/background[^:]*:[^;]+;?/gi, '')
                        .replace(/!\[.*?\]\(.*?\)(\{width=\d+%\})?/g, '') // Remove markdown images
                        .replace(/\[video\]\(.*?\)/g, '') // Remove video embeds
                        .replace(/#{1,6}\s/g, '') // Remove markdown headings
                        .replace(/\*\*/g, '').replace(/\*/g, '') // Remove bold/italic
                        .replace(/&nbsp;/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim()
                        .slice(0, 150)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(item.created_at), 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => togglePublish(item)}>
                      {item.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
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
