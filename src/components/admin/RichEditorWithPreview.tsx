import { useState } from 'react';
import { WysiwygEditor } from './WysiwygEditor';
import { RichContentRenderer } from '@/components/RichContentRenderer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Edit3 } from 'lucide-react';

interface RichEditorWithPreviewProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  minRows?: number; // Keep for backwards compatibility, converts to minHeight
  label?: string;
}

export function RichEditorWithPreview({
  value,
  onChange,
  placeholder,
  minHeight = 250,
  minRows,
  label = 'Conteúdo',
}: RichEditorWithPreviewProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'split'>('split');
  
  // Convert minRows to minHeight if provided (for backwards compatibility)
  const calculatedMinHeight = minRows ? minRows * 24 : minHeight;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{label}</label>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="h-8">
              <TabsTrigger value="edit" className="text-xs px-2 h-6">
                <Edit3 className="h-3 w-3 mr-1" />
                Editar
              </TabsTrigger>
              <TabsTrigger value="split" className="text-xs px-2 h-6">
                Split
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs px-2 h-6">
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {activeTab === 'edit' && (
        <WysiwygEditor
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          minHeight={calculatedMinHeight}
        />
      )}

      {activeTab === 'preview' && (
        <div className="min-h-[200px] p-4 bg-card border rounded-lg overflow-auto">
          {value ? (
            <RichContentRenderer content={value} />
          ) : (
            <p className="text-muted-foreground italic">
              Nenhum conteúdo para visualizar
            </p>
          )}
        </div>
      )}

      {activeTab === 'split' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Editor</p>
            <WysiwygEditor
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              minHeight={Math.max(180, calculatedMinHeight - 50)}
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Preview em Tempo Real</p>
            <div className="min-h-[200px] max-h-[500px] p-4 bg-card border rounded-lg overflow-auto">
              {value ? (
                <RichContentRenderer content={value} />
              ) : (
                <p className="text-muted-foreground italic text-sm">
                  Digite para ver a prévia...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
