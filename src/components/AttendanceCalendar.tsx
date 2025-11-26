import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AttendanceStatus, CalendarDay } from "@/types";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ATTENDANCE_STATUS_CONFIG, getBadgeConfig } from "@/config/badgeConfig";
import { DayDetailsModal } from "./DayDetailsModal";

interface AttendanceCalendarProps {
  month: string;
  year: number;
  days: CalendarDay[];
}

export function AttendanceCalendar({ month, year, days }: AttendanceCalendarProps) {
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  
  // Função para abrir o modal com detalhes do dia
  const handleDayClick = (day: any) => {
    if (day.date > 0) {
      setSelectedDate(day.date);
      setSelectedDay(day);
      setIsModalOpen(true);
    }
  };
  
  // Gerar um calendário completo com todos os dias do mês
  const generateFullCalendar = () => {
    const firstDay = new Date(year, getMonthNumber(month), 1);
    const lastDay = new Date(year, getMonthNumber(month) + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendar = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dayNumber = currentDate.getDate();
      const isCurrentMonth = currentDate.getMonth() === getMonthNumber(month);
      const isToday = currentDate.toDateString() === today.toDateString();
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      
      // Encontrar dados existentes para este dia
      const existingDay = days.find(d => d.date === dayNumber && isCurrentMonth);
      
      calendar.push({
        date: isCurrentMonth ? dayNumber : 0,
        status: existingDay?.status,
        hours: existingDay?.hours,
        isToday,
        isWeekend,
        isCurrentMonth,
        fullDate: currentDate
      });
    }
    
    return calendar.slice(0, 35); // Mostrar apenas 5 semanas
  };
  
  const getMonthNumber = (monthName: string) => {
    const months = {
      'Janeiro': 0, 'Fevereiro': 1, 'Março': 2, 'Abril': 3,
      'Maio': 4, 'Junho': 5, 'Julho': 6, 'Agosto': 7,
      'Setembro': 8, 'Outubro': 9, 'Novembro': 10, 'Dezembro': 11
    };
    return months[monthName as keyof typeof months] || 0;
  };
  
  const fullCalendar = generateFullCalendar();
  
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Calendário de Frequência
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {month} {year}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Legenda */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          {Object.entries(ATTENDANCE_STATUS_CONFIG).map(([key, config]) => {
            const IconComponent = config.icon;
            return (
              <div key={key} className={`flex items-center gap-1.5 px-2 py-1 rounded-full border shadow-sm ${config.bgClass}`}>
                <IconComponent className={`h-3 w-3 ${config.textColor}`} />
                <span className={`text-xs font-medium ${config.textColor}`}>{config.label}</span>
              </div>
            );
          })}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-7 gap-2">
          {/* Cabeçalho dos dias da semana */}
          {weekDays.map((day, index) => {
            const isWeekend = index === 0 || index === 6; // Dom (0) e Sáb (6)
            return (
              <div
                key={day}
                className={`text-center text-sm font-bold py-3 rounded-lg mb-2 ${
                  isWeekend 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {day}
              </div>
            );
          })}
          
          {/* Dias do calendário */}
          {fullCalendar.map((day, index) => {
            const config = day.status ? getBadgeConfig(day.status, 'attendance') : null;
            const IconComponent = config?.icon;
            
            return (
              <div
                key={index}
                onClick={() => handleDayClick(day)}
                className={`
                  relative aspect-square rounded-xl border-2 p-2 transition-all duration-200 cursor-pointer
                  ${day.date === 0 ? 'invisible' : ''}
                  ${day.isToday ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
                  ${selectedDate === day.date ? 'scale-105 shadow-lg' : ''}
                  ${config ? config.bgClass : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'}
                  ${day.isWeekend && !config ? 'bg-gray-50 border-gray-200' : ''}
                `}
              >
                {day.date > 0 && (
                  <>
                    {/* Número do dia */}
                    <div className={`text-sm font-bold ${day.isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {day.date}
                    </div>
                    
                    {/* Indicador de status */}
                    {config && IconComponent && (
                      <div className="absolute top-1 right-1">
                        <div className={`p-1 rounded-full ${config.className}`}>
                          <IconComponent className="h-3 w-3" />
                        </div>
                      </div>
                    )}
                    
                    {/* Horas trabalhadas */}
                    {day.hours && (
                      <div className="absolute bottom-1 left-1 right-1">
                        <div className="text-xs font-medium text-center bg-white/90 rounded px-1 py-0.5 shadow-sm">
                          {day.hours}
                        </div>
                      </div>
                    )}
                    
                    {/* Indicador de hoje */}
                    {day.isToday && (
                      <div className="absolute -top-1 -right-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Informações do dia selecionado */}
        {selectedDate && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">
              Dia {selectedDate} de {month}
            </h4>
            <div className="text-sm text-blue-700">
              {(() => {
                const selectedDay = fullCalendar.find(d => d.date === selectedDate);
                if (selectedDay?.status) {
                  const config = getBadgeConfig(selectedDay.status, 'attendance');
                  const IconComponent = config.icon;
                  return (
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-full ${config.className}`}>
                        <IconComponent className="h-3 w-3" />
                      </div>
                      <span>Status: {config.label}</span>
                      {selectedDay.hours && <span>• Horas: {selectedDay.hours}</span>}
                    </div>
                  );
                }
                return "Nenhum registro encontrado para este dia.";
              })()}
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Modal de detalhes do dia */}
      <DayDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        day={selectedDay}
        date={selectedDate || 0}
        month={month}
        year={year}
      />
    </Card>
  );
}
