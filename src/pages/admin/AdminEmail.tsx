import { useState, useRef, useCallback } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Send, 
  Paperclip, 
  Trash2, 
  RefreshCw,
  Bold,
  Italic,
  Underline,
  Link2,
  List,
  ListOrdered,
  Loader2,
  X,
  Mail,
  Clock,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Attachment {
  file: File;
  name: string;
  size: number;
  type: string;
}

interface SentEmail {
  id: string;
  to_addresses: string[];
  cc_addresses: string[] | null;
  bcc_addresses: string[] | null;
  subject: string;
  body_html: string;
  attachments: Array<{ name: string; size: number; type: string }> | null;
  sent_at: string;
  sent_by: string | null;
}

// Default email signature
const DEFAULT_SIGNATURE = `
<br><br>
<div style="font-family: Arial, sans-serif; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 15px; margin-top: 20px;">
  <p style="margin: 0; font-weight: bold; color: #333;">Beth Renz Comunicação Estratégica</p>
  <p style="margin: 5px 0;">imprensa@bethrenz.com.br</p>
  <p style="margin: 5px 0;"><a href="https://bethrenz.com.br" style="color: #0066cc;">bethrenz.com.br</a></p>
</div>
`;

export default function AdminEmail() {
  const [activeTab, setActiveTab] = useState('compose');
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [sending, setSending] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<SentEmail | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch sent emails
  const { data: sentEmails = [], isLoading: loadingEmails, refetch: refetchEmails } = useQuery({
    queryKey: ['sent-emails'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sent_emails')
        .select('*')
        .order('sent_at', { ascending: false });
      
      if (error) throw error;
      return data as SentEmail[];
    },
  });

  // Delete email mutation
  const deleteEmailMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sent_emails').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sent-emails'] });
      toast.success('Email excluído');
    },
    onError: () => {
      toast.error('Erro ao excluir email');
    },
  });

  const handleFormat = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];
    let totalSize = attachments.reduce((acc, att) => acc + att.size, 0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (totalSize + file.size > 16 * 1024 * 1024) {
        toast.error('Limite de 16MB excedido');
        break;
      }
      totalSize += file.size;
      newAttachments.push({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    e.target.value = '';
  }, [attachments]);

  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSend = async () => {
    if (!to.trim()) {
      toast.error('Informe o destinatário');
      return;
    }
    if (!subject.trim()) {
      toast.error('Informe o assunto');
      return;
    }

    const bodyContent = editorRef.current?.innerHTML || '';
    if (!bodyContent.trim()) {
      toast.error('Escreva o conteúdo do email');
      return;
    }

    setSending(true);

    try {
      // Prepare attachments as base64
      const attachmentsData = await Promise.all(
        attachments.map(async (att) => {
          const buffer = await att.file.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = '';
          bytes.forEach(byte => binary += String.fromCharCode(byte));
          return {
            filename: att.name,
            content: btoa(binary),
            contentType: att.type,
          };
        })
      );

      const fullHtml = bodyContent + DEFAULT_SIGNATURE;

      // Parse email addresses
      const toAddresses = to.split(',').map(e => e.trim()).filter(Boolean);
      const ccAddresses = cc ? cc.split(',').map(e => e.trim()).filter(Boolean) : undefined;
      const bccAddresses = bcc ? bcc.split(',').map(e => e.trim()).filter(Boolean) : undefined;

      // Send email via edge function
      const response = await supabase.functions.invoke('email-send', {
        body: {
          to: toAddresses,
          subject,
          html: fullHtml,
          cc: ccAddresses,
          bcc: bccAddresses,
          attachments: attachmentsData.length > 0 ? attachmentsData : undefined,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao enviar email');
      }

      const result = response.data;
      if (!result.success) {
        throw new Error(result.error || 'Erro ao enviar email');
      }

      // Save to sent emails history
      await supabase.from('sent_emails').insert({
        to_addresses: toAddresses,
        cc_addresses: ccAddresses || null,
        bcc_addresses: bccAddresses || null,
        subject,
        body_html: fullHtml,
        attachments: attachments.length > 0 ? attachments.map(a => ({
          name: a.name,
          size: a.size,
          type: a.type,
        })) : null,
      });

      toast.success('Email enviado com sucesso!');
      
      // Clear form
      setTo('');
      setCc('');
      setBcc('');
      setSubject('');
      setBody('');
      setAttachments([]);
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }

      // Refresh sent emails list
      queryClient.invalidateQueries({ queryKey: ['sent-emails'] });

    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar email');
    } finally {
      setSending(false);
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Insira a URL:');
    if (url) {
      const text = prompt('Texto do link:', url);
      handleFormat('insertHTML', `<a href="${url}" target="_blank" style="color: #0066cc;">${text || url}</a>`);
    }
  };

  return (
    <AdminLayout title="Email">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Novo Email
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Enviados
          </TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compor Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* To */}
              <div className="space-y-2">
                <Label htmlFor="to">Para *</Label>
                <Input
                  id="to"
                  type="text"
                  placeholder="email@exemplo.com (separe múltiplos com vírgula)"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>

              {/* CC */}
              <div className="space-y-2">
                <Label htmlFor="cc">CC</Label>
                <Input
                  id="cc"
                  type="text"
                  placeholder="Cópia para..."
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                />
              </div>

              {/* BCC */}
              <div className="space-y-2">
                <Label htmlFor="bcc">CCO (Cópia oculta)</Label>
                <Input
                  id="bcc"
                  type="text"
                  placeholder="Cópia oculta para..."
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto *</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Assunto do email"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              {/* Rich Text Editor */}
              <div className="space-y-2">
                <Label>Mensagem *</Label>
                <div className="border rounded-lg overflow-hidden">
                  {/* Toolbar */}
                  <div className="flex flex-wrap gap-1 p-2 bg-muted border-b">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFormat('bold')}
                      className="h-8 w-8 p-0"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFormat('italic')}
                      className="h-8 w-8 p-0"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFormat('underline')}
                      className="h-8 w-8 p-0"
                    >
                      <Underline className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border self-center mx-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleInsertLink}
                      className="h-8 w-8 p-0"
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFormat('insertUnorderedList')}
                      className="h-8 w-8 p-0"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFormat('insertOrderedList')}
                      className="h-8 w-8 p-0"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Editor */}
                  <div
                    ref={editorRef}
                    contentEditable
                    className="min-h-[200px] p-4 focus:outline-none bg-background"
                    onInput={(e) => setBody(e.currentTarget.innerHTML)}
                    style={{ whiteSpace: 'pre-wrap' }}
                  />
                </div>
              </div>

              {/* Signature Preview */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Assinatura (adicionada automaticamente):</p>
                <div 
                  className="text-sm"
                  dangerouslySetInnerHTML={{ __html: DEFAULT_SIGNATURE }}
                />
              </div>

              {/* Attachments */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Anexos (máx. 16MB)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Anexar arquivo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((att, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Paperclip className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm truncate">{att.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({formatFileSize(att.size)})
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="h-8 w-8 p-0 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">
                      Total: {formatFileSize(attachments.reduce((acc, att) => acc + att.size, 0))}
                    </p>
                  </div>
                )}
              </div>

              {/* Send Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSend}
                  disabled={sending}
                  className="min-w-[120px]"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sent Tab */}
        <TabsContent value="sent" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Emails Enviados</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchEmails()}
                  disabled={loadingEmails}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loadingEmails ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingEmails ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : sentEmails.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum email enviado ainda
                </p>
              ) : (
                <div className="space-y-2">
                  {sentEmails.map((email) => (
                    <div
                      key={email.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedEmail(email)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm font-medium truncate">
                            {email.to_addresses.join(', ')}
                          </span>
                        </div>
                        <p className="text-sm truncate">{email.subject}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(email.sent_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                          {email.attachments && email.attachments.length > 0 && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Paperclip className="h-3 w-3" />
                              {email.attachments.length}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Excluir este email do histórico?')) {
                            deleteEmailMutation.mutate(email.id);
                          }
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Email Detail Dialog */}
      <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEmail?.subject}</DialogTitle>
          </DialogHeader>
          {selectedEmail && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Para: </span>
                  {selectedEmail.to_addresses.join(', ')}
                </p>
                {selectedEmail.cc_addresses && selectedEmail.cc_addresses.length > 0 && (
                  <p>
                    <span className="font-medium">CC: </span>
                    {selectedEmail.cc_addresses.join(', ')}
                  </p>
                )}
                {selectedEmail.bcc_addresses && selectedEmail.bcc_addresses.length > 0 && (
                  <p>
                    <span className="font-medium">CCO: </span>
                    {selectedEmail.bcc_addresses.join(', ')}
                  </p>
                )}
                <p className="text-muted-foreground">
                  {format(new Date(selectedEmail.sent_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>

              <div className="border-t pt-4">
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
                />
              </div>

              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="border-t pt-4">
                  <p className="font-medium mb-2">Anexos:</p>
                  <div className="space-y-1">
                    {selectedEmail.attachments.map((att, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Paperclip className="h-4 w-4" />
                        <span>{att.name}</span>
                        <span className="text-muted-foreground">
                          ({formatFileSize(att.size)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
