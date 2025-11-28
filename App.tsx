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
    return <div className="min-h-screen bg-black flex items-center justify-center text-white"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-neon"></div></div>;
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
    <div className="min-h-screen bg-black text-slate-200 font-sans selection:bg-neon/30">
      
      {/* Main Content Area */}
      <main className="max-w-md mx-auto min-h-screen p-4 pt-6 pb-24 relative">
        {renderContent()}
      </main>

      {/* Sticky Bottom Navigation - Fixed actions bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-gray-800 pb-safe z-50">
        <div className="max-w-md mx-auto w-full px-2 py-3">
          <ul className="grid grid-cols-5 gap-1 items-end">
            
            {/* 1. Home (Implicitly needed for UX) */}
            <li>
              <button 
                onClick={() => setActiveTab('HOME')}
                className={`w-full flex flex-col items-center gap-1 transition-all ${activeTab === 'HOME' ? 'text-neon' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Home size={22} strokeWidth={activeTab === 'HOME' ? 2.5 : 2} />
                <span className="text-[9px] font-medium uppercase tracking-wide">Home</span>
              </button>
            </li>

            {/* 2. Vendas (Action) */}
            <li>
              <button 
                onClick={() => setModalType(TransactionType.SALE)}
                className="w-full flex flex-col items-center gap-1 text-gray-500 hover:text-green-400 transition-colors group"
              >
                <div className="bg-gray-800 group-hover:bg-gray-700 p-2 rounded-xl border border-gray-700 group-hover:border-green-500 transition-all">
                  <Plus size={20} className="text-green-500" />
                </div>
                <span className="text-[9px] font-medium uppercase tracking-wide">Vendas</span>
              </button>
            </li>

            {/* 3. Gastos (Action) */}
            <li>
              <button 
                onClick={() => setModalType(TransactionType.EXPENSE)}
                className="w-full flex flex-col items-center gap-1 text-gray-500 hover:text-red-400 transition-colors group"
              >
                <div className="bg-gray-800 group-hover:bg-gray-700 p-2 rounded-xl border border-gray-700 group-hover:border-red-500 transition-all">
                  <Minus size={20} className="text-red-500" />
                </div>
                <span className="text-[9px] font-medium uppercase tracking-wide">Gastos</span>
              </button>
            </li>

            {/* 4. Relatórios */}
            <li>
              <button 
                onClick={() => setActiveTab('REPORTS')}
                className={`w-full flex flex-col items-center gap-1 transition-all ${activeTab === 'REPORTS' ? 'text-neon' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <BarChart3 size={22} strokeWidth={activeTab === 'REPORTS' ? 2.5 : 2} />
                <span className="text-[9px] font-medium uppercase tracking-wide">Relat.</span>
              </button>
            </li>

            {/* 5. Metas */}
            <li>
              <button 
                onClick={() => setActiveTab('GOALS')}
                className={`w-full flex flex-col items-center gap-1 transition-all ${activeTab === 'GOALS' ? 'text-neon' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Target size={22} strokeWidth={activeTab === 'GOALS' ? 2.5 : 2} />
                <span className="text-[9px] font-medium uppercase tracking-wide">Metas</span>
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