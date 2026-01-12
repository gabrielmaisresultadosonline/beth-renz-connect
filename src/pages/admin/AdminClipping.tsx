import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { RichEditorWithPreview } from '@/components/admin/RichEditorWithPreview';

interface Clipping {
  id: string;
  title: string;
  source: string | null;
  image_url: string | null;
  link: string | null;
  published_at: string | null;
  created_at: string;
  content: string | null;
}

export default function AdminClipping() {
  const [items, setItems] = useState<Clipping[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Clipping | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    source: '',
    image_url: '',
    link: '',
    published_at: '',
    content: '',
  });
  const { toast } = useToast();

  const fetchItems = async () => {
    const { data } = await supabase.from('clipping').select('*').order('published_at', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      source: formData.source || null,
      image_url: formData.image_url || null,
      link: formData.link || null,
      published_at: formData.published_at || null,
      content: formData.content || null,
    };

    let error;
    if (editingItem) {
      ({ error } = await supabase.from('clipping').update(payload).eq('id', editingItem.id));
    } else {
      ({ error } = await supabase.from('clipping').insert(payload));
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
    if (!confirm('Excluir este clipping?')) return;
    const { error } = await supabase.from('clipping').delete().eq('id', id);
    if (!error) { toast({ title: 'Excluído!' }); fetchItems(); }
  };

  const resetForm = () => {
    setFormData({ title: '', source: '', image_url: '', link: '', published_at: '', content: '' });
    setEditingItem(null);
  };

  const openEdit = (item: Clipping) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      source: item.source || '',
      image_url: item.image_url || '',
      link: item.link || '',
      published_at: item.published_at ? item.published_at.split('T')[0] : '',
      content: item.content || '',
    });
    setDialogOpen(true);
  };

  return (
    <AdminLayout title="Clipping">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <p className="text-muted-foreground">Gerencie as publicações na mídia</p>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo Clipping</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingItem ? 'Editar' : 'Novo'} Clipping</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label>Título *</Label>
                    <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required placeholder="Título da publicação" />
                  </div>
                  <div>
                    <Label>Veículo/Fonte</Label>
                    <Input value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} placeholder="Ex: Jornal XYZ, Revista ABC..." />
                  </div>
                  <div>
                    <Label>Link da Publicação (opcional)</Label>
                    <Input value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="https://..." />
                  </div>
                  <div>
                    <Label>Data de Publicação</Label>
                    <Input type="date" value={formData.published_at} onChange={(e) => setFormData({ ...formData, published_at: e.target.value })} />
                  </div>
                </div>
                <div>
                  <ImageUpload
                    value={formData.image_url}
                    onChange={(value) => setFormData({ ...formData, image_url: value })}
                    label="Imagem da Publicação"
                    folder="clipping"
                  />
                </div>
              </div>
              
              <RichEditorWithPreview
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                label="Descrição / Texto (opcional)"
                placeholder="Adicione uma breve descrição ou o texto completo da matéria..."
                minRows={6}
              />
              
              <div className="flex gap-2 justify-end pt-4 border-t">
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
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum clipping cadastrado</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="relative group overflow-hidden transition-shadow hover:shadow-lg">
              <div className="aspect-[4/3] bg-secondary">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm p-4 text-center">{item.title}</div>
                )}
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium line-clamp-2">{item.title}</p>
                {item.source && <p className="text-xs text-muted-foreground mt-1">{item.source}</p>}
                {item.published_at && <p className="text-xs text-muted-foreground">{format(new Date(item.published_at), 'dd/MM/yyyy')}</p>}
              </CardContent>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="secondary" className="h-8 w-8"><ExternalLink className="h-4 w-4" /></Button>
                  </a>
                )}
                <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="secondary" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
