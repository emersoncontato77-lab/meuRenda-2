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
import { Home, Target, BarChart3, Settings as SettingsIcon } from 'lucide-react';

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
      orderBy("date", "desc") // requires index in firestore sometimes, if fails try sorting in JS
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      // Client side sort fallback if composite index not created yet
      data.sort((a, b) => b.date - a.date);
      setTransactions(data);
    }, (error) => {
      console.error("Firestore error:", error);
      // Fallback for index error: simple fetch
      // In production you create the index via the link provided in console error
    });

    return () => unsub();
  }, [user]);

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Carregando...</div>;
  }

  if (!user) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'HOME': return <Dashboard transactions={transactions} onAddTransaction={setModalType} />;
      case 'GOALS': return <Goals transactions={transactions} />;
      case 'REPORTS': return <Reports transactions={transactions} />;
      case 'SETTINGS': return <Settings />;
      default: return <Dashboard transactions={transactions} onAddTransaction={setModalType} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-violet-500/30">
      
      {/* Main Content Area */}
      <main className="max-w-md mx-auto min-h-screen p-4 pt-8 relative">
        {renderContent()}
      </main>

      {/* Sticky Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 pb-safe pt-2 px-6 pb-4 z-40 max-w-md mx-auto w-full">
        <ul className="flex justify-between items-center">
          <li>
            <button 
              onClick={() => setActiveTab('HOME')}
              className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'HOME' ? 'text-violet-400' : 'text-slate-500 hover:text-slate-400'}`}
            >
              <Home size={24} strokeWidth={activeTab === 'HOME' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Home</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('GOALS')}
              className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'GOALS' ? 'text-violet-400' : 'text-slate-500 hover:text-slate-400'}`}
            >
              <Target size={24} strokeWidth={activeTab === 'GOALS' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Metas</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('REPORTS')}
              className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'REPORTS' ? 'text-violet-400' : 'text-slate-500 hover:text-slate-400'}`}
            >
              <BarChart3 size={24} strokeWidth={activeTab === 'REPORTS' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Relatórios</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('SETTINGS')}
              className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'SETTINGS' ? 'text-violet-400' : 'text-slate-500 hover:text-slate-400'}`}
            >
              <SettingsIcon size={24} strokeWidth={activeTab === 'SETTINGS' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Config</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Transaction Modal */}
      {modalType && (
        <TransactionForm type={modalType} onClose={() => setModalType(null)} />
      )}

    </div>
  );
};

export default App;