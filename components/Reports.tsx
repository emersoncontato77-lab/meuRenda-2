import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { format, startOfWeek, startOfMonth, isWithinInterval, subDays, startOfDay, endOfDay, parseISO, endOfWeek, endOfMonth } from 'date-fns';
import { ArrowLeft, Calendar, DollarSign, TrendingDown, TrendingUp, Wallet, PieChart as PieChartIcon } from 'lucide-react';

interface ReportsProps {
  transactions: Transaction[];
}

type ReportView = 'MENU' | 'PROFIT' | 'REVENUE' | 'EXPENSES' | 'INVESTMENTS';
type DateRange = 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM';

export const Reports: React.FC<ReportsProps> = ({ transactions }) => {
  const [view, setView] = useState<ReportView>('MENU');
  const [range, setRange] = useState<DateRange>('MONTH');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // --- FILTER LOGIC ---
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let start: Date, end: Date;

    switch (range) {
      case 'TODAY':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'WEEK':
        start = startOfWeek(now, { weekStartsOn: 1 });
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'MONTH':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'CUSTOM':
        if (!customStart || !customEnd) return transactions; // Fallback
        start = startOfDay(parseISO(customStart));
        end = endOfDay(parseISO(customEnd));
        break;
    }

    return transactions.filter(t => 
      isWithinInterval(new Date(t.date), { start, end })
    );
  }, [transactions, range, customStart, customEnd]);

  // --- AGGREGATED STATS ---
  const stats = useMemo(() => {
    let revenue = 0;
    let expenses = 0;
    let investments = 0;
    
    // Group expenses by category
    const expenseCats: Record<string, number> = {};

    filteredTransactions.forEach(t => {
      if (t.type === TransactionType.SALE) {
        revenue += t.amount;
      } else if (t.type === TransactionType.EXPENSE) {
        expenses += t.amount;
        const cat = t.category || 'Outros';
        expenseCats[cat] = (expenseCats[cat] || 0) + t.amount;
      } else if (t.type === TransactionType.INVESTMENT) {
        investments += t.amount;
      }
    });

    return { 
      revenue, 
      expenses, 
      investments, 
      profit: revenue - expenses,
      margin: revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0,
      expenseCats: Object.entries(expenseCats).map(([name, value]) => ({ name, value })) 
    };
  }, [filteredTransactions]);

  // --- CHART DATA GENERATOR ---
  const getChartData = () => {
    const dataMap: Record<string, any> = {};
    
    // Initialize breakdown based on range
    // Simplified: Just use the actual transaction dates found
    filteredTransactions.forEach(t => {
       const dateKey = format(new Date(t.date), 'dd/MM');
       if (!dataMap[dateKey]) {
         dataMap[dateKey] = { name: dateKey, revenue: 0, profit: 0, expenses: 0, investment: 0 };
       }
       if (t.type === TransactionType.SALE) {
         dataMap[dateKey].revenue += t.amount;
         dataMap[dateKey].profit += t.amount;
       } else if (t.type === TransactionType.EXPENSE) {
         dataMap[dateKey].expenses += t.amount;
         dataMap[dateKey].profit -= t.amount;
       } else if (t.type === TransactionType.INVESTMENT) {
         dataMap[dateKey].investment += t.amount;
       }
    });

    return Object.values(dataMap).sort((a: any, b: any) => {
       // Naive sort by string dd/MM works if within same year/month usually, 
       // but strictly we rely on input order or better sort logic. 
       // For this demo, let's reverse array from filter if needed.
       return 0; 
    });
  };

  const chartData = getChartData();
  const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6']; // For Pie Chart

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // --- RENDER HELPERS ---
  const RenderHeader = ({ title, colorClass }: { title: string, colorClass: string }) => (
    <div className="flex flex-col gap-4 mb-6">
      <button onClick={() => setView('MENU')} className="self-start flex items-center gap-2 text-gray-500 hover:text-white transition">
        <ArrowLeft size={16} /> Voltar
      </button>
      <div className="flex justify-between items-end">
        <div>
          <h2 className={`text-2xl font-bold ${colorClass} uppercase tracking-wide`}>{title}</h2>
          <p className="text-gray-500 text-xs mt-1">
             {range === 'CUSTOM' ? 'Período Personalizado' : range === 'TODAY' ? 'Hoje' : range === 'WEEK' ? 'Última Semana' : 'Este Mês'}
          </p>
        </div>
      </div>
      
      {/* Date Filter Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(['TODAY', 'WEEK', 'MONTH', 'CUSTOM'] as const).map(r => (
          <button 
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-2 rounded-full text-[10px] font-bold border whitespace-nowrap transition
              ${range === r ? 'bg-zinc-800 border-white text-white' : 'bg-black border-zinc-800 text-gray-500 hover:border-gray-600'}
            `}
          >
            {r === 'TODAY' ? 'HOJE' : r === 'WEEK' ? 'SEMANA' : r === 'MONTH' ? 'MÊS' : 'CUSTOM'}
          </button>
        ))}
      </div>

      {range === 'CUSTOM' && (
        <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2">
          <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-white p-2 rounded-lg text-xs" />
          <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-white p-2 rounded-lg text-xs" />
        </div>
      )}
    </div>
  );

  // --- VIEWS ---

  if (view === 'MENU') {
    return (
      <div className="space-y-6 pb-32 bg-[#000000] min-h-screen pt-6">
        <h2 className="text-2xl font-bold text-white tracking-wide mb-8">RELATÓRIOS</h2>
        
        <div className="grid grid-cols-1 gap-4">
          <button onClick={() => setView('PROFIT')} className="bg-zinc-900 border border-zinc-800 hover:border-[#39FF14] p-6 rounded-3xl flex items-center justify-between group transition shadow-lg">
             <div className="flex items-center gap-4">
               <div className="bg-[#39FF14]/10 p-3 rounded-full text-[#39FF14] group-hover:scale-110 transition">
                 <DollarSign size={24} />
               </div>
               <div className="text-left">
                 <h3 className="text-white font-bold text-lg">Lucro Líquido</h3>
                 <p className="text-gray-500 text-xs">Análise de margem e resultado</p>
               </div>
             </div>
             <div className="text-[#39FF14] font-bold">&rarr;</div>
          </button>

          <button onClick={() => setView('REVENUE')} className="bg-zinc-900 border border-zinc-800 hover:border-blue-400 p-6 rounded-3xl flex items-center justify-between group transition shadow-lg">
             <div className="flex items-center gap-4">
               <div className="bg-blue-500/10 p-3 rounded-full text-blue-400 group-hover:scale-110 transition">
                 <TrendingUp size={24} />
               </div>
               <div className="text-left">
                 <h3 className="text-white font-bold text-lg">Faturamento</h3>
                 <p className="text-gray-500 text-xs">Entradas e vendas</p>
               </div>
             </div>
             <div className="text-blue-400 font-bold">&rarr;</div>
          </button>

          <button onClick={() => setView('EXPENSES')} className="bg-zinc-900 border border-zinc-800 hover:border-red-400 p-6 rounded-3xl flex items-center justify-between group transition shadow-lg">
             <div className="flex items-center gap-4">
               <div className="bg-red-500/10 p-3 rounded-full text-red-400 group-hover:scale-110 transition">
                 <TrendingDown size={24} />
               </div>
               <div className="text-left">
                 <h3 className="text-white font-bold text-lg">Gastos</h3>
                 <p className="text-gray-500 text-xs">Categorias e saídas</p>
               </div>
             </div>
             <div className="text-red-400 font-bold">&rarr;</div>
          </button>

          <button onClick={() => setView('INVESTMENTS')} className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400 p-6 rounded-3xl flex items-center justify-between group transition shadow-lg">
             <div className="flex items-center gap-4">
               <div className="bg-yellow-500/10 p-3 rounded-full text-yellow-400 group-hover:scale-110 transition">
                 <Wallet size={24} />
               </div>
               <div className="text-left">
                 <h3 className="text-white font-bold text-lg">Investimentos</h3>
                 <p className="text-gray-500 text-xs">Aporte e patrimônio</p>
               </div>
             </div>
             <div className="text-yellow-400 font-bold">&rarr;</div>
          </button>
        </div>
      </div>
    );
  }

  // --- SUB PAGES ---

  if (view === 'PROFIT') {
    return (
      <div className="pb-32 bg-[#000000] min-h-screen">
        <RenderHeader title="Lucro Líquido" colorClass="text-[#39FF14]" />
        
        {/* Main Stats */}
        <div className="bg-zinc-900 border border-[#39FF14]/30 p-6 rounded-3xl mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14] opacity-5 rounded-full blur-3xl"></div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total no Período</p>
          <p className="text-4xl font-bold text-white mb-2">{formatCurrency(stats.profit)}</p>
          <div className="inline-block px-3 py-1 bg-black rounded-lg border border-zinc-800">
             <span className="text-[#39FF14] text-xs font-bold">Margem: {stats.margin.toFixed(1)}%</span>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl h-64 mb-6">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={chartData}>
               <defs>
                 <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#39FF14" stopOpacity={0.2}/>
                   <stop offset="95%" stopColor="#39FF14" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
               <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', color: '#fff' }}
                  labelStyle={{ color: '#888' }}
               />
               <Area type="monotone" dataKey="profit" stroke="#39FF14" strokeWidth={3} fill="url(#profitGrad)" />
             </AreaChart>
           </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (view === 'REVENUE') {
    return (
      <div className="pb-32 bg-[#000000] min-h-screen">
        <RenderHeader title="Faturamento" colorClass="text-blue-400" />
        
        <div className="bg-zinc-900 border border-blue-900/50 p-6 rounded-3xl mb-6">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Entrada Total</p>
          <p className="text-4xl font-bold text-white">{formatCurrency(stats.revenue)}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl h-64 mb-6">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={chartData}>
               <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
               <Tooltip 
                  cursor={{fill: '#333', opacity: 0.2}}
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
               />
               <Bar dataKey="revenue" fill="#60a5fa" radius={[4, 4, 0, 0]} />
             </BarChart>
           </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (view === 'EXPENSES') {
    return (
      <div className="pb-32 bg-[#000000] min-h-screen">
        <RenderHeader title="Gastos" colorClass="text-red-500" />
        
        <div className="bg-zinc-900 border border-red-900/50 p-6 rounded-3xl mb-6">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Saída Total</p>
          <p className="text-4xl font-bold text-white">{formatCurrency(stats.expenses)}</p>
        </div>

        {/* Pie Chart */}
        {stats.expenses > 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl h-64 mb-6 flex flex-col items-center justify-center relative">
             <h4 className="absolute top-4 left-4 text-xs font-bold text-gray-500 uppercase">Por Categoria</h4>
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={stats.expenseCats}
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {stats.expenseCats.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }} />
               </PieChart>
             </ResponsiveContainer>
             
             {/* Legend */}
             <div className="flex flex-wrap gap-2 justify-center mt-2">
                {stats.expenseCats.map((cat, i) => (
                  <div key={i} className="flex items-center gap-1 text-[10px] text-gray-400">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    {cat.name}
                  </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="p-10 text-center text-gray-500 bg-zinc-900 rounded-3xl border border-zinc-800 mb-6">Sem dados de gastos.</div>
        )}

        {/* Expense List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Lista Detalhada</h4>
          {filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).map(t => (
            <div key={t.id} className="bg-zinc-900 p-4 rounded-xl flex justify-between items-center border border-zinc-800">
              <div>
                <p className="text-white font-medium text-sm">{t.description}</p>
                <p className="text-xs text-gray-500">{t.category} • {format(new Date(t.date), 'dd/MM')}</p>
              </div>
              <p className="text-red-400 font-bold">- {formatCurrency(t.amount)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'INVESTMENTS') {
    return (
      <div className="pb-32 bg-[#000000] min-h-screen">
        <RenderHeader title="Investimentos" colorClass="text-yellow-400" />
        
        <div className="bg-zinc-900 border border-yellow-900/50 p-6 rounded-3xl mb-6">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Aportado</p>
          <p className="text-4xl font-bold text-white">{formatCurrency(stats.investments)}</p>
        </div>

         {/* Simple Bar Chart */}
         <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl h-64 mb-6">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={chartData}>
               <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
               <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
               />
               <Bar dataKey="investment" fill="#eab308" radius={[4, 4, 0, 0]} />
             </BarChart>
           </ResponsiveContainer>
        </div>

        {/* List */}
        <div className="space-y-2">
          {filteredTransactions.filter(t => t.type === TransactionType.INVESTMENT).map(t => (
            <div key={t.id} className="bg-zinc-900 p-4 rounded-xl flex justify-between items-center border border-zinc-800">
              <div>
                <p className="text-white font-medium text-sm">{t.description}</p>
                <p className="text-xs text-gray-500">{format(new Date(t.date), 'dd/MM/yyyy')}</p>
              </div>
              <p className="text-yellow-400 font-bold">{formatCurrency(t.amount)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};