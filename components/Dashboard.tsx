import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { Plus, DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { startOfDay, startOfWeek, startOfMonth, isAfter } from 'date-fns';

interface DashboardProps {
  transactions: Transaction[];
  onAddTransaction: (type: TransactionType) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, onAddTransaction }) => {
  
  const stats = useMemo(() => {
    const now = new Date();
    const dayStart = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    let dailyRev = 0, weeklyRev = 0, monthlyRev = 0;
    let dailyProfit = 0, monthlyProfit = 0;
    
    let totalRevenue = 0;
    let totalProfit = 0;

    transactions.forEach(t => {
      const tDate = new Date(t.date);

      if (t.type === TransactionType.SALE) {
        const profit = t.amount - (t.cost || 0);
        totalRevenue += t.amount;
        totalProfit += profit;

        if (isAfter(tDate, dayStart) || tDate.getTime() === dayStart.getTime()) {
          dailyRev += t.amount;
          dailyProfit += profit;
        }
        if (isAfter(tDate, weekStart)) {
          weeklyRev += t.amount;
        }
        if (isAfter(tDate, monthStart)) {
          monthlyRev += t.amount;
          monthlyProfit += profit;
        }
      } else if (t.type === TransactionType.EXPENSE) {
        // Expenses reduce profit
        totalProfit -= t.amount;
         if (isAfter(tDate, dayStart)) {
          dailyProfit -= t.amount;
        }
        if (isAfter(tDate, monthStart)) {
          monthlyProfit -= t.amount;
        }
      }
    });

    const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return { dailyRev, weeklyRev, monthlyRev, dailyProfit, monthlyProfit, margin };
  }, [transactions]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-slate-400 text-sm">Visão geral do seu negócio</p>
        </div>
        <div className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Margem Global</span>
          <div className={`text-sm font-bold ${stats.margin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.margin.toFixed(1)}%
          </div>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <DollarSign size={16} />
            <span className="text-xs uppercase font-semibold">Hoje</span>
          </div>
          <div className="text-xl font-bold text-white">{formatCurrency(stats.dailyRev)}</div>
          <div className={`text-xs mt-1 ${stats.dailyProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            Lucro: {formatCurrency(stats.dailyProfit)}
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <TrendingUp size={16} />
            <span className="text-xs uppercase font-semibold">Semana</span>
          </div>
          <div className="text-xl font-bold text-white">{formatCurrency(stats.weeklyRev)}</div>
        </div>
      </div>

      {/* Monthly Large Card */}
      <div className="bg-gradient-to-br from-violet-900 to-slate-900 p-6 rounded-3xl border border-violet-800/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-violet-600 rounded-full blur-3xl opacity-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-violet-200">
            <Wallet size={18} />
            <span className="text-sm uppercase font-semibold">Faturamento Mês</span>
          </div>
          <div className="text-4xl font-bold text-white mb-2">{formatCurrency(stats.monthlyRev)}</div>
          <div className="flex items-center gap-2 bg-black/20 w-fit px-3 py-1 rounded-lg backdrop-blur-sm">
             <span className="text-sm text-violet-200">Lucro Líquido:</span>
             <span className={`text-sm font-bold ${stats.monthlyProfit >= 0 ? 'text-green-400' : 'text-red-300'}`}>
               {formatCurrency(stats.monthlyProfit)}
             </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider ml-1">Ações Rápidas</h3>
        
        <button 
          onClick={() => onAddTransaction(TransactionType.SALE)}
          className="w-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 p-4 rounded-xl flex items-center justify-between border border-slate-700 transition group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-500/10 p-2 rounded-lg text-green-500 group-hover:bg-green-500/20 transition">
              <Plus size={20} />
            </div>
            <div className="text-left">
              <div className="text-white font-semibold">Nova Venda</div>
              <div className="text-slate-400 text-xs">Registrar entrada</div>
            </div>
          </div>
          <TrendingUp className="text-slate-600" size={18} />
        </button>

        <button 
          onClick={() => onAddTransaction(TransactionType.EXPENSE)}
          className="w-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 p-4 rounded-xl flex items-center justify-between border border-slate-700 transition group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-red-500/10 p-2 rounded-lg text-red-500 group-hover:bg-red-500/20 transition">
              <TrendingDown size={20} />
            </div>
            <div className="text-left">
              <div className="text-white font-semibold">Novo Gasto</div>
              <div className="text-slate-400 text-xs">Despesa operacional</div>
            </div>
          </div>
          <TrendingDown className="text-slate-600" size={18} />
        </button>

        <button 
          onClick={() => onAddTransaction(TransactionType.INVESTMENT)}
          className="w-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 p-4 rounded-xl flex items-center justify-between border border-slate-700 transition group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500 group-hover:bg-blue-500/20 transition">
              <Wallet size={20} />
            </div>
            <div className="text-left">
              <div className="text-white font-semibold">Investimento</div>
              <div className="text-slate-400 text-xs">Aporte no negócio</div>
            </div>
          </div>
          <Wallet className="text-slate-600" size={18} />
        </button>
      </div>
    </div>
  );
};