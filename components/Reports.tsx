import React from 'react';
import { Transaction, TransactionType } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, startOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportsProps {
  transactions: Transaction[];
}

export const Reports: React.FC<ReportsProps> = ({ transactions }) => {
  
  // Aggregate data for last 7 days chart
  const getLast7DaysData = () => {
    const data = [];
    const today = new Date();
    const start = startOfWeek(today); // Simplified: actual last 7 days usually better
    
    // Create map of last 7 days
    for (let i = 0; i < 7; i++) {
      const d = addDays(start, i);
      const dateKey = format(d, 'dd/MM');
      
      let revenue = 0;
      let profit = 0;

      // Naive filtering (O(n^2) ish but fine for client side small data)
      transactions.forEach(t => {
        const tDate = new Date(t.date);
        if (format(tDate, 'dd/MM') === dateKey) {
          if (t.type === TransactionType.SALE) {
            revenue += t.amount;
            profit += (t.amount - (t.cost || 0));
          } else if (t.type === TransactionType.EXPENSE) {
            profit -= t.amount;
          }
        }
      });

      data.push({ name: dateKey, Faturamento: revenue, Lucro: profit });
    }
    return data;
  };

  const data = getLast7DaysData();

  // Pie chart stats
  const totalInvested = transactions
    .filter(t => t.type === TransactionType.INVESTMENT)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6 pb-24">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-white">Relatórios</h2>
        <p className="text-slate-400 text-sm">Análise de desempenho</p>
      </header>

      {/* Revenue Chart */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase">Faturamento vs Lucro (Semana)</h3>
        <div className="h-48 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#475569" />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} 
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Area type="monotone" dataKey="Faturamento" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRev)" />
              <Area type="monotone" dataKey="Lucro" stroke="#10b981" fillOpacity={1} fill="url(#colorProf)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <h4 className="text-xs text-red-400 uppercase font-bold mb-2">Gastos Totais</h4>
          <p className="text-xl font-bold text-white">R$ {totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <h4 className="text-xs text-blue-400 uppercase font-bold mb-2">Investimentos</h4>
          <p className="text-xl font-bold text-white">R$ {totalInvested.toFixed(2)}</p>
        </div>
      </div>

      {/* Recent Transaction List */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-slate-400 uppercase">Histórico Recente</h3>
        </div>
        <div className="divide-y divide-slate-800">
          {transactions.slice(0, 10).map((t, i) => (
            <div key={i} className="p-4 flex justify-between items-center">
              <div>
                <p className="text-white font-medium text-sm">{t.description}</p>
                <p className="text-xs text-slate-500">{format(new Date(t.date), 'dd/MM/yyyy')}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${t.type === TransactionType.SALE ? 'text-green-400' : 'text-slate-300'}`}>
                  {t.type === TransactionType.SALE ? '+' : '-'} R$ {t.amount.toFixed(2)}
                </p>
                <p className="text-[10px] uppercase text-slate-500">{t.type === TransactionType.SALE ? 'Venda' : t.type === TransactionType.EXPENSE ? 'Gasto' : 'Invest.'}</p>
              </div>
            </div>
          ))}
          {transactions.length === 0 && <div className="p-4 text-center text-slate-500 text-sm">Sem dados.</div>}
        </div>
      </div>
    </div>
  );
};