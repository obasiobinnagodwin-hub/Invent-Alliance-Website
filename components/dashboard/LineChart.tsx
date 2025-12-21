'use client';

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LineChartProps {
  data: Array<{ date: string; count: number }>;
  title: string;
  dataKey?: string;
  color?: string;
}

export default function LineChart({ data, title, dataKey = 'count', color = '#3b82f6' }: LineChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-slate-200 hover:shadow-xl transition-shadow overflow-hidden">
      <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 mb-3 sm:mb-4">{title}</h3>
      <div className="w-full" style={{ height: '250px' }}>
        <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b"
            style={{ fontSize: '12px', fontWeight: '500' }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '12px', fontWeight: '500' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              color: '#1e293b',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            labelStyle={{ color: '#475569', fontWeight: '600' }}
          />
          <Legend wrapperStyle={{ color: '#475569' }} />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={3}
            dot={{ fill: color, r: 5 }}
            activeDot={{ r: 7, fill: color }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

