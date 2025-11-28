import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { ArrowUpRight, TrendingDown, Target, Wallet, Settings } from 'lucide-react';
import { startOfMonth, isAfter } from 'date-fns';

interface DashboardProps {
  transactions: Transaction[];
  onNavigate: (tab: 'GOALS' | 'SETTINGS') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, onNavigate }) => {
  
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);

    let monthlyRev = 0;
    let monthlyProfit = 0;
    let monthlyExpenses = 0;
    let monthlyInvestments = 0;

    transactions.forEach(t => {
      const tDate = new Date(t.date);

      // We focus on "Last Month" (Current Month in progress) as per standard dashboard UX
      if (isAfter(tDate, monthStart) || tDate.getTime() >= monthStart.getTime()) {
        if (t.type === TransactionType.SALE) {
          const profit = t.amount - (t.cost || 0);
          monthlyRev += t.amount;
          monthlyProfit += profit;
        } else if (t.type === TransactionType.EXPENSE) {
          monthlyProfit -= t.amount;
          monthlyExpenses += t.amount;
        } else if (t.type === TransactionType.INVESTMENT) {
          monthlyInvestments += t.amount;
        }
      }
    });

    return { monthlyRev, monthlyProfit, monthlyExpenses, monthlyInvestments };
  }, [transactions]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <header className="flex justify-center items-center relative py-2">
        <h1 className="text-xl font-bold tracking-wider text-white">
          MeuRenda<span className="text-neon">+</span>
        </h1>
        <button 
          onClick={() => onNavigate('SETTINGS')}
          className="absolute right-0 text-gray-500 hover:text-white transition"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Hero Card - Net Profit */}
      <div className="w-full bg-zinc-900 rounded-3xl p-6 border border-neon shadow-neon relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-neon opacity-10 blur-3xl rounded-full"></div>
        <div className="relative z-10 text-center">
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-medium">Lucro Líquido (Mês)</p>
          <div className={`text-4xl font-bold ${stats.monthlyProfit >= 0 ? 'text-white' : 'text-red-500'} drop-shadow-md`}>
            {formatCurrency(stats.monthlyProfit)}
          </div>
          <div className="mt-2 text-[10px] text-neon flex justify-center items-center gap-1">
             <div className="w-2 h-2 bg-neon rounded-full animate-pulse"></div>
             Atualizado em tempo real
          </div>
        </div>
      </div>

      {/* Grid 2x2 */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Card 1: Faturamento */}
        <div className="bg-zinc-900 p-4 rounded-2xl border border-gray-800 hover:border-neon/50 transition duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-900/30 p-1.5 rounded-lg text-green-400">
              <ArrowUpRight size={16} />
            </div>
            <span className="text-[10px] uppercase text-gray-400 font-bold">Faturamento</span>
          </div>
          <div className="text-lg font-bold text-white">
            {formatCurrency(stats.monthlyRev)}
          </div>
        </div>

        {/* Card 2: Gastos */}
        <div className="bg-zinc-900 p-4 rounded-2xl border border-gray-800 hover:border-neon/50 transition duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-red-900/30 p-1.5 rounded-lg text-red-400">
              <TrendingDown size={16} />
            </div>
            <span className="text-[10px] uppercase text-gray-400 font-bold">Gastos</span>
          </div>
          <div className="text-lg font-bold text-white">
            {formatCurrency(stats.monthlyExpenses)}
          </div>
        </div>

        {/* Card 3: Investimentos */}
        <div className="bg-zinc-900 p-4 rounded-2xl border border-gray-800 hover:border-neon/50 transition duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-900/30 p-1.5 rounded-lg text-blue-400">
              <Wallet size={16} />
            </div>
            <span className="text-[10px] uppercase text-gray-400 font-bold">Investido</span>
          </div>
          <div className="text-lg font-bold text-white">
            {formatCurrency(stats.monthlyInvestments)}
          </div>
        </div>

        {/* Card 4: Metas (Link) */}
        <button 
          onClick={() => onNavigate('GOALS')}
          className="bg-black p-4 rounded-2xl border border-neon shadow-neon flex flex-col justify-center items-center gap-2 group hover:bg-zinc-900 transition"
        >
          <Target className="text-neon group-hover:scale-110 transition-transform" size={24} />
          <span className="text-sm font-bold text-white">Ver Metas</span>
        </button>

      </div>

      {/* Recent Activity Hint */}
      <div className="mt-8">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Atividade Recente</h3>
        <div className="space-y-3">
          {transactions.slice(0, 3).map((t, i) => (
            <div key={i} className="flex justify-between items-center bg-zinc-900/50 p-3 rounded-xl border-l-2 border-gray-800 hover:border-neon transition">
              <span className="text-sm text-gray-300 truncate max-w-[150px]">{t.description}</span>
              <span className={`text-sm font-bold ${t.type === TransactionType.SALE ? 'text-neon' : t.type === TransactionType.EXPENSE ? 'text-red-400' : 'text-blue-400'}`}>
                {t.type === TransactionType.SALE ? '+' : '-'} {formatCurrency(t.amount)}
              </span>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-gray-600 text-xs italic">Nenhuma movimentação registrada este mês.</p>
          )}
        </div>
      </div>

    </div>
  );
};