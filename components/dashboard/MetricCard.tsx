interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

export default function MetricCard({ title, value, subtitle, trend, icon }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-slate-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-slate-600 text-xs sm:text-sm font-semibold mb-1 sm:mb-2 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2 break-words">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-slate-500 text-xs font-medium break-words">{subtitle}</p>
          )}
          {trend && (
            <div className={`mt-2 sm:mt-3 text-xs font-bold flex items-center px-2 py-1 rounded-full w-fit ${
              trend.isPositive 
                ? 'text-green-700 bg-green-100' 
                : 'text-red-700 bg-red-100'
            }`}>
              <span className="mr-1">{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-2xl sm:text-3xl lg:text-4xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 flex-shrink-0 ml-2">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

