import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

interface FrequencyTableProps {
  id: string;
  label?: string;
  month?: string;
  year?: string;
  onChange?: (data: FrequencyData) => void;
  value?: FrequencyData;
}

interface DayData {
  day: number;
  morningEntry: string;
  morningExit: string;
  morningSignature: string;
  afternoonEntry: string;
  afternoonExit: string;
  afternoonSignature: string;
  isWeekend?: boolean;
  isHoliday?: boolean;
}

interface FrequencyData {
  month: string;
  year: string;
  days: DayData[];
  serverSignature: string;
  supervisorSignature: string;
  observations: string;
}

const FrequencyTable: React.FC<FrequencyTableProps> = ({
  id,
  label = "Tabela de Frequência",
  month = new Date().toLocaleString('pt-BR', { month: 'long' }),
  year = new Date().getFullYear().toString(),
  onChange,
  value
}) => {
  // Gerar dados iniciais para 31 dias
  const generateInitialDays = (): DayData[] => {
    return Array.from({ length: 31 }, (_, index) => ({
      day: index + 1,
      morningEntry: '',
      morningExit: '',
      morningSignature: '',
      afternoonEntry: '',
      afternoonExit: '',
      afternoonSignature: '',
      isWeekend: false,
      isHoliday: false
    }));
  };

  const [frequencyData, setFrequencyData] = React.useState<FrequencyData>(() => ({
    month,
    year,
    days: generateInitialDays(),
    serverSignature: '',
    supervisorSignature: '',
    observations: '',
    ...value
  }));

  const updateDayData = (dayIndex: number, field: keyof DayData, newValue: string | boolean) => {
    const updatedDays = [...frequencyData.days];
    updatedDays[dayIndex] = { ...updatedDays[dayIndex], [field]: newValue };
    
    const updatedData = { ...frequencyData, days: updatedDays };
    setFrequencyData(updatedData);
    onChange?.(updatedData);
  };

  const updateGeneralData = (field: keyof FrequencyData, newValue: string) => {
    const updatedData = { ...frequencyData, [field]: newValue };
    setFrequencyData(updatedData);
    onChange?.(updatedData);
  };

  const getDayOfWeek = (day: number) => {
    const date = new Date(parseInt(year), new Date().getMonth(), day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Domingo ou Sábado
  };

  const formatDayLabel = (day: number) => {
    const date = new Date(parseInt(year), new Date().getMonth(), day);
    const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'short' });
    return `${day} (${dayOfWeek})`;
  };

  return (
    <div className="w-full space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">{label}</h3>
        <p className="text-sm text-muted-foreground">
          {month.charAt(0).toUpperCase() + month.slice(1)} de {year}
        </p>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-20 min-w-20">Dia</TableHead>
              <TableHead className="text-center min-w-72" colSpan={3}>Manhã</TableHead>
              <TableHead className="text-center min-w-72" colSpan={3}>Tarde</TableHead>
            </TableRow>
            <TableRow>
              <TableHead className="text-center min-w-20">Data</TableHead>
              <TableHead className="text-center w-24 min-w-24">Entrada</TableHead>
              <TableHead className="text-center w-24 min-w-24">Saída</TableHead>
              <TableHead className="text-center w-32 min-w-32">Assinatura</TableHead>
              <TableHead className="text-center w-24 min-w-24">Entrada</TableHead>
              <TableHead className="text-center w-24 min-w-24">Saída</TableHead>
              <TableHead className="text-center w-32 min-w-32">Assinatura</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {frequencyData.days.map((dayData, index) => {
              const isWeekend = getDayOfWeek(dayData.day);
              return (
                <TableRow key={dayData.day} className={isWeekend ? 'bg-muted/30' : ''}>
                  <TableCell className="text-center font-medium">
                    {formatDayLabel(dayData.day)}
                  </TableCell>
                  
                  {/* Manhã */}
                  <TableCell>
                    {isWeekend ? (
                      <div className="text-center text-xs text-muted-foreground">
                        {index % 7 === 0 ? 'DOMINGO' : 'SÁBADO'}
                      </div>
                    ) : (
                      <Input
                        type="time"
                        value={dayData.morningEntry}
                        onChange={(e) => updateDayData(index, 'morningEntry', e.target.value)}
                        className="h-8 text-xs"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {!isWeekend && (
                      <Input
                        type="time"
                        value={dayData.morningExit}
                        onChange={(e) => updateDayData(index, 'morningExit', e.target.value)}
                        className="h-8 text-xs"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {!isWeekend && (
                      <Input
                        type="text"
                        value={dayData.morningSignature}
                        onChange={(e) => updateDayData(index, 'morningSignature', e.target.value)}
                        className="h-8 text-xs"
                        placeholder="Assinatura"
                      />
                    )}
                  </TableCell>
                  
                  {/* Tarde */}
                  <TableCell>
                    {!isWeekend && (
                      <Input
                        type="time"
                        value={dayData.afternoonEntry}
                        onChange={(e) => updateDayData(index, 'afternoonEntry', e.target.value)}
                        className="h-8 text-xs"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {!isWeekend && (
                      <Input
                        type="time"
                        value={dayData.afternoonExit}
                        onChange={(e) => updateDayData(index, 'afternoonExit', e.target.value)}
                        className="h-8 text-xs"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {!isWeekend && (
                      <Input
                        type="text"
                        value={dayData.afternoonSignature}
                        onChange={(e) => updateDayData(index, 'afternoonSignature', e.target.value)}
                        className="h-8 text-xs"
                        placeholder="Assinatura"
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Seção de assinaturas e observações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Assinatura do Servidor:</label>
          <Input
            type="text"
            value={frequencyData.serverSignature}
            onChange={(e) => updateGeneralData('serverSignature', e.target.value)}
            placeholder="Nome e assinatura do servidor"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Assinatura da Chefia Imediata:</label>
          <Input
            type="text"
            value={frequencyData.supervisorSignature}
            onChange={(e) => updateGeneralData('supervisorSignature', e.target.value)}
            placeholder="Nome e assinatura da chefia"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Observações:</label>
        <textarea
          value={frequencyData.observations}
          onChange={(e) => updateGeneralData('observations', e.target.value)}
          className="w-full p-2 border rounded-md resize-none h-20 text-sm"
          placeholder="Observações adicionais..."
        />
      </div>
    </div>
  );
};

export default FrequencyTable;
export type { FrequencyTableProps, FrequencyData, DayData };