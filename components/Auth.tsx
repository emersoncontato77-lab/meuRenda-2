import React, { useState } from 'react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../services/firebase';
import { Loader2, TrendingUp } from 'lucide-react';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#000000] p-4 text-white">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-neon relative overflow-hidden">
        
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14] opacity-5 blur-[80px] rounded-full"></div>

        <div className="flex justify-center mb-6 relative z-10">
          <div className="bg-black border border-[#39FF14] p-4 rounded-full shadow-[0_0_15px_rgba(57,255,20,0.3)]">
            <TrendingUp className="text-[#39FF14] w-8 h-8" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-white mb-2 tracking-wide">
          MeuRenda<span className="text-[#39FF14]">+</span>
        </h1>
        <p className="text-gray-400 text-center mb-8 text-sm">
          {isLogin ? 'Login' : 'Crie sua conta'}
        </p>

        <form onSubmit={handleAuth} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-[#39FF14] mb-1 uppercase tracking-wider">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-zinc-800 text-white rounded-xl p-3 focus:border-[#39FF14] focus:shadow-[0_0_10px_rgba(57,255,20,0.2)] outline-none transition placeholder-zinc-700"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#39FF14] mb-1 uppercase tracking-wider">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-zinc-800 text-white rounded-xl p-3 focus:border-[#39FF14] focus:shadow-[0_0_10px_rgba(57,255,20,0.2)] outline-none transition placeholder-zinc-700"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#39FF14] hover:bg-[#32cc12] text-black font-bold py-4 rounded-xl transition flex justify-center items-center shadow-[0_0_15px_rgba(57,255,20,0.4)]"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'ENTRAR' : 'CRIAR CONTA')}
          </button>
        </form>

        <div className="mt-8 text-center relative z-10">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-400 hover:text-white text-sm transition"
          >
            {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
            <span className="text-[#39FF14] underline underline-offset-4">{isLogin ? 'Cadastre-se' : 'Entrar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};