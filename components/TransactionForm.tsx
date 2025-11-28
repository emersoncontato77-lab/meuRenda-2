import React, { useState } from 'react';
import { TransactionType } from '../types';
import { X, Calendar, DollarSign, Tag, AlertCircle } from 'lucide-react';
import { db, TRANSACTIONS_COLLECTION, auth } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface TransactionFormProps {
  type: TransactionType | null;
  onClose: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ type, onClose }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  // For Expenses only
  const [expenseType, setExpenseType] = useState('Variável');

  if (!type) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      const numAmount = parseFloat(amount);
      
      // Determine description based on type if empty
      let finalDescription = description;
      if (!finalDescription) {
        if (type === TransactionType.SALE) finalDescription = "Faturamento Diário";
      }

      await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
        userId: auth.currentUser.uid,
        type,
        description: finalDescription,
        amount: numAmount,
        cost: 0, // No longer used for Sales input
        category: type === TransactionType.EXPENSE ? expenseType : undefined,
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
      case TransactionType.SALE: return 'REGISTRAR FATURAMENTO';
      case TransactionType.EXPENSE: return 'REGISTRAR GASTO';
      case TransactionType.INVESTMENT: return 'NOVO INVESTIMENTO';
      default: return '';
    }
  };

  const getButtonColor = () => {
    if (type === TransactionType.EXPENSE) return 'bg-red-600 hover:bg-red-700 shadow-red-900/50';
    if (type === TransactionType.INVESTMENT) return 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/50';
    return 'bg-[#39FF14] hover:bg-[#32cc12] text-black shadow-[0_0_20px_rgba(57,255,20,0.4)]';
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 w-full max-w-md rounded-3xl p-6 border border-[#39FF14]/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative animate-in slide-in-from-bottom-10 duration-300">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black rounded-full text-gray-400 hover:text-white border border-zinc-800"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
           {type === TransactionType.SALE && <div className="p-2 bg-[#39FF14]/10 rounded-full"><DollarSign className="text-[#39FF14]" /></div>}
           {type === TransactionType.EXPENSE && <div className="p-2 bg-red-500/10 rounded-full"><AlertCircle className="text-red-500" /></div>}
           {type === TransactionType.INVESTMENT && <div className="p-2 bg-blue-500/10 rounded-full"><DollarSign className="text-blue-500" /></div>}
           <h2 className="text-xl font-bold text-white tracking-wide">{getTitle()}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-[10px] font-bold text-[#39FF14] mb-2 uppercase tracking-widest">
              {type === TransactionType.SALE ? 'Valor Faturado (Total do Dia)' : 'Valor (R$)'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black border border-zinc-700 text-white text-2xl font-bold rounded-xl p-4 pl-12 focus:border-[#39FF14] focus:shadow-[0_0_10px_rgba(57,255,20,0.1)] outline-none transition placeholder-zinc-800"
                placeholder="0.00"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest flex items-center gap-1">
              <Tag size={12}/> Descrição
            </label>
            <input
              type="text"
              required={type !== TransactionType.SALE}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black border border-zinc-700 text-white rounded-xl p-3 focus:border-[#39FF14] outline-none transition placeholder-zinc-800"
              placeholder={
                type === TransactionType.SALE ? "Opcional (ex: Vendas da manhã)" : 
                type === TransactionType.EXPENSE ? "Ex: Luz, Aluguel, Fornecedor" : 
                "Ex: CDB, Equipamento novo"
              }
            />
          </div>

          {type === TransactionType.EXPENSE && (
             <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Categoria</label>
              <div className="grid grid-cols-3 gap-2">
                {['Fixo', 'Variável', 'Imprevisto'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setExpenseType(cat)}
                    className={`py-2 rounded-lg text-xs font-bold border transition ${expenseType === cat ? 'bg-zinc-800 text-white border-white' : 'bg-black text-gray-500 border-zinc-800'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest flex items-center gap-1">
              <Calendar size={12}/> Data de Referência
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-black border border-zinc-700 text-white rounded-xl p-3 focus:border-[#39FF14] outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white transition mt-6 shadow-lg ${getButtonColor()}`}
          >
            {loading ? 'SALVANDO...' : 'CONFIRMAR'}
          </button>

        </form>
      </div>
    </div>
  );
};