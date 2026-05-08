import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { motion } from 'motion/react';

export const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    if (!email.includes('@')) {
      setError('Email inválido');
      return false;
    }
    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Senhas não correspondem');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register(email, password, name);
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm font-medium text-red-800">{error}</p>
        </motion.div>
      )}

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Nome Completo
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="João Silva"
            required
            disabled={isLoading}
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            disabled={isLoading}
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Senha
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            required
            disabled={isLoading}
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
        </div>
        {password.length > 0 && password.length < 6 && (
          <p className="text-xs text-yellow-600 mt-1">Mínimo 6 caracteres</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Confirmar Senha
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••"
            required
            disabled={isLoading}
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
        </div>
        {confirmPassword.length > 0 && password === confirmPassword && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-emerald-600 mt-1 flex items-center gap-1"
          >
            <CheckCircle className="w-3 h-3" /> Senhas conferem
          </motion.p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Registrando...
          </>
        ) : (
          'Criar Conta'
        )}
      </button>
    </form>
  );
};
