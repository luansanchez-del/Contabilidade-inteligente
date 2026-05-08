import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">AuditAI Contábil</h1>
          <p className="text-blue-100 text-sm">Inteligência Artificial para Auditoria Fiscal</p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider transition-all ${
                isLogin
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider transition-all ${
                !isLogin
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Registrar
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <LoginForm />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <RegisterForm />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-blue-100 text-xs mt-8 font-medium"
        >
          © 2026 AUDITAI CONTÁBIL - INTELIGÊNCIA FISCAL APLICADA
        </motion.p>
      </div>
    </div>
  );
};
