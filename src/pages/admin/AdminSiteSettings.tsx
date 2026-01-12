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
  favicon_url?: string;
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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
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

  const uploadFile = async (file: File, type: 'logo' | 'favicon') => {
    const maxSize = type === 'favicon' ? 1 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: 'Arquivo muito grande', description: `Máximo ${type === 'favicon' ? '1MB' : '5MB'}`, variant: 'destructive' });
      return;
    }

    if (type === 'logo') setUploadingLogo(true);
    else setUploadingFavicon(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `branding/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      if (type === 'logo') {
        updateSetting('logo_url', publicUrl);
        toast({ title: 'Logo enviada!' });
      } else {
        updateSetting('favicon_url', publicUrl);
        toast({ title: 'Favicon enviado!' });
        // Update favicon in the page
        updateFaviconInPage(publicUrl);
      }
    } catch (error: any) {
      toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else setUploadingFavicon(false);
    }
  };

  const updateFaviconInPage = (url: string) => {
    // Update favicon dynamically
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;
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
            <CardContent className="space-y-8">
              {/* Logo Section */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Logomarca</Label>
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
                        if (file) uploadFile(file, 'logo');
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      disabled={uploadingLogo}
                    >
                      {uploadingLogo ? (
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
                <div>
                  <Label className="text-sm">URL da Logo (alternativa)</Label>
                  <Input
                    value={settings.logo_url || ''}
                    onChange={(e) => updateSetting('logo_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="border-t pt-6" />

              {/* Favicon Section */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Favicon</Label>
                <p className="text-sm text-muted-foreground -mt-2">
                  Ícone que aparece na aba do navegador
                </p>
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center border-2 border-dashed border-border overflow-hidden">
                    {settings.favicon_url ? (
                      <img src={settings.favicon_url} alt="Favicon" className="w-12 h-12 object-contain" />
                    ) : (
                      <span className="text-xs text-muted-foreground text-center">Sem<br/>favicon</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/png,image/x-icon,image/svg+xml,.ico"
                      className="hidden"
                      id="favicon-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadFile(file, 'favicon');
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('favicon-upload')?.click()}
                      disabled={uploadingFavicon}
                    >
                      {uploadingFavicon ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Enviar Favicon
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      ICO, PNG ou SVG. Máx 1MB.<br />
                      Tamanho ideal: 32x32 ou 64x64 pixels
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm">URL do Favicon (alternativa)</Label>
                  <Input
                    value={settings.favicon_url || ''}
                    onChange={(e) => updateSetting('favicon_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
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
