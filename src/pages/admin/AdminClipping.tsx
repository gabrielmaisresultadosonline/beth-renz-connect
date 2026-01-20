import { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, ExternalLink, FileText, Images, Upload, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { MultiImageUpload } from '@/components/admin/MultiImageUpload';
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
  gallery_images: string[] | null;
  pdf_url: string | null;
}

export default function AdminClipping() {
  const [items, setItems] = useState<Clipping[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Clipping | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    source: '',
    image_url: '',
    link: '',
    published_at: '',
    content: '',
    gallery_images: [] as string[],
    pdf_url: '',
  });
  const { toast } = useToast();

  const fetchItems = async () => {
    const { data } = await supabase.from('clipping').select('*').order('published_at', { ascending: false });
    if (data) setItems(data as Clipping[]);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({ title: 'Erro', description: 'Selecione um arquivo PDF', variant: 'destructive' });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({ title: 'Erro', description: 'PDF deve ter no máximo 50MB', variant: 'destructive' });
      return;
    }

    setUploadingPdf(true);
    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `clipping-pdfs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      setFormData({ ...formData, pdf_url: urlData.publicUrl });
      toast({ title: 'PDF enviado!' });
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      source: formData.source || null,
      image_url: formData.image_url || null,
      link: formData.link || null,
      published_at: formData.published_at || null,
      content: formData.content || null,
      gallery_images: formData.gallery_images.length > 0 ? formData.gallery_images : null,
      pdf_url: formData.pdf_url || null,
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
    setFormData({ 
      title: '', 
      source: '', 
      image_url: '', 
      link: '', 
      published_at: '', 
      content: '',
      gallery_images: [],
      pdf_url: '',
    });
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
      gallery_images: item.gallery_images || [],
      pdf_url: item.pdf_url || '',
    });
    setDialogOpen(true);
  };

  const hasGalleryOrPdf = (item: Clipping) => {
    return (item.gallery_images && item.gallery_images.length > 0) || item.pdf_url;
  };

  return (
    <AdminLayout title="Clipping">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <p className="text-muted-foreground">Gerencie as publicações na mídia (jornais, revistas, etc.)</p>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo Clipping</Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingItem ? 'Editar' : 'Novo'} Clipping</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
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
                    <Label>Link da Publicação Online (opcional)</Label>
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
                    label="Imagem de Capa"
                    folder="clipping"
                  />
                </div>
              </div>

              {/* Gallery Images */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Images className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Galeria de Páginas do Jornal/Revista</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Adicione múltiplas imagens das páginas. Ao clicar na capa, o visitante poderá folhear todas as páginas.
                </p>
                <MultiImageUpload
                  value={formData.gallery_images}
                  onChange={(value) => setFormData({ ...formData, gallery_images: value })}
                  label="Páginas do Jornal"
                  folder="clipping-gallery"
                  maxImages={30}
                />
              </div>

              {/* PDF Upload */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">PDF Completo (opcional)</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Faça upload do PDF completo da publicação para download.
                </p>
                
                {formData.pdf_url ? (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">PDF anexado</p>
                      <a href={formData.pdf_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                        Ver PDF
                      </a>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, pdf_url: '' })}
                    >
                      Remover
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => pdfInputRef.current?.click()}
                      disabled={uploadingPdf}
                    >
                      {uploadingPdf ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload PDF (máx. 50MB)
                        </>
                      )}
                    </Button>
                    <input
                      ref={pdfInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                  </div>
                )}
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
              <div className="aspect-[4/3] bg-secondary relative">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm p-4 text-center">{item.title}</div>
                )}
                {/* Indicators */}
                <div className="absolute bottom-2 left-2 flex gap-1">
                  {item.gallery_images && item.gallery_images.length > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Images className="h-3 w-3" />
                      {item.gallery_images.length}
                    </span>
                  )}
                  {item.pdf_url && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      PDF
                    </span>
                  )}
                </div>
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
