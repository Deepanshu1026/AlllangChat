import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bot, Mail, Lock, Chrome, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const Login = ({ onClose, isModal = false }) => {
    const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await loginWithEmail(email, password);
            } else {
                await signupWithEmail(email, password);
            }
            if (onClose) onClose();
        } catch (err) {
            let msg = err.message.replace('Firebase: ', '');
            if (msg.includes('auth/operation-not-allowed')) {
                msg = 'Please enable Email/Password or Google sign-in in your Firebase Console.';
            }
            setError(msg);
        }

        setLoading(false);
    };

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
        ? "relative w-full max-w-md bg-[#2f2f2f] rounded-3xl p-6 shadow-2xl animate-scale-in"
        : "w-full max-w-md animate-fade-in";

    return (
        <div className={isModal ? "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" : "min-h-screen bg-[#212121] flex items-center justify-center p-4"}>
            <div className={containerClasses}>
                {isModal && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        ✕
                    </button>
                )}

                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 shadow-2xl shadow-emerald-900/10 ring-1 ring-white/10">
                        <Bot size={32} className="text-emerald-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-100">
                        {isLogin ? 'Welcome back' : 'Create account'}
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm text-center max-w-xs">
                        {isLogin
                            ? 'Enter your credentials to access your multilingual chat history.'
                            : 'Sign up to start chatting in multiple Indian languages.'}
                    </p>
                </div>

                {/* Card Content - Removed outer card div if isModal to avoid double padding */}
                <div className={isModal ? "" : "bg-[#2f2f2f] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl"}>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm animate-shake">
                            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Google Login */}
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full h-12 bg-white text-gray-900 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-gray-100 transition-all active:scale-[0.98] mb-6"
                    >
                        <Chrome size={20} />
                        Continue with Google
                    </button>

                    <div className="relative flex items-center gap-4 mb-6">
                        <div className="h-px bg-white/10 flex-1"></div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Or continue with email</span>
                        <div className="h-px bg-white/10 flex-1"></div>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 ml-1">Email address</label>
                            <div className="relative group">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-12 bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 ml-1">Password</label>
                            <div className="relative group">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-12 bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/20 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            {isLogin
                                ? "Don't have an account? Sign up"
                                : "Already have an account? Sign in"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
