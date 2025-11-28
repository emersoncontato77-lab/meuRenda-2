import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { ArrowUpRight, TrendingDown, Target, Wallet, Settings, TrendingUp } from 'lucide-react';
import { startOfMonth, isAfter } from 'date-fns';

interface DashboardProps {
  transactions: Transaction[];
  onNavigate: (tab: 'GOALS' | 'SETTINGS' | 'REPORTS') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, onNavigate }) => {
  
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);

    let monthlyRev = 0;
    let monthlyExpenses = 0;
    let monthlyInvestments = 0;

    transactions.forEach(t => {
      const tDate = new Date(t.date);

      if (isAfter(tDate, monthStart) || tDate.getTime() >= monthStart.getTime()) {
        if (t.type === TransactionType.SALE) {
          monthlyRev += t.amount;
        } else if (t.type === TransactionType.EXPENSE) {
          monthlyExpenses += t.amount;
        } else if (t.type === TransactionType.INVESTMENT) {
          monthlyInvestments += t.amount;
        }
      }
    });

    const monthlyProfit = monthlyRev - monthlyExpenses;

    return { monthlyRev, monthlyProfit, monthlyExpenses, monthlyInvestments };
  }, [transactions]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-8 pb-32 bg-[#000000] min-h-screen">
      {/* Header */}
      <header className="flex justify-center items-center relative py-4">
        <h1 className="text-xl font-bold tracking-widest text-white">
          MEURENDA<span className="text-[#39FF14]">+</span>
        </h1>
        <button 
          onClick={() => onNavigate('SETTINGS')}
          className="absolute right-0 text-gray-500 hover:text-white transition"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Hero Card - Net Profit */}
      <div className="w-full bg-zinc-900 rounded-[32px] p-8 border border-[#39FF14]/50 shadow-[0_0_25px_rgba(57,255,20,0.15)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14] opacity-10 blur-[80px] rounded-full group-hover:opacity-20 transition duration-700"></div>
        <div className="relative z-10 text-center">
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] mb-3 font-bold">Lucro Líquido (Mês)</p>
          <div className={`text-5xl font-black ${stats.monthlyProfit >= 0 ? 'text-white' : 'text-red-500'} tracking-tight`}>
            {formatCurrency(stats.monthlyProfit)}
          </div>
          <div className="mt-4 text-[10px] text-[#39FF14] flex justify-center items-center gap-2 font-mono">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF14] opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39FF14]"></span>
             </span>
             TEMPO REAL
          </div>
        </div>
      </div>

      {/* Grid 2x2 */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Card 1: Faturamento */}
        <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 hover:border-[#39FF14]/30 transition duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-black border border-zinc-700 p-2 rounded-xl text-blue-400">
              <TrendingUp size={16} />
            </div>
            <span className="text-[9px] uppercase text-gray-400 font-bold tracking-wider">Faturamento</span>
          </div>
          <div className="text-xl font-bold text-white">
            {formatCurrency(stats.monthlyRev)}
          </div>
        </div>

        {/* Card 2: Gastos */}
        <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 hover:border-[#39FF14]/30 transition duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-black border border-zinc-700 p-2 rounded-xl text-red-500">
              <TrendingDown size={16} />
            </div>
            <span className="text-[9px] uppercase text-gray-400 font-bold tracking-wider">Gastos</span>
          </div>
          <div className="text-xl font-bold text-white">
            {formatCurrency(stats.monthlyExpenses)}
          </div>
        </div>

        {/* Card 3: Investimentos */}
        <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 hover:border-[#39FF14]/30 transition duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-black border border-zinc-700 p-2 rounded-xl text-yellow-400">
              <Wallet size={16} />
            </div>
            <span className="text-[9px] uppercase text-gray-400 font-bold tracking-wider">Investido</span>
          </div>
          <div className="text-xl font-bold text-white">
            {formatCurrency(stats.monthlyInvestments)}
          </div>
        </div>

        {/* Card 4: Metas (Link) */}
        <button 
          onClick={() => onNavigate('GOALS')}
          className="bg-black p-5 rounded-3xl border border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.2)] flex flex-col justify-center items-center gap-3 group hover:bg-zinc-900 transition"
        >
          <Target className="text-[#39FF14] group-hover:scale-110 transition-transform duration-300" size={28} />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Ver Metas</span>
        </button>

      </div>
    </div>
  );
};