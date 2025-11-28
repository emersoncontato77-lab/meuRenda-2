import React, { useState, useEffect } from 'react';
import { Goal, Transaction, TransactionType } from '../types';
import { Target, Trash2, Plus } from 'lucide-react';
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
    let exp = 0;
    transactions.forEach(t => {
      if (t.type === TransactionType.SALE) rev += t.amount;
      if (t.type === TransactionType.EXPENSE) exp += t.amount;
    });
    const profit = rev - exp;
    return {
      revenue: rev,
      profit: profit,
      margin: rev > 0 ? (profit / rev) : 0
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
    
    // Simple progress logic for demo (Monthly goal assumes current month progress)
    const now = new Date();
    const totalDays = differenceInDays(endOfMonth(now), startOfMonth(now)) + 1;
    const daysPassed = now.getDate();
    const daysRemaining = totalDays - daysPassed;

    let currentProgress = 0; // Assuming goal is Net Profit
    if (goal.type === 'MONTHLY') {
       const monthStart = startOfMonth(now).getTime();
       // Calc profit for month
       const mRev = transactions.filter(t => t.type === TransactionType.SALE && t.date >= monthStart).reduce((a, b) => a + b.amount, 0);
       const mExp = transactions.filter(t => t.type === TransactionType.EXPENSE && t.date >= monthStart).reduce((a, b) => a + b.amount, 0);
       currentProgress = mRev - mExp;
    }

    const remainingAmount = Math.max(0, goal.targetAmount - currentProgress);
    const progressPercent = Math.min(100, Math.max(0, (currentProgress / goal.targetAmount) * 100));
    
    const effectiveDays = goal.type === 'CUSTOM' && goal.workDays ? goal.workDays : daysRemaining;
    const dailyProfitNeeded = effectiveDays > 0 ? remainingAmount / effectiveDays : 0;
    const dailyRevenueNeeded = margin > 0 ? dailyProfitNeeded / margin : 0;

    return (
      <div key={goal.id} className="bg-zinc-900 border border-zinc-800 hover:border-[#39FF14]/50 p-5 rounded-3xl mb-4 relative shadow-lg transition-all duration-300">
        <button 
          onClick={() => goal.id && deleteGoal(goal.id)}
          className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 transition"
        >
          <Trash2 size={18} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="bg-[#39FF14]/10 p-2 rounded-full">
             <Target className="text-[#39FF14]" size={20} />
          </div>
          <h3 className="font-bold text-white uppercase tracking-wider text-sm">
            {goal.type === 'MONTHLY' ? 'Meta Mensal' : goal.type === 'WEEKLY' ? 'Meta Semanal' : 'Meta Personalizada'}
          </h3>
        </div>

        <div className="flex justify-between items-end mb-2">
          <span className="text-gray-400 text-xs font-medium uppercase">Progresso</span>
          <span className="text-[#39FF14] font-bold font-mono">{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-black border border-zinc-800 h-3 rounded-full overflow-hidden mb-5">
          <div 
            className="bg-[#39FF14] h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(57,255,20,0.5)]" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black border border-zinc-800 p-3 rounded-xl">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Falta (Lucro)</p>
            <p className="font-bold text-white">R$ {remainingAmount.toFixed(2)}</p>
          </div>
          <div className="bg-black border border-zinc-800 p-3 rounded-xl">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Meta Diária (Fat.)</p>
            <p className="font-bold text-[#39FF14]">R$ {dailyRevenueNeeded.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="mt-4 text-[10px] text-gray-600 text-center uppercase tracking-widest">
          Margem Atual: { (margin * 100).toFixed(1) }% 
        </div>
      </div>
    );
  };

  return (
    <div className="pb-32 bg-[#000000] min-h-screen">
      <header className="flex justify-between items-center mb-8 pt-4">
        <div>
           <h2 className="text-2xl font-bold text-white tracking-wide">METAS</h2>
           <p className="text-gray-500 text-xs">Acompanhe seus objetivos</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-[#39FF14] hover:bg-[#32cc12] text-black px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-[0_0_10px_rgba(57,255,20,0.3)]"
        >
          {showAdd ? 'CANCELAR' : <><Plus size={16}/> NOVA META</>}
        </button>
      </header>

      {showAdd && (
        <form onSubmit={handleAddGoal} className="bg-zinc-900 border border-[#39FF14]/30 p-5 rounded-3xl mb-8 animate-in slide-in-from-top-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <div className="mb-5">
            <label className="block text-[10px] text-[#39FF14] font-bold mb-2 uppercase tracking-widest">Tipo de Meta</label>
            <div className="flex gap-2 bg-black p-1 rounded-xl border border-zinc-800">
              {(['MONTHLY', 'WEEKLY', 'CUSTOM'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setGoalType(t)}
                  className={`flex-1 py-3 text-[10px] font-bold rounded-lg transition ${goalType === t ? 'bg-[#39FF14] text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  {t === 'MONTHLY' ? 'MÊS' : t === 'WEEKLY' ? 'SEMANA' : 'PERS.'}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-[10px] text-gray-500 font-bold mb-2 uppercase tracking-widest">Objetivo de Lucro (R$)</label>
            <input 
              type="number" 
              required
              value={targetAmount}
              onChange={e => setTargetAmount(e.target.value)}
              className="w-full bg-black border border-zinc-800 text-white p-4 rounded-xl outline-none focus:border-[#39FF14] transition"
              placeholder="0.00"
            />
          </div>

          {goalType === 'CUSTOM' && (
            <div className="mb-5">
              <label className="block text-[10px] text-gray-500 font-bold mb-2 uppercase tracking-widest">Dias de Trabalho</label>
              <input 
                type="number" 
                required
                value={workDays}
                onChange={e => setWorkDays(e.target.value)}
                className="w-full bg-black border border-zinc-800 text-white p-4 rounded-xl outline-none focus:border-[#39FF14] transition"
              />
            </div>
          )}

          <div className="mb-6">
             <label className="flex items-center gap-3 mb-3 cursor-pointer p-3 bg-black border border-zinc-800 rounded-xl">
                <input 
                  type="checkbox" 
                  checked={useAutoMargin} 
                  onChange={e => setUseAutoMargin(e.target.checked)}
                  className="rounded bg-zinc-800 border-zinc-600 text-[#39FF14] focus:ring-[#39FF14]"
                />
                <span className="text-xs text-gray-300 font-medium">Usar Margem Média Automática</span>
             </label>
             {!useAutoMargin && (
               <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-[10px] text-gray-500 font-bold mb-2 uppercase tracking-widest">Margem Personalizada (%)</label>
                  <input 
                    type="number" 
                    value={manualMargin}
                    onChange={e => setManualMargin(e.target.value)}
                    className="w-full bg-black border border-zinc-800 text-white p-4 rounded-xl outline-none focus:border-[#39FF14]"
                  />
               </div>
             )}
          </div>

          <button type="submit" className="w-full bg-[#39FF14] hover:bg-[#32cc12] text-black font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(57,255,20,0.4)] transition">
            CRIAR META
          </button>
        </form>
      )}

      {goals.length === 0 ? (
        <div className="text-center py-20 opacity-30">
          <Target className="mx-auto mb-4 text-[#39FF14]" size={48} />
          <p className="text-sm font-medium">Nenhuma meta definida.</p>
        </div>
      ) : (
        goals.map(renderGoalCard)
      )}
    </div>
  );
};