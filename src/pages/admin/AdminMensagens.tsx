import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Check, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean | null;
  created_at: string;
}

export default function AdminMensagens() {
  const [items, setItems] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const { toast } = useToast();

  const fetchItems = async () => {
    const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const markAsRead = async (id: string) => {
    const { error } = await supabase.from('contact_messages').update({ read: true }).eq('id', id);
    if (!error) fetchItems();
  };

  const viewMessage = (item: Message) => {
    setSelectedMessage(item);
    if (!item.read) markAsRead(item.id);
  };

  const unreadCount = items.filter(i => !i.read).length;

  return (
    <AdminLayout title="Mensagens de Contato">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground">Mensagens recebidas pelo formulário de contato</p>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} não lidas</Badge>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : items.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhuma mensagem recebida</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className={`hover:shadow-md transition-shadow cursor-pointer ${!item.read ? 'border-primary/50 bg-primary/5' : ''}`} onClick={() => viewMessage(item)}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.read ? 'bg-secondary' : 'bg-primary text-primary-foreground'}`}>
                      <Mail className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{item.name}</span>
                      {!item.read && <Badge variant="default" className="text-xs">Nova</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.email}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{item.message}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground">{format(new Date(item.created_at), 'dd/MM/yyyy HH:mm')}</p>
                    <Button size="sm" variant="ghost" className="mt-1" onClick={(e) => { e.stopPropagation(); viewMessage(item); }}>
                      <Eye className="h-4 w-4 mr-1" /> Ver
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Mensagem de {selectedMessage?.name}</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a href={`mailto:${selectedMessage.email}`} className="text-primary hover:underline">{selectedMessage.email}</a>
              </div>
              {selectedMessage.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <a href={`tel:${selectedMessage.phone}`} className="text-primary hover:underline">{selectedMessage.phone}</a>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Mensagem</p>
                <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recebida em</p>
                <p>{format(new Date(selectedMessage.created_at), "dd/MM/yyyy 'às' HH:mm")}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button asChild className="flex-1">
                  <a href={`mailto:${selectedMessage.email}`}>Responder por Email</a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
