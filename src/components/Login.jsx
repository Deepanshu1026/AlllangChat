import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bot, Mail, Lock, Chrome, ArrowRight, Loader2, AlertCircle, Check } from 'lucide-react';

const Login = ({ onClose, isModal = false }) => {
    const { loginWithGoogle } = useAuth();
    const [error, setError] = useState('');

    const handleGoogleLogin = async () => {
        setError('');
        try {
            await loginWithGoogle();
            if (onClose) onClose();
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
    };

    const containerClasses = isModal
        ? "relative w-full max-w-4xl h-[500px] flex overflow-hidden bg-[#1a1a1a] rounded-3xl border border-white/5 animate-scale-in"
        : "w-full max-w-md animate-fade-in";

    return (
        <div className={isModal ? "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" : "min-h-screen bg-[#121212] flex items-center justify-center p-4"}>
            <div className={containerClasses}>
                {isModal && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                )}

                {/* Left Side: Branding & Visuals (Only visible in Modal mode or large screens) */}
                <div className={`hidden md:flex w-1/2 relative bg-gradient-to-br from-emerald-900/40 via-[#1a1a1a] to-black items-center justify-center overflow-hidden border-r border-white/5`}>
                    {/* Background Elements */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent"></div>

                    <div className="relative z-10 flex flex-col items-center text-center p-8 animate-slide-up">
                        <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-white/20 shadow-lg shadow-emerald-500/20">
                            <Bot size={40} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Sarvam AI</h2>
                        <p className="text-gray-400 text-sm max-w-[250px] leading-relaxed">
                            Experience the power of multilingual conversations with advanced Indian AI contextual awareness.
                        </p>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className={`${isModal ? 'w-full md:w-1/2' : 'w-full'} flex flex-col justify-center p-10 md:p-16 relative bg-[#1a1a1a]`}>

                    <div className="mb-8 md:text-left">
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                            Welcome
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Unlock the full potential of Sarvam AI.
                        </p>
                    </div>

                    {/* Features List */}
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                <Check size={16} className="text-emerald-500" />
                            </div>
                            <span>Unlimited multilingual conversations</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                <Check size={16} className="text-emerald-500" />
                            </div>
                            <span>Voice interaction in 10+ languages</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                <Check size={16} className="text-emerald-500" />
                            </div>
                            <span>Save and sync your chat history</span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-400 text-xs animate-shake">
                            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Google Login */}
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full h-14 bg-white text-black hover:bg-gray-100 rounded-2xl font-semibold text-[15px] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-white/5 border border-transparent hover:border-gray-200"
                    >
                        <Chrome size={22} />
                        Continue with Google
                    </button>

                    <p className="text-xs text-gray-600 text-center mt-8">
                        By continuing, you verify that you are you.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
