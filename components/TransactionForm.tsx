import React, { useState } from 'react';
import { TransactionType } from '../types';
import { X, Calendar } from 'lucide-react';
import { db, TRANSACTIONS_COLLECTION, auth } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface TransactionFormProps {
  type: TransactionType | null;
  onClose: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ type, onClose }) => {
  const [amount, setAmount] = useState('');
  const [cost, setCost] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  if (!type) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      const numAmount = parseFloat(amount);
      const numCost = cost ? parseFloat(cost) : 0;
      
      await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
        userId: auth.currentUser.uid,
        type,
        description,
        amount: numAmount,
        cost: type === TransactionType.SALE ? numCost : 0,
        date: new Date(date).getTime(),
        createdAt: Date.now()
      });
      onClose();
    } catch (error) {
      console.error("Error adding doc", error);
      alert("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case TransactionType.SALE: return 'Nova Venda';
      case TransactionType.EXPENSE: return 'Novo Gasto';
      case TransactionType.INVESTMENT: return 'Novo Investimento';
      default: return '';
    }
  };

  const getProfitPreview = () => {
    if (type !== TransactionType.SALE) return null;
    const val = parseFloat(amount) || 0;
    const c = parseFloat(cost) || 0;
    const profit = val - c;
    const margin = val > 0 ? ((profit / val) * 100).toFixed(1) : '0.0';
    return (
      <div className="mt-4 p-3 bg-slate-800 rounded-lg border border-slate-700">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">Lucro Estimado:</span>
          <span className={profit >= 0 ? 'text-green-400' : 'text-red-400'}>
            R$ {profit.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Margem:</span>
          <span className="text-slate-300">{margin}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-slate-800 shadow-2xl relative animate-in slide-in-from-bottom-10 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">{getTitle()}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-lg font-semibold rounded-xl p-4 focus:ring-2 focus:ring-violet-500 outline-none"
              placeholder="0,00"
            />
          </div>

          {type === TransactionType.SALE && (
             <div>
             <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Custo do Produto (R$)</label>
             <input
               type="number"
               step="0.01"
               required
               value={cost}
               onChange={(e) => setCost(e.target.value)}
               className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-violet-500 outline-none"
               placeholder="Quanto custou pra você?"
             />
           </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Descrição</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-violet-500 outline-none"
              placeholder={type === TransactionType.EXPENSE ? "Ex: Aluguel, Luz" : "Ex: Camiseta, Serviço X"}
            />
          </div>

          {type === TransactionType.EXPENSE && (
             <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Tipo</label>
              <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 outline-none">
                <option>Fixo</option>
                <option>Variável</option>
                <option>Imprevisto</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase flex items-center gap-1">
              <Calendar size={12}/> Data
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

          {getProfitPreview()}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white transition mt-4
              ${type === TransactionType.SALE ? 'bg-green-600 hover:bg-green-700' : 
                type === TransactionType.EXPENSE ? 'bg-red-600 hover:bg-red-700' : 
                'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Salvando...' : 'Confirmar'}
          </button>

        </form>
      </div>
    </div>
  );
};