import React, { useState, useEffect } from 'react';
import { Goal, Transaction, TransactionType } from '../types';
import { Target, Trash2, CheckCircle2 } from 'lucide-react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db, GOALS_COLLECTION, auth } from '../services/firebase';
import { startOfMonth, endOfMonth, differenceInDays } from 'date-fns';

interface GoalsProps {
  transactions: Transaction[];
}

export const Goals: React.FC<GoalsProps> = ({ transactions }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  
  // Form State
  const [goalType, setGoalType] = useState<'MONTHLY' | 'WEEKLY' | 'CUSTOM'>('MONTHLY');
  const [targetAmount, setTargetAmount] = useState('');
  const [workDays, setWorkDays] = useState('22');
  const [useAutoMargin, setUseAutoMargin] = useState(true);
  const [manualMargin, setManualMargin] = useState('50');

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, GOALS_COLLECTION), where("userId", "==", auth.currentUser.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setGoals(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Goal)));
    });
    return () => unsub();
  }, []);

  const calculateUserStats = () => {
    let rev = 0;
    let prof = 0;
    transactions.forEach(t => {
      if (t.type === TransactionType.SALE) {
        rev += t.amount;
        prof += (t.amount - (t.cost || 0));
      }
    });
    return {
      revenue: rev,
      profit: prof,
      margin: rev > 0 ? (prof / rev) : 0
    };
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    await addDoc(collection(db, GOALS_COLLECTION), {
      userId: auth.currentUser.uid,
      type: goalType,
      targetAmount: parseFloat(targetAmount),
      workDays: goalType === 'CUSTOM' ? parseInt(workDays) : undefined,
      useAutoMargin,
      manualMargin: !useAutoMargin ? parseFloat(manualMargin) : undefined,
      createdAt: Date.now()
    });
    setShowAdd(false);
    setTargetAmount('');
  };

  const deleteGoal = async (id: string) => {
    await deleteDoc(doc(db, GOALS_COLLECTION, id));
  };

  const renderGoalCard = (goal: Goal) => {
    const stats = calculateUserStats();
    const margin = goal.useAutoMargin ? stats.margin : (goal.manualMargin || 0) / 100;
    
    // Logic specific to Monthly Goal (simplified for demo)
    const now = new Date();
    const totalDays = differenceInDays(endOfMonth(now), startOfMonth(now)) + 1;
    const daysPassed = now.getDate();
    const daysRemaining = totalDays - daysPassed;

    // Calculate Progress based on recent transactions (Approximation for demo)
    // In a real app, we'd filter transactions by the goal's timeframe
    let currentProgress = 0; 
    // Filter transactions for current month if Monthly
    if (goal.type === 'MONTHLY') {
       const monthStart = startOfMonth(now).getTime();
       currentProgress = transactions
        .filter(t => t.type === TransactionType.SALE && t.date >= monthStart)
        .reduce((acc, t) => acc + (t.amount - (t.cost || 0)), 0); // Goal is usually profit based? Or revenue? Let's assume Profit Goal for financial freedom.
        // Actually prompt says "Faturamento por dia" in custom, implying Revenue goals, but then asks for "Lucro liquido necessario".
        // Let's assume the Target Amount is NET PROFIT goal.
    }

    const remainingAmount = Math.max(0, goal.targetAmount - currentProgress);
    const progressPercent = Math.min(100, (currentProgress / goal.targetAmount) * 100);
    
    // Projections
    const effectiveDays = goal.type === 'CUSTOM' && goal.workDays ? goal.workDays : daysRemaining;
    const dailyProfitNeeded = effectiveDays > 0 ? remainingAmount / effectiveDays : 0;
    const dailyRevenueNeeded = margin > 0 ? dailyProfitNeeded / margin : 0;

    return (
      <div key={goal.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl mb-4 relative">
        <button 
          onClick={() => goal.id && deleteGoal(goal.id)}
          className="absolute top-4 right-4 text-slate-600 hover:text-red-400"
        >
          <Trash2 size={18} />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Target className="text-violet-500" size={20} />
          <h3 className="font-bold text-white">
            {goal.type === 'MONTHLY' ? 'Meta Mensal' : goal.type === 'WEEKLY' ? 'Meta Semanal' : 'Meta Personalizada'}
          </h3>
        </div>

        <div className="flex justify-between items-end mb-2">
          <span className="text-slate-400 text-sm">Progresso</span>
          <span className="text-white font-bold">{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-4">
          <div 
            className="bg-violet-600 h-full rounded-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-slate-800/50 p-3 rounded-xl">
            <p className="text-xs text-slate-400">Falta (Lucro)</p>
            <p className="font-bold text-white">R$ {remainingAmount.toFixed(2)}</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl">
            <p className="text-xs text-slate-400">Meta Diária (Fat.)</p>
            <p className="font-bold text-emerald-400">R$ {dailyRevenueNeeded.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-slate-500 text-center">
          Baseado em margem de { (margin * 100).toFixed(1) }% 
          ({goal.useAutoMargin ? 'Automática' : 'Manual'})
        </div>
      </div>
    );
  };

  return (
    <div className="pb-24">
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Metas</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          {showAdd ? 'Cancelar' : 'Nova Meta'}
        </button>
      </header>

      {showAdd && (
        <form onSubmit={handleAddGoal} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl mb-6 animate-in slide-in-from-top-4">
          <div className="mb-4">
            <label className="block text-xs text-slate-400 mb-2 uppercase">Tipo de Meta</label>
            <div className="flex gap-2">
              {(['MONTHLY', 'WEEKLY', 'CUSTOM'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setGoalType(t)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border ${goalType === t ? 'bg-violet-600 border-violet-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  {t === 'MONTHLY' ? 'Mês' : t === 'WEEKLY' ? 'Semana' : 'Pers.'}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs text-slate-400 mb-1 uppercase">Objetivo de Lucro (R$)</label>
            <input 
              type="number" 
              required
              value={targetAmount}
              onChange={e => setTargetAmount(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:border-violet-500"
              placeholder="Ex: 5000.00"
            />
          </div>

          {goalType === 'CUSTOM' && (
            <div className="mb-4">
              <label className="block text-xs text-slate-400 mb-1 uppercase">Dias de Trabalho</label>
              <input 
                type="number" 
                required
                value={workDays}
                onChange={e => setWorkDays(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:border-violet-500"
              />
            </div>
          )}

          <div className="mb-6">
             <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={useAutoMargin} 
                  onChange={e => setUseAutoMargin(e.target.checked)}
                  className="rounded bg-slate-700 border-slate-600 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-sm text-slate-300">Usar Margem Média Automática</span>
             </label>
             {!useAutoMargin && (
               <div>
                  <label className="block text-xs text-slate-400 mb-1 uppercase">Margem Personalizada (%)</label>
                  <input 
                    type="number" 
                    value={manualMargin}
                    onChange={e => setManualMargin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:border-violet-500"
                  />
               </div>
             )}
          </div>

          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl">
            Criar Meta
          </button>
        </form>
      )}

      {goals.length === 0 ? (
        <div className="text-center py-10 opacity-50">
          <Target className="mx-auto mb-2" size={40} />
          <p>Nenhuma meta definida ainda.</p>
        </div>
      ) : (
        goals.map(renderGoalCard)
      )}
    </div>
  );
};