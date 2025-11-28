import React, { useState } from 'react';
import { auth, signOut, clearUserData } from '../services/firebase';
import { LogOut, Trash2, AlertTriangle, ShieldCheck, User } from 'lucide-react';

export const Settings: React.FC = () => {
  const [confirmReset, setConfirmReset] = useState(false);

  const handleLogout = () => {
    signOut(auth);
  };

  const handleReset = async () => {
    if (auth.currentUser) {
      await clearUserData(auth.currentUser.uid);
      setConfirmReset(false);
      window.location.reload();
    }
  };

  return (
    <div className="pb-32 bg-[#000000] min-h-screen">
      <header className="mb-10 pt-4">
        <h2 className="text-2xl font-bold text-white tracking-wide">CONFIGURAÇÕES</h2>
        <p className="text-gray-500 text-xs">Controle de conta e dados</p>
      </header>

      <div className="space-y-6">
        {/* Account Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#39FF14] opacity-5 rounded-full blur-2xl"></div>
          <div className="bg-black border border-[#39FF14]/30 p-4 rounded-full">
            <User className="text-[#39FF14]" size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Usuário Logado</p>
            <p className="text-white font-bold">{auth.currentUser?.email}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button 
            onClick={handleLogout}
            className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-white p-5 rounded-2xl flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-3">
               <LogOut size={20} className="text-gray-500 group-hover:text-white transition" />
               <span className="font-bold text-sm">Sair do Aplicativo</span>
            </div>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="mt-10 pt-10 border-t border-zinc-900">
          <h3 className="text-red-500 text-xs font-bold uppercase mb-4 flex items-center gap-2 tracking-widest">
            <AlertTriangle size={14} /> Área de Perigo
          </h3>

          {!confirmReset ? (
            <button 
              onClick={() => setConfirmReset(true)}
              className="w-full bg-red-950/20 border border-red-900/30 hover:bg-red-900/20 text-red-400 p-5 rounded-2xl flex items-center justify-between transition group"
            >
              <span className="font-bold text-sm">Zerar App (Apagar Tudo)</span>
              <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
            </button>
          ) : (
            <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-3xl text-center animate-in zoom-in-95 duration-200">
              <p className="text-white font-bold text-lg mb-2">Tem certeza?</p>
              <p className="text-red-300/70 text-sm mb-6">Isso apagará todas as vendas, gastos e metas permanentemente. Não há volta.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 bg-black border border-zinc-800 text-white py-3 rounded-xl text-sm font-bold hover:bg-zinc-900"
                >
                  CANCELAR
                </button>
                <button 
                  onClick={handleReset}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-red-900/20"
                >
                  SIM, APAGAR
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};