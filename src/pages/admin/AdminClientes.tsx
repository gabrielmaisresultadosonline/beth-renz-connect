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
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  active: boolean | null;
  display_order: number | null;
}

export default function AdminClientes() {
  const [items, setItems] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    website: '',
    active: true,
  });
  const { toast } = useToast();

  const fetchItems = async () => {
    const { data } = await supabase.from('clients').select('*').order('display_order', { ascending: true });
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      logo_url: formData.logo_url || null,
      website: formData.website || null,
      active: formData.active,
      display_order: editingItem?.display_order ?? items.length,
    };

    let error;
    if (editingItem) {
      ({ error } = await supabase.from('clients').update(payload).eq('id', editingItem.id));
    } else {
      ({ error } = await supabase.from('clients').insert(payload));
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
    if (!confirm('Excluir este cliente?')) return;
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (!error) { toast({ title: 'Excluído!' }); fetchItems(); }
  };

  const resetForm = () => {
    setFormData({ name: '', logo_url: '', website: '', active: true });
    setEditingItem(null);
  };

  const openEdit = (item: Client) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      logo_url: item.logo_url || '',
      website: item.website || '',
      active: item.active ?? true,
    });
    setDialogOpen(true);
  };

  return (
    <AdminLayout title="Clientes">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Gerencie os logos dos clientes</p>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingItem ? 'Editar' : 'Novo'} Cliente</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Nome *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
              <div><Label>URL do Logo</Label><Input value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} placeholder="https://..." /></div>
              <div><Label>Website</Label><Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://..." /></div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.active} onCheckedChange={(checked) => setFormData({ ...formData, active: checked })} />
                <Label>Ativo</Label>
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
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum cliente cadastrado</CardContent></Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <Card key={item.id} className={`relative group ${!item.active ? 'opacity-50' : ''}`}>
              <CardContent className="p-4 text-center">
                <div className="aspect-[3/2] bg-secondary rounded mb-2 flex items-center justify-center overflow-hidden">
                  {item.logo_url ? (
                    <img src={item.logo_url} alt={item.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  )}
                </div>
                <p className="text-sm font-medium truncate">{item.name}</p>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3 w-3" /></Button>
                  <Button size="icon" variant="secondary" className="h-7 w-7 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
