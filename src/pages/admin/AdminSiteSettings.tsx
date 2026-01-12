import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Image, Share2, BarChart3, Upload, Loader2 } from 'lucide-react';

interface SiteSettings {
  logo_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  whatsapp?: string;
  facebook_pixel?: string;
  google_analytics?: string;
  google_ads?: string;
}

export default function AdminSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('site_content')
      .select('*')
      .eq('section', 'settings')
      .single();
    
    if (data?.metadata) {
      setSettings(data.metadata as SiteSettings);
    }
    setLoading(false);
  };

  const updateSetting = (key: keyof SiteSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    
    const { data: existing } = await supabase
      .from('site_content')
      .select('id')
      .eq('section', 'settings')
      .single();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from('site_content')
        .update({ metadata: settings as any, updated_at: new Date().toISOString() })
        .eq('id', existing.id));
    } else {
      ({ error } = await supabase
        .from('site_content')
        .insert({ section: 'settings', metadata: settings as any }));
    }

    setSaving(false);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Configurações salvas!' });
    }
  };

  const uploadLogo = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'Máximo 5MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `branding/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      updateSetting('logo_url', publicUrl);
      toast({ title: 'Logo enviada!' });
    } catch (error: any) {
      toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Configurações do Site">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Configurações do Site">
      <p className="text-muted-foreground mb-6">
        Gerencie a identidade visual, redes sociais e códigos de rastreamento
      </p>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Marca
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Redes
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Identidade Visual</CardTitle>
              <CardDescription>
                Faça upload da logomarca e configure a identidade do site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Logomarca</Label>
                <div className="flex items-start gap-6">
                  <div className="w-48 h-24 bg-secondary rounded-lg flex items-center justify-center border-2 border-dashed border-border overflow-hidden">
                    {settings.logo_url ? (
                      <img src={settings.logo_url} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
                    ) : (
                      <span className="text-sm text-muted-foreground">Sem logo</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="logo-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadLogo(file);
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Enviar Logo
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG ou SVG. Máx 5MB.<br />
                      Recomendado: fundo transparente
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label>URL da Logo (alternativa)</Label>
                <Input
                  value={settings.logo_url || ''}
                  onChange={(e) => updateSetting('logo_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociais</CardTitle>
              <CardDescription>
                Configure os links das redes sociais exibidos no site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>LinkedIn</Label>
                  <Input
                    value={settings.linkedin_url || ''}
                    onChange={(e) => updateSetting('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
                <div>
                  <Label>Instagram</Label>
                  <Input
                    value={settings.instagram_url || ''}
                    onChange={(e) => updateSetting('instagram_url', e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <Label>Facebook</Label>
                  <Input
                    value={settings.facebook_url || ''}
                    onChange={(e) => updateSetting('facebook_url', e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div>
                  <Label>Twitter / X</Label>
                  <Input
                    value={settings.twitter_url || ''}
                    onChange={(e) => updateSetting('twitter_url', e.target.value)}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div>
                  <Label>YouTube</Label>
                  <Input
                    value={settings.youtube_url || ''}
                    onChange={(e) => updateSetting('youtube_url', e.target.value)}
                    placeholder="https://youtube.com/@..."
                  />
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <Input
                    value={settings.whatsapp || ''}
                    onChange={(e) => updateSetting('whatsapp', e.target.value)}
                    placeholder="+5511999999999"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle>Códigos de Rastreamento</CardTitle>
              <CardDescription>
                Configure os pixels e códigos de análise (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Facebook Pixel ID</Label>
                <Input
                  value={settings.facebook_pixel || ''}
                  onChange={(e) => updateSetting('facebook_pixel', e.target.value)}
                  placeholder="Apenas o ID numérico"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ex: 1234567890123456
                </p>
              </div>
              <div>
                <Label>Google Analytics (GA4)</Label>
                <Input
                  value={settings.google_analytics || ''}
                  onChange={(e) => updateSetting('google_analytics', e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div>
                <Label>Google Ads Conversion ID</Label>
                <Input
                  value={settings.google_ads || ''}
                  onChange={(e) => updateSetting('google_ads', e.target.value)}
                  placeholder="AW-XXXXXXXXXX"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button onClick={saveSettings} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </AdminLayout>
  );
}
