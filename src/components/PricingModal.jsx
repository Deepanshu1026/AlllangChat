import React, { useState } from 'react';
import { X, Check, Sparkles, Zap, Shield, Rocket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

const PricingModal = ({ onClose }) => {
    const { currentUser, userData, fetchUserData } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubscription = async (planType) => {
        if (!currentUser) return;
        setLoading(true);

        try {
            // In a real production app, you would:
            // 1. Call your backend to create a Razorpay Order
            // 2. Get the order_id
            // For this test implementation, we'll simulate the order creation or use a direct payment if allowed

            const options = {
                key: RAZORPAY_KEY_ID,
                amount: planType === 'pro' ? 49900 : 0, // 499 INR in paise
                currency: "INR",
                name: "Sensiq AI",
                description: `${planType === 'pro' ? 'Pro' : 'Free'} Subscription Plan`,
                image: "https://your-logo-url.com/logo.png",
                handler: async function (response) {
                    // Payment successful
                    console.log("Payment Success:", response);

                    // Update user plan in Supabase
                    const { error } = await supabase
                        .from('users')
                        .update({
                            plan: 'pro',
                            usage_limit: 999999, // Unlimited
                            subscription_status: 'active'
                        })
                        .eq('id', currentUser.uid);

                    if (error) {
                        alert("Error updating subscription. Please contact support.");
                    } else {
                        await fetchUserData();
                        onClose();
                        alert("Welcome to Sensiq Pro!");
                    }
                },
                prefill: {
                    name: currentUser.displayName || "",
                    email: currentUser.email || "",
                },
                theme: {
                    color: "#10b981", // emerald-500
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                alert("Payment Failed: " + response.error.description);
            });
            rzp.open();
        } catch (error) {
            console.error("Subscription error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-4xl bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col md:flex-row h-full">
                    {/* Left Side: Info */}
                    <div className="flex-1 p-8 md:p-12 bg-gradient-to-br from-[#121212] to-[#1a1a1a] border-b md:border-b-0 md:border-r border-white/5">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <Sparkles className="text-emerald-500" size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Upgrade to Pro</h2>
                        </div>

                        <p className="text-gray-400 mb-8 leading-relaxed">
                            Experience the full potential of Sensiq AI with unlimited queries, priority support, and upcoming multimodal capabilities.
                        </p>

                        <div className="space-y-6">
                            {[
                                { icon: <Rocket size={20} />, title: "Unlimited Queries", desc: "No daily limits on your conversations." },
                                { icon: <Zap size={20} />, title: "Faster Responses", desc: "Priority access to high-compute models." },
                                { icon: <Shield size={20} />, title: "Privacy First", desc: "Advanced data encryption and no data training." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="mt-1 text-emerald-500">{item.icon}</div>
                                    <div>
                                        <h4 className="text-white font-medium">{item.title}</h4>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: Plans */}
                    <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                        <div className="mb-8">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold mb-4">
                                BEST VALUE
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-extrabold text-white">₹499</span>
                                <span className="text-gray-500">/month</span>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">Special introductory price for 12 months.</p>
                        </div>

                        <div className="space-y-4 mb-8">
                            {["Unlimited Indian LLM Access", "Image-to-Context Processing", "Custom System Prompts", "Early Beta Access"].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <Check size={12} className="text-emerald-500" />
                                    </div>
                                    <span className="text-gray-300 text-sm">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handleSubscription('pro')}
                            disabled={loading}
                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? "Processing..." : "Upgrade Now"}
                            {!loading && <Rocket size={18} />}
                        </button>

                        <p className="text-center text-[10px] text-gray-500 mt-6 mt-auto">
                            Secure payment via Razorpay. Cancel anytime. <br />
                            Taxes included where applicable.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingModal;
