import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Plus, Pencil, Trash2, Users, Handshake, GripVertical } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string | null;
  bio: string;
  photo_url: string | null;
  display_order: number;
  active: boolean;
}

interface Collaborator {
  id: string;
  name: string;
  bio: string;
  photo_url: string | null;
  display_order: number;
  active: boolean;
}

interface SiteContent {
  id: string;
  section: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
}

export default function AdminEquipe() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editingCollab, setEditingCollab] = useState<Collaborator | null>(null);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [collabDialogOpen, setCollabDialogOpen] = useState(false);

  // Form states
  const [memberForm, setMemberForm] = useState({ name: '', role: '', bio: '', photo_url: '', active: true });
  const [collabForm, setCollabForm] = useState({ name: '', bio: '', photo_url: '', active: true });

  // Queries
  const { data: teamMembers, isLoading: loadingMembers } = useQuery({
    queryKey: ['admin-team-members'],
    queryFn: async () => {
      const { data } = await supabase
        .from('team_members')
        .select('*')
        .order('display_order');
      return data as TeamMember[];
    },
  });

  const { data: collaborators, isLoading: loadingCollabs } = useQuery({
    queryKey: ['admin-collaborators'],
    queryFn: async () => {
      const { data } = await supabase
        .from('collaborators')
        .select('*')
        .order('display_order');
      return data as Collaborator[];
    },
  });

  const { data: introContent } = useQuery({
    queryKey: ['admin-site-content', 'quem_somos_intro'],
    queryFn: async () => {
      const { data } = await supabase
        .from('site_content')
        .select('*')
        .eq('section', 'quem_somos_intro')
        .single();
      return data as SiteContent | null;
    },
  });

  const { data: clientesContent } = useQuery({
    queryKey: ['admin-site-content', 'quem_somos_clientes'],
    queryFn: async () => {
      const { data } = await supabase
        .from('site_content')
        .select('*')
        .eq('section', 'quem_somos_clientes')
        .single();
      return data as SiteContent | null;
    },
  });

  // Team member mutations
  const saveMemberMutation = useMutation({
    mutationFn: async (data: typeof memberForm) => {
      if (editingMember) {
        const { error } = await supabase
          .from('team_members')
          .update({
            name: data.name,
            role: data.role || null,
            bio: data.bio,
            photo_url: data.photo_url || null,
            active: data.active,
          })
          .eq('id', editingMember.id);
        if (error) throw error;
      } else {
        const maxOrder = teamMembers?.reduce((max, m) => Math.max(max, m.display_order || 0), 0) || 0;
        const { error } = await supabase
          .from('team_members')
          .insert([{
            name: data.name,
            role: data.role || null,
            bio: data.bio,
            photo_url: data.photo_url || null,
            active: data.active,
            display_order: maxOrder + 1,
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setMemberDialogOpen(false);
      setEditingMember(null);
      setMemberForm({ name: '', role: '', bio: '', photo_url: '', active: true });
      toast({ title: 'Membro salvo com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao salvar membro', variant: 'destructive' });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({ title: 'Membro removido!' });
    },
  });

  // Collaborator mutations
  const saveCollabMutation = useMutation({
    mutationFn: async (data: typeof collabForm) => {
      if (editingCollab) {
        const { error } = await supabase
          .from('collaborators')
          .update({
            name: data.name,
            bio: data.bio,
            photo_url: data.photo_url || null,
            active: data.active,
          })
          .eq('id', editingCollab.id);
        if (error) throw error;
      } else {
        const maxOrder = collaborators?.reduce((max, c) => Math.max(max, c.display_order || 0), 0) || 0;
        const { error } = await supabase
          .from('collaborators')
          .insert([{
            name: data.name,
            bio: data.bio,
            photo_url: data.photo_url || null,
            active: data.active,
            display_order: maxOrder + 1,
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-collaborators'] });
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
      setCollabDialogOpen(false);
      setEditingCollab(null);
      setCollabForm({ name: '', bio: '', photo_url: '', active: true });
      toast({ title: 'Parceiro salvo com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao salvar parceiro', variant: 'destructive' });
    },
  });

  const deleteCollabMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('collaborators').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-collaborators'] });
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
      toast({ title: 'Parceiro removido!' });
    },
  });

  // Site content mutations
  const updateContentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SiteContent> }) => {
      const { error } = await supabase
        .from('site_content')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-site-content'] });
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
      toast({ title: 'Conteúdo atualizado!' });
    },
  });

  const openEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setMemberForm({
      name: member.name,
      role: member.role || '',
      bio: member.bio,
      photo_url: member.photo_url || '',
      active: member.active,
    });
    setMemberDialogOpen(true);
  };

  const openEditCollab = (collab: Collaborator) => {
    setEditingCollab(collab);
    setCollabForm({
      name: collab.name,
      bio: collab.bio,
      photo_url: collab.photo_url || '',
      active: collab.active,
    });
    setCollabDialogOpen(true);
  };

  return (
    <AdminLayout title="Quem Somos">
      <Tabs defaultValue="team" className="space-y-6">
        <TabsList>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            Equipe
          </TabsTrigger>
          <TabsTrigger value="collaborators" className="gap-2">
            <Handshake className="h-4 w-4" />
            Parceiros
          </TabsTrigger>
          <TabsTrigger value="content">Conteúdo da Página</TabsTrigger>
        </TabsList>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Membros da Equipe</h2>
            <Dialog open={memberDialogOpen} onOpenChange={(open) => {
              setMemberDialogOpen(open);
              if (!open) {
                setEditingMember(null);
                setMemberForm({ name: '', role: '', bio: '', photo_url: '', active: true });
              }
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Membro
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingMember ? 'Editar Membro' : 'Novo Membro'}
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveMemberMutation.mutate(memberForm);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label>Nome</Label>
                    <Input
                      value={memberForm.name}
                      onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Cargo</Label>
                    <Input
                      value={memberForm.role}
                      onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                      placeholder="Ex: Fundadora e Diretora"
                    />
                  </div>
                  <div>
                    <Label>Biografia</Label>
                    <Textarea
                      value={memberForm.bio}
                      onChange={(e) => setMemberForm({ ...memberForm, bio: e.target.value })}
                      rows={8}
                      required
                      placeholder="Use linhas em branco para separar parágrafos"
                    />
                  </div>
                  <div>
                    <Label>Foto</Label>
                    <ImageUpload
                      value={memberForm.photo_url}
                      onChange={(url) => setMemberForm({ ...memberForm, photo_url: url })}
                      folder="team"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={memberForm.active}
                      onCheckedChange={(checked) => setMemberForm({ ...memberForm, active: checked })}
                    />
                    <Label>Ativo</Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={saveMemberMutation.isPending}>
                    {saveMemberMutation.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loadingMembers ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : (
            <div className="space-y-4">
              {teamMembers?.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary/50" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{member.name}</h3>
                      {member.role && (
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      )}
                      {!member.active && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          Inativo
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEditMember(member)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm('Remover este membro?')) {
                            deleteMemberMutation.mutate(member.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Collaborators Tab */}
        <TabsContent value="collaborators" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Parceiros de Produção</h2>
            <Dialog open={collabDialogOpen} onOpenChange={(open) => {
              setCollabDialogOpen(open);
              if (!open) {
                setEditingCollab(null);
                setCollabForm({ name: '', bio: '', photo_url: '', active: true });
              }
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Parceiro
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingCollab ? 'Editar Parceiro' : 'Novo Parceiro'}
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveCollabMutation.mutate(collabForm);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label>Nome</Label>
                    <Input
                      value={collabForm.name}
                      onChange={(e) => setCollabForm({ ...collabForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Textarea
                      value={collabForm.bio}
                      onChange={(e) => setCollabForm({ ...collabForm, bio: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <Label>Foto (opcional)</Label>
                    <ImageUpload
                      value={collabForm.photo_url}
                      onChange={(url) => setCollabForm({ ...collabForm, photo_url: url })}
                      folder="collaborators"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={collabForm.active}
                      onCheckedChange={(checked) => setCollabForm({ ...collabForm, active: checked })}
                    />
                    <Label>Ativo</Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={saveCollabMutation.isPending}>
                    {saveCollabMutation.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loadingCollabs ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : (
            <div className="space-y-4">
              {collaborators?.map((collab) => (
                <Card key={collab.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{collab.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{collab.bio}</p>
                      {!collab.active && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          Inativo
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEditCollab(collab)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm('Remover este parceiro?')) {
                            deleteCollabMutation.mutate(collab.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          {/* Intro Content */}
          <Card>
            <CardHeader>
              <CardTitle>Introdução da Página</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {introContent && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    updateContentMutation.mutate({
                      id: introContent.id,
                      data: {
                        subtitle: formData.get('subtitle') as string,
                        content: formData.get('content') as string,
                      },
                    });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label>Primeiro Parágrafo</Label>
                    <Textarea
                      name="subtitle"
                      defaultValue={introContent.subtitle || ''}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Segundo Parágrafo</Label>
                    <Textarea
                      name="content"
                      defaultValue={introContent.content || ''}
                      rows={4}
                    />
                  </div>
                  <Button type="submit" disabled={updateContentMutation.isPending}>
                    Salvar Introdução
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Clients Content */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {clientesContent && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    updateContentMutation.mutate({
                      id: clientesContent.id,
                      data: {
                        title: formData.get('title') as string,
                        content: formData.get('content') as string,
                      },
                    });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label>Título</Label>
                    <Input
                      name="title"
                      defaultValue={clientesContent.title || ''}
                    />
                  </div>
                  <div>
                    <Label>Lista de Clientes</Label>
                    <Textarea
                      name="content"
                      defaultValue={clientesContent.content || ''}
                      rows={4}
                    />
                  </div>
                  <Button type="submit" disabled={updateContentMutation.isPending}>
                    Salvar Clientes
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}