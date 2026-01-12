import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';

interface PressRelease {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  image_url: string | null;
  published: boolean | null;
  published_at: string | null;
  created_at: string;
}

export default function AdminPressReleases() {
  const [items, setItems] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PressRelease | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    image_url: '',
    published: false,
  });
  const { toast } = useToast();

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('press_releases')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      title: formData.title,
      summary: formData.summary || null,
      content: formData.content,
      image_url: formData.image_url || null,
      published: formData.published,
      published_at: formData.published ? new Date().toISOString() : null,
    };

    let error;
    if (editingItem) {
      ({ error } = await supabase.from('press_releases').update(payload).eq('id', editingItem.id));
    } else {
      ({ error } = await supabase.from('press_releases').insert(payload));
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
        published_at: newPublished ? new Date().toISOString() : null
      })
      .eq('id', item.id);
    
    if (!error) fetchItems();
  };

  const resetForm = () => {
    setFormData({ title: '', summary: '', content: '', image_url: '', published: false });
    setEditingItem(null);
  };

  const openEdit = (item: PressRelease) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      summary: item.summary || '',
      content: item.content,
      image_url: item.image_url || '',
      published: item.published || false,
    });
    setDialogOpen(true);
  };

  return (
    <AdminLayout title="Press Releases">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Gerencie os comunicados de imprensa</p>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Editar' : 'Novo'} Press Release</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Título *</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div>
                <Label>Resumo</Label>
                <Textarea value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Conteúdo *</Label>
                <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={8} required />
              </div>
              <div>
                <Label>URL da Imagem</Label>
                <Input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.published} onCheckedChange={(checked) => setFormData({ ...formData, published: checked })} />
                <Label>Publicado</Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : items.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum press release cadastrado</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {item.image_url && (
                    <img src={item.image_url} alt="" className="w-full md:w-24 h-20 object-cover rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{item.title}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${item.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {item.published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>
                    {item.summary && <p className="text-sm text-muted-foreground line-clamp-1">{item.summary}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      Criado em {format(new Date(item.created_at), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => togglePublish(item)} title={item.published ? 'Despublicar' : 'Publicar'}>
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
