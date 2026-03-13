import React, { useState } from 'react';
import { X, Send, Share2, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { sendEmail, generateInviteEmailTemplate } from '../services/emailService';

const ShareAccessModal = ({ onClose }) => {
    const { currentUser, userData } = useAuth();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!currentUser || !userData || userData.plan !== 'pro') {
            setStatus({ type: 'error', message: 'Only Pro users can share access.' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            // 1. Generate unique token
            const token = crypto.randomUUID();

            // 2. Save invitation to Supabase (Database remains the source of truth for verification)
            const { error: dbError } = await supabase
                .from('invitations')
                .insert([
                    {
                        sender_id: currentUser.uid,
                        recipient_email: email,
                        recipient_name: name,
                        token: token,
                        status: 'pending',
                        created_at: new Date().toISOString()
                    }
                ]);

            if (dbError) throw dbError;

            // 3. Call Client-side Email Service (No PHP backend)
            const inviteLink = `${window.location.origin}${window.location.pathname}?inviteToken=${token}`;
            const senderName = currentUser.displayName || currentUser.email;
            const subject = `${senderName} has shared their Pro Access with you!`;
            const htmlContent = generateInviteEmailTemplate(name, senderName, inviteLink);

            const result = await sendEmail(email, name, subject, htmlContent);

            if (result.status) {
                setStatus({ type: 'success', message: `Invitation sent successfully to ${name}!` });
                setEmail('');
                setName('');
            } else {
                throw new Error(result.message || 'Failed to send email');
            }

        } catch (error) {
            console.error('Invite error:', error);
            setStatus({ type: 'error', message: error.message || 'An error occurred. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-gradient-to-r from-emerald-500/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <Share2 className="text-emerald-500" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white leading-tight">Share Pro Access</h2>
                            <p className="text-xs text-gray-500">Invite a friend to use Pro version</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {status.message && (
                        <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 animate-in slide-in-from-top-2 duration-300 ${
                            status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            <p className="text-sm font-medium">{status.message}</p>
                        </div>
                    )}

                    <form onSubmit={handleInvite} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Friend's Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter their name"
                                required
                                className="w-full bg-[#242424] border border-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Friend's Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                                className="w-full bg-[#242424] border border-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Sending Invite...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        <span>Send Invitation</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <p className="text-[10px] text-gray-600 text-center mt-6">
                        They will receive an email with a link to activate their Pro access. <br />
                        No credit card required for them.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShareAccessModal;
