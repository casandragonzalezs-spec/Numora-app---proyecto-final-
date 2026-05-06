/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TrendingUp, ShieldCheck } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';

export default function AuthPage() {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row" id="auth-page">
      <div className="md:w-1/2 p-8 md:p-24 flex flex-col justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto"
        >
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-lg">
              <TrendingUp size={24} />
            </div>
            <h1 className="text-3xl font-sans font-bold tracking-tight text-neutral-900">Numora</h1>
          </div>

          <h2 className="text-5xl font-sans font-semibold text-neutral-900 leading-tight mb-6">
            Master your wealth with <span className="text-neutral-500">intelligence.</span>
          </h2>
          
          <p className="text-lg text-neutral-500 mb-10 leading-relaxed">
            Numora provides high-fidelity financial analysis, automated budget tracking, and AI-powered insights to help you build lasting wealth.
          </p>

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-neutral-900 text-white py-4 rounded-2xl font-medium text-lg hover:bg-neutral-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            id="google-login-btn"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
            Sign in with Google
          </button>

          <div className="mt-12 flex items-center gap-4 text-neutral-400 text-sm">
            <ShieldCheck size={20} />
            <p>Enterprise-grade security. Your data is encrypted and secure.</p>
          </div>
        </motion.div>
      </div>

      <div className="hidden md:block md:w-1/2 bg-neutral-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white rounded-full mix-blend-overlay filter blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-neutral-400 rounded-full mix-blend-overlay filter blur-[120px] translate-y-1/3 -translate-x-1/4"></div>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center p-20">
          <div className="relative w-full aspect-square max-w-lg border border-neutral-800 rounded-3xl p-8 bg-neutral-900/50 backdrop-blur-xl">
             <div className="space-y-6">
                <div className="h-4 w-1/3 bg-neutral-800 rounded-lg"></div>
                <div className="h-12 w-full bg-neutral-800 rounded-xl"></div>
                <div className="h-64 w-full bg-neutral-800 rounded-2xl flex items-end p-6 gap-2">
                   <div className="w-1/4 h-[40%] bg-white/20 rounded-t-lg"></div>
                   <div className="w-1/4 h-[70%] bg-white/40 rounded-t-lg"></div>
                   <div className="w-1/4 h-[90%] bg-white/60 rounded-t-lg"></div>
                   <div className="w-1/4 h-[55%] bg-white/30 rounded-t-lg"></div>
                </div>
                <div className="h-8 w-1/2 bg-neutral-800 rounded-lg"></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
