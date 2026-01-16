import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Image, Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { DraggableImagePosition } from '@/components/admin/DraggableImagePosition';

interface HomepageSection {
  id: string;
  section_key: string;
  section_label: string;
  visible: boolean;
  display_order: number;
}

interface HomepageSlide {
  id: string;
  image_url: string;
  title: string | null;
  link: string | null;
  display_order: number;
  active: boolean;
  image_position: string | null;
}

export default function AdminHomepage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [slides, setSlides] = useState<HomepageSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HomepageSlide | null>(null);
  const [slideForm, setSlideForm] = useState({
    image_url: '',
    title: '',
    link: '',
    active: true,
    image_position: '50',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [sectionsRes, slidesRes] = await Promise.all([
      supabase.from('homepage_sections').select('*').order('display_order'),
      supabase.from('homepage_slides').select('*').order('display_order'),
    ]);

    if (sectionsRes.data) setSections(sectionsRes.data);
    if (slidesRes.data) setSlides(slidesRes.data);
    setLoading(false);
  };

  const toggleSectionVisibility = async (section: HomepageSection) => {
    const newVisible = !section.visible;
    setSections(prev =>
      prev.map(s => (s.id === section.id ? { ...s, visible: newVisible } : s))
    );

    const { error } = await supabase
      .from('homepage_sections')
      .update({ visible: newVisible, updated_at: new Date().toISOString() })
      .eq('id', section.id);

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      setSections(prev =>
        prev.map(s => (s.id === section.id ? { ...s, visible: !newVisible } : s))
      );
    }
  };

  const handleSlideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      image_url: slideForm.image_url,
      title: slideForm.title || null,
      link: slideForm.link || null,
      active: slideForm.active,
      image_position: slideForm.image_position,
      display_order: editingSlide?.display_order ?? slides.length,
    };

    let error;
    if (editingSlide) {
      ({ error } = await supabase.from('homepage_slides').update(payload).eq('id', editingSlide.id));
    } else {
      ({ error } = await supabase.from('homepage_slides').insert(payload));
    }

    setSaving(false);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Slide salvo!' });
      setDialogOpen(false);
      resetSlideForm();
      fetchData();
    }
  };

  const deleteSlide = async (id: string) => {
    if (!confirm('Excluir este slide?')) return;
    const { error } = await supabase.from('homepage_slides').delete().eq('id', id);
    if (!error) {
      toast({ title: 'Slide excluído!' });
      fetchData();
    }
  };

  const resetSlideForm = () => {
    setSlideForm({ image_url: '', title: '', link: '', active: true, image_position: '50' });
    setEditingSlide(null);
  };

  const openEditSlide = (slide: HomepageSlide) => {
    setEditingSlide(slide);
    setSlideForm({
      image_url: slide.image_url,
      title: slide.title || '',
      link: slide.link || '',
      active: slide.active,
      image_position: slide.image_position || '50',
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <AdminLayout title="Layout da Página Inicial">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Layout da Página Inicial">
      <p className="text-muted-foreground mb-6">
        Configure quais seções aparecem na página inicial e gerencie o slider de imagens
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sections Visibility */}
        <Card>
          <CardHeader>
            <CardTitle>Seções da Página Inicial</CardTitle>
            <CardDescription>
              Ative ou desative as seções que aparecem na home
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <span className="font-medium">{section.section_label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {section.visible ? (
                      <Eye className="h-4 w-4 text-primary" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Switch
                      checked={section.visible}
                      onCheckedChange={() => toggleSectionVisibility(section)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Homepage Slider */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Slider de Imagens</CardTitle>
              <CardDescription>
                Carrossel no topo da página (opcional)
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetSlideForm(); }}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Slide
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingSlide ? 'Editar' : 'Novo'} Slide</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSlideSubmit} className="space-y-4">
                  <ImageUpload
                    value={slideForm.image_url}
                    onChange={(value) => setSlideForm({ ...slideForm, image_url: value })}
                    label="Imagem do Slide *"
                    folder="slides"
                  />
                  <div>
                    <Label>Título (opcional)</Label>
                    <Input
                      value={slideForm.title}
                      onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                      placeholder="Texto do slide"
                    />
                  </div>
                  <div>
                    <Label>Link (opcional)</Label>
                    <Input
                      value={slideForm.link}
                      onChange={(e) => setSlideForm({ ...slideForm, link: e.target.value })}
                      placeholder="https://... ou /press-releases/id"
                    />
                  </div>
                  {slideForm.image_url && (
                    <div>
                      <Label>Posição da Imagem</Label>
                      <DraggableImagePosition
                        imageUrl={slideForm.image_url}
                        position={parseInt(slideForm.image_position) || 50}
                        onChange={(pos) => setSlideForm({ ...slideForm, image_position: pos.toString() })}
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={slideForm.active}
                      onCheckedChange={(checked) => setSlideForm({ ...slideForm, active: checked })}
                    />
                    <Label>Ativo</Label>
                  </div>
                  <div className="flex gap-2 justify-end pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={saving || !slideForm.image_url}>
                      {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {slides.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Image className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum slide cadastrado</p>
                <p className="text-sm">O slider não aparecerá na página</p>
              </div>
            ) : (
              <div className="space-y-3">
                {slides.map((slide) => (
                  <div
                    key={slide.id}
                    className={`flex items-center gap-3 p-2 rounded-lg border ${
                      slide.active ? 'bg-card' : 'bg-secondary/50 opacity-60'
                    }`}
                  >
                    <div className="w-24 h-14 bg-secondary rounded overflow-hidden flex-shrink-0">
                      <img
                        src={slide.image_url}
                        alt={slide.title || 'Slide'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {slide.title || 'Sem título'}
                      </p>
                      {slide.link && (
                        <p className="text-xs text-muted-foreground truncate">
                          {slide.link}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditSlide(slide)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => deleteSlide(slide.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
