import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { onSnapshot, query, collection, where, orderBy } from 'firebase/firestore';
import { auth, db, TRANSACTIONS_COLLECTION } from './services/firebase';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Goals } from './components/Goals';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { TransactionForm } from './components/TransactionForm';
import { Tab, Transaction, TransactionType } from './types';
import { Home, Target, BarChart3, Plus, Minus, Settings as SettingsIcon } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('HOME');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modalType, setModalType] = useState<TransactionType | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Transactions Real-time
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      return;
    }

    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where("userId", "==", user.uid),
      orderBy("date", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      // Client side fallback sort
      data.sort((a, b) => b.date - a.date);
      setTransactions(data);
    }, (error) => {
      console.error("Firestore error:", error);
    });

    return () => unsub();
  }, [user]);

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#39FF14]"></div></div>;
  }

  if (!user) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'HOME': return <Dashboard transactions={transactions} onNavigate={(tab) => setActiveTab(tab)} />;
      case 'GOALS': return <Goals transactions={transactions} />;
      case 'REPORTS': return <Reports transactions={transactions} />;
      case 'SETTINGS': return <Settings />;
      default: return <Dashboard transactions={transactions} onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-gray-100 font-sans selection:bg-[#39FF14]/30">
      
      {/* Main Content Area */}
      <main className="max-w-md mx-auto min-h-screen p-6 relative">
        {renderContent()}
      </main>

      {/* Sticky Bottom Navigation - Fixed actions bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-zinc-900 pb-safe z-50">
        <div className="max-w-md mx-auto w-full px-4 py-4">
          <ul className="grid grid-cols-5 gap-1 items-end">
            
            {/* 1. Home */}
            <li>
              <button 
                onClick={() => setActiveTab('HOME')}
                className={`w-full flex flex-col items-center gap-1.5 transition-all ${activeTab === 'HOME' ? 'text-[#39FF14]' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                <Home size={24} strokeWidth={activeTab === 'HOME' ? 2.5 : 2} />
                <span className="text-[8px] font-bold uppercase tracking-widest">Home</span>
              </button>
            </li>

            {/* 2. Vendas (Action) */}
            <li>
              <button 
                onClick={() => setModalType(TransactionType.SALE)}
                className="w-full flex flex-col items-center gap-1.5 text-zinc-600 hover:text-white transition-colors group"
              >
                <div className="bg-zinc-900 group-hover:bg-[#39FF14] group-hover:text-black p-3 rounded-2xl border border-zinc-800 group-hover:border-[#39FF14] transition-all shadow-lg">
                  <Plus size={20} />
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest group-hover:text-[#39FF14]">Vendas</span>
              </button>
            </li>

            {/* 3. Gastos (Action) */}
            <li>
              <button 
                onClick={() => setModalType(TransactionType.EXPENSE)}
                className="w-full flex flex-col items-center gap-1.5 text-zinc-600 hover:text-white transition-colors group"
              >
                <div className="bg-zinc-900 group-hover:bg-red-500 group-hover:text-white p-3 rounded-2xl border border-zinc-800 group-hover:border-red-500 transition-all shadow-lg">
                  <Minus size={20} />
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest group-hover:text-red-500">Gastos</span>
              </button>
            </li>

            {/* 4. Relatórios */}
            <li>
              <button 
                onClick={() => setActiveTab('REPORTS')}
                className={`w-full flex flex-col items-center gap-1.5 transition-all ${activeTab === 'REPORTS' ? 'text-[#39FF14]' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                <BarChart3 size={24} strokeWidth={activeTab === 'REPORTS' ? 2.5 : 2} />
                <span className="text-[8px] font-bold uppercase tracking-widest">Relat.</span>
              </button>
            </li>

            {/* 5. Metas */}
            <li>
              <button 
                onClick={() => setActiveTab('GOALS')}
                className={`w-full flex flex-col items-center gap-1.5 transition-all ${activeTab === 'GOALS' ? 'text-[#39FF14]' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                <Target size={24} strokeWidth={activeTab === 'GOALS' ? 2.5 : 2} />
                <span className="text-[8px] font-bold uppercase tracking-widest">Metas</span>
              </button>
            </li>

          </ul>
        </div>
      </nav>

      {/* Transaction Modal */}
      {modalType && (
        <TransactionForm type={modalType} onClose={() => setModalType(null)} />
      )}

    </div>
  );
};

export default App;