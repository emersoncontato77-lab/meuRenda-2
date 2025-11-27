import React, { useState } from 'react';
import { auth, signOut, clearUserData } from '../services/firebase';
import { LogOut, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';

export const Settings: React.FC = () => {
  const [confirmReset, setConfirmReset] = useState(false);

  const handleLogout = () => {
    signOut(auth);
  };

  const handleReset = async () => {
    if (auth.currentUser) {
      await clearUserData(auth.currentUser.uid);
      alert("Dados apagados com sucesso.");
      setConfirmReset(false);
      window.location.reload();
    }
  };

  return (
    <div className="pb-24">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-white">Configurações</h2>
        <p className="text-slate-400 text-sm">Gerencie sua conta e dados</p>
      </header>

      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="bg-slate-800 p-3 rounded-full">
            <ShieldAlert className="text-violet-400" size={24} />
          </div>
          <div>
            <p className="text-white font-medium">Conta</p>
            <p className="text-slate-400 text-xs">{auth.currentUser?.email}</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white p-4 rounded-2xl flex items-center justify-between transition"
        >
          <span className="font-medium">Sair do App</span>
          <LogOut size={18} className="text-slate-500" />
        </button>

        <div className="border-t border-slate-800 my-6 pt-6">
          <h3 className="text-red-400 text-sm font-bold uppercase mb-4 flex items-center gap-2">
            <AlertTriangle size={16} /> Zona de Perigo
          </h3>

          {!confirmReset ? (
            <button 
              onClick={() => setConfirmReset(true)}
              className="w-full bg-red-900/20 border border-red-900/50 hover:bg-red-900/30 text-red-200 p-4 rounded-2xl flex items-center justify-between transition"
            >
              <span className="font-medium">Zerar App (Apagar Tudo)</span>
              <Trash2 size={18} />
            </button>
          ) : (
            <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-2xl text-center">
              <p className="text-white font-bold mb-2">Tem certeza?</p>
              <p className="text-red-200 text-sm mb-4">Isso apagará todas as vendas, gastos e metas permanentemente.</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 bg-slate-800 text-white py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleReset}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold"
                >
                  Sim, apagar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};