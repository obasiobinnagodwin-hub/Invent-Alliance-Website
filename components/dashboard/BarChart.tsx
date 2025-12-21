'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: Array<{ [key: string]: string | number }>;
  title: string;
  dataKey: string;
  color?: string;
}

export default function BarChart({ data, title, dataKey, color = '#8b5cf6' }: BarChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-slate-200 hover:shadow-xl transition-shadow overflow-hidden">
      <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 mb-3 sm:mb-4">{title}</h3>
      <div className="w-full" style={{ height: '250px' }}>
        <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey={dataKey}
            stroke="#64748b"
            style={{ fontSize: '10px', fontWeight: '500' }}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
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
          <Bar dataKey="count" fill={color} radius={[8, 8, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

