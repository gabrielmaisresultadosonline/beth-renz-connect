import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { RichEditorWithPreview } from '@/components/admin/RichEditorWithPreview';

interface SiteContent {
  id: string;
  section: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  image_url: string | null;
}

const sections = [
  { key: 'about', label: 'Quem Somos', hasSubtitle: true, hasImage: true },
  { key: 'hero', label: 'Banner Principal', hasSubtitle: true, hasImage: true },
  { key: 'contact', label: 'Informações de Contato', hasSubtitle: false, hasImage: false },
];

export default function AdminConfig() {
  const [contents, setContents] = useState<Record<string, SiteContent>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchContent() {
      const { data } = await supabase.from('site_content').select('*');
      const contentMap: Record<string, SiteContent> = {};
      (data || []).forEach((item) => {
        contentMap[item.section] = item;
      });
      setContents(contentMap);
      setLoading(false);
    }
    fetchContent();
  }, []);

  const updateField = (section: string, field: string, value: string) => {
    setContents(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        section,
        [field]: value,
      } as SiteContent
    }));
  };

  const saveSection = async (sectionKey: string) => {
    setSaving(sectionKey);
    const data = contents[sectionKey];
    
    if (!data) {
      setSaving(null);
      return;
    }

    let error;
    if (data.id) {
      ({ error } = await supabase.from('site_content').update({
        title: data.title,
        subtitle: data.subtitle,
        content: data.content,
        image_url: data.image_url,
      }).eq('id', data.id));
    } else {
      ({ error } = await supabase.from('site_content').insert({
        section: sectionKey,
        title: data.title,
        subtitle: data.subtitle,
        content: data.content,
        image_url: data.image_url,
      }));
    }

    setSaving(null);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Salvo com sucesso!' });
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Textos do Site">
        <div className="text-center py-12">Carregando...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Textos do Site">
      <p className="text-muted-foreground mb-6">Edite os textos e conteúdos principais do site</p>

      <div className="space-y-6">
        {sections.map((section) => (
          <Card key={section.key}>
            <CardHeader>
              <CardTitle>{section.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Título</Label>
                    <Input 
                      value={contents[section.key]?.title || ''} 
                      onChange={(e) => updateField(section.key, 'title', e.target.value)} 
                    />
                  </div>
                  {section.hasSubtitle && (
                    <div>
                      <Label>Subtítulo</Label>
                      <Input 
                        value={contents[section.key]?.subtitle || ''} 
                        onChange={(e) => updateField(section.key, 'subtitle', e.target.value)} 
                      />
                    </div>
                  )}
                </div>
                
                {section.hasImage && (
                  <ImageUpload
                    value={contents[section.key]?.image_url || ''}
                    onChange={(value) => updateField(section.key, 'image_url', value)}
                    label="Imagem"
                    folder={`site-content/${section.key}`}
                  />
                )}
              </div>
              
              <RichEditorWithPreview
                value={contents[section.key]?.content || ''}
                onChange={(value) => updateField(section.key, 'content', value)}
                label="Conteúdo"
                placeholder="Digite o conteúdo aqui..."
                minRows={6}
              />
              
              <Button onClick={() => saveSection(section.key)} disabled={saving === section.key}>
                <Save className="h-4 w-4 mr-2" />
                {saving === section.key ? 'Salvando...' : 'Salvar'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
