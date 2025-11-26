import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Upload, FileImage } from 'lucide-react';
import { PrintConfig, PaperFormat } from '../../types/formBuilder';
import { PAPER_FORMATS, DEFAULT_MARGINS, DEFAULT_HEADER_FOOTER_CONFIG } from '../../constants/paperFormats';

interface PrintConfigPanelProps {
  config: PrintConfig;
  onConfigChange: (config: PrintConfig) => void;
}

export const PrintConfigPanel: React.FC<PrintConfigPanelProps> = ({
  config,
  onConfigChange
}) => {
  const handlePaperFormatChange = (formatName: string) => {
    const format = PAPER_FORMATS.find(f => f.name === formatName);
    if (format) {
      onConfigChange({
        ...config,
        paperFormat: format
      });
    }
  };

  const handleMarginChange = (side: keyof typeof config.margins, value: string) => {
    const numValue = parseFloat(value) || 0;
    onConfigChange({
      ...config,
      margins: {
        ...config.margins,
        [side]: numValue
      }
    });
  };

  const handleHeaderChange = (field: string, value: any) => {
    onConfigChange({
      ...config,
      headerFooter: {
        ...config.headerFooter,
        header: {
          ...config.headerFooter.header,
          [field]: value
        }
      }
    });
  };

  const handleFooterChange = (field: string, value: any) => {
    onConfigChange({
      ...config,
      headerFooter: {
        ...config.headerFooter,
        footer: {
          ...config.headerFooter.footer,
          [field]: value
        }
      }
    });
  };

  const handleLogoUpload = (type: 'header' | 'footer', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'header') {
          handleHeaderChange('logo', result);
        } else {
          handleFooterChange('logo', result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Formato do Papel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Formato do Papel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="paper-format" className="text-xs">Formato</Label>
            <Select value={config.paperFormat.name} onValueChange={handlePaperFormatChange}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAPER_FORMATS.map((format) => (
                  <SelectItem key={format.name} value={format.name}>
                    {format.name} ({format.width}x{format.height}mm)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Largura (mm)</Label>
              <Input 
                type="number" 
                value={config.paperFormat.width} 
                readOnly 
                className="h-8 text-xs bg-gray-50"
              />
            </div>
            <div>
              <Label className="text-xs">Altura (mm)</Label>
              <Input 
                type="number" 
                value={config.paperFormat.height} 
                readOnly 
                className="h-8 text-xs bg-gray-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Margens */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Margens (mm)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Superior</Label>
              <Input 
                type="number" 
                value={config.margins.top}
                onChange={(e) => handleMarginChange('top', e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Inferior</Label>
              <Input 
                type="number" 
                value={config.margins.bottom}
                onChange={(e) => handleMarginChange('bottom', e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Esquerda</Label>
              <Input 
                type="number" 
                value={config.margins.left}
                onChange={(e) => handleMarginChange('left', e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Direita</Label>
              <Input 
                type="number" 
                value={config.margins.right}
                onChange={(e) => handleMarginChange('right', e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            Cabeçalho
            <Switch 
              checked={config.headerFooter.header?.enabled || false}
              onCheckedChange={(checked) => handleHeaderChange('enabled', checked)}
            />
          </CardTitle>
        </CardHeader>
        {config.headerFooter.header?.enabled && (
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Logo</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => document.getElementById('header-logo-upload')?.click()}
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Upload
                </Button>
                <input
                  id="header-logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleLogoUpload('header', e)}
                />
                {config.headerFooter.header?.logo && (
                  <FileImage className="w-4 h-4 text-green-600" />
                )}
              </div>
            </div>
            
            <div>
              <Label className="text-xs">Posição do Logo</Label>
              <Select 
                value={config.headerFooter.header?.logoPosition || 'left'} 
                onValueChange={(value) => handleHeaderChange('logoPosition', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Título</Label>
              <Input 
                value={config.headerFooter.header?.title || ''}
                onChange={(e) => handleHeaderChange('title', e.target.value)}
                placeholder="Título do documento"
                className="h-8 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">Subtítulo</Label>
              <Input 
                value={config.headerFooter.header?.subtitle || ''}
                onChange={(e) => handleHeaderChange('subtitle', e.target.value)}
                placeholder="Subtítulo do documento"
                className="h-8 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">Texto Personalizado</Label>
              <Textarea 
                value={config.headerFooter.header?.customText || ''}
                onChange={(e) => handleHeaderChange('customText', e.target.value)}
                placeholder="Texto adicional para o cabeçalho"
                className="text-xs resize-none"
                rows={2}
              />
            </div>

            <div>
              <Label className="text-xs">Altura (mm)</Label>
              <Input 
                type="number" 
                value={config.headerFooter.header?.height || 30}
                onChange={(e) => handleHeaderChange('height', parseFloat(e.target.value) || 30)}
                className="h-8 text-xs"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Rodapé */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            Rodapé
            <Switch 
              checked={config.headerFooter.footer?.enabled || false}
              onCheckedChange={(checked) => handleFooterChange('enabled', checked)}
            />
          </CardTitle>
        </CardHeader>
        {config.headerFooter.footer?.enabled && (
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Logo</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => document.getElementById('footer-logo-upload')?.click()}
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Upload
                </Button>
                <input
                  id="footer-logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleLogoUpload('footer', e)}
                />
                {config.headerFooter.footer?.logo && (
                  <FileImage className="w-4 h-4 text-green-600" />
                )}
              </div>
            </div>
            
            <div>
              <Label className="text-xs">Posição do Logo</Label>
              <Select 
                value={config.headerFooter.footer?.logoPosition || 'left'} 
                onValueChange={(value) => handleFooterChange('logoPosition', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Texto</Label>
              <Input 
                value={config.headerFooter.footer?.text || ''}
                onChange={(e) => handleFooterChange('text', e.target.value)}
                placeholder="Texto do rodapé"
                className="h-8 text-xs"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                checked={config.headerFooter.footer?.showPageNumber || false}
                onCheckedChange={(checked) => handleFooterChange('showPageNumber', checked)}
              />
              <Label className="text-xs">Mostrar número da página</Label>
            </div>

            <div>
              <Label className="text-xs">Texto Personalizado</Label>
              <Textarea 
                value={config.headerFooter.footer?.customText || ''}
                onChange={(e) => handleFooterChange('customText', e.target.value)}
                placeholder="Texto adicional para o rodapé"
                className="text-xs resize-none"
                rows={2}
              />
            </div>

            <div>
              <Label className="text-xs">Altura (mm)</Label>
              <Input 
                type="number" 
                value={config.headerFooter.footer?.height || 20}
                onChange={(e) => handleFooterChange('height', parseFloat(e.target.value) || 20)}
                className="h-8 text-xs"
              />
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};