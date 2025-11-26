import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'orange' | 'purple';
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, color = 'blue' }: StatsCardProps) {
  const colorClasses = {
    blue: {
      border: 'border-l-blue-500',
      text: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    green: {
      border: 'border-l-green-500',
      text: 'text-green-600',
      bg: 'bg-green-100'
    },
    yellow: {
      border: 'border-l-yellow-500',
      text: 'text-yellow-600',
      bg: 'bg-yellow-100'
    },
    red: {
      border: 'border-l-red-500',
      text: 'text-red-600',
      bg: 'bg-red-100'
    },
    orange: {
      border: 'border-l-orange-500',
      text: 'text-orange-600',
      bg: 'bg-orange-100'
    },
    purple: {
      border: 'border-l-purple-500',
      text: 'text-purple-600',
      bg: 'bg-purple-100'
    }
  };

  const colors = colorClasses[color];

  return (
    <Card className={`border-l-4 ${colors.border} shadow-lg hover:shadow-xl transition-shadow`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <p className={`text-xs mt-1 font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% em relação ao mês anterior
              </p>
            )}
          </div>
          <div className={`p-3 ${colors.bg} rounded-full`}>
            <Icon className={`w-8 h-8 ${colors.text}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
