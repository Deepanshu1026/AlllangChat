import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PanelLeftClose, PanelLeft, Plus, MessageSquare, Trash2, Settings, LogOut, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ShareAccessModal from './ShareAccessModal';

export default function Sidebar({ conversations, currentConversation, onNewChat, onSelectConversation, onDeleteConversation }) {
    const { t } = useTranslation();
    const { currentUser, logout, userData } = useAuth();
    const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showShareModal, setShowShareModal] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <>
            {/* Floating Toggle Button (Visible when Sidebar is closed) */}
            <div
                className={`fixed left-3 z-50 transition-all duration-300 ease-in-out ${!isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'
                    }`}
                style={{ top: 'calc(var(--sat) + 0.75rem)' }}
            >
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2.5 rounded-xl bg-[#212121] active:bg-[#2f2f2f] text-gray-300 active:text-white border border-white/5 shadow-2xl transition-all active:scale-90 group"
                    aria-label="Open sidebar"
                >
                    <PanelLeft size={20} className="group-active:text-emerald-400 transition-colors" />
                </button>
            </div>

            {/* Sidebar Container */}
            <aside
                className={`
                    h-[100svh] bg-[#171717] flex flex-col border-r border-white/5 flex-shrink-0 
                    transition-[width,opacity,transform] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
                    ${isOpen ? 'w-[260px] opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-10 overflow-hidden'}
                    ${isMobile && isOpen ? 'fixed inset-y-0 left-0 z-[60] w-[85%] max-w-[300px] shadow-2xl' : 'relative'}
                `}
                style={{ paddingTop: 'var(--sat)', paddingBottom: 'var(--sab)' }}
            >
                {/* Header Section */}
                <div className={`p-3 pb-0 opacity-100 transition-opacity duration-300 delay-100 ${!isOpen && 'opacity-0'}`}>
                    <div className="flex items-center gap-2 mb-6">
                        {/* Close Sidebar Trigger */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-[#2f2f2f] rounded-lg text-gray-400 hover:text-white transition-colors active:scale-95"
                            title="Close sidebar"
                        >
                            <PanelLeftClose size={20} />
                        </button>

                        {/* New Chat Button */}
                        <button
                            onClick={() => {
                                onNewChat();
                                if (isMobile) setIsOpen(false);
                            }}
                            className="flex-1 flex items-center justify-start gap-2 px-3 py-2 bg-transparent hover:bg-[#2f2f2f] rounded-lg text-white text-sm font-medium transition-colors border border-white/10 hover:border-white/20 active:scale-[0.98]"
                        >
                            <Plus size={16} className="text-emerald-500" />
                            <span>New chat</span>
                        </button>
                    </div>

                    <div className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex justify-between items-center group">
                        <span>Recent</span>
                    </div>
                </div>

                {/* Conversations List */}
                <div className={`flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent opacity-100 transition-opacity duration-300 ${!isOpen && 'opacity-0'}`}>
                    <div className="flex flex-col gap-1">
                        {conversations.length === 0 ? (
                            <div className="text-gray-600 text-xs text-center mt-10 px-4 leading-relaxed font-light italic">
                                Your conversations will appear here.
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    onClick={() => {
                                        onSelectConversation(conv.id);
                                        if (isMobile) setIsOpen(false);
                                    }}
                                    className={`group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 ${currentConversation === conv.id
                                        ? 'bg-[#2f2f2f] text-white shadow-sm translate-x-1'
                                        : 'text-gray-400 hover:bg-[#212121] hover:text-emerald-50 hover:translate-x-1'
                                        }`}
                                >
                                    <MessageSquare size={16} className={`flex-shrink-0 transition-colors ${currentConversation === conv.id ? 'text-emerald-500' : 'text-gray-600 group-hover:text-emerald-500/70'}`} />
                                    <span className="flex-1 text-sm truncate leading-tight font-light transition-all whitespace-nowrap pr-8">
                                        {conv.title}
                                    </span>

                                    {/* Hover Gradient Overlay */}
                                    <div className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l ${currentConversation === conv.id ? 'from-[#2f2f2f]' : 'from-[#171717] group-hover:from-[#212121]'} to-transparent pointer-events-none`} />

                                    {/* Delete - Only visible on hover/active */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteConversation(conv.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 absolute right-2 p-1.5 hover:bg-[#3a3a3a] rounded-md transition-all active:scale-90 z-10"
                                        title="Delete chat"
                                    >
                                        <Trash2 size={14} className="text-gray-500 hover:text-red-400" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Share Pro Access Button (Pro Only) */}
                {userData?.plan === 'pro' && (
                    <div className={`px-3 mb-2 opacity-100 transition-opacity duration-300 ${!isOpen && 'opacity-0'}`}>
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500 rounded-lg text-emerald-500 hover:text-white text-xs font-bold transition-all border border-emerald-500/20 active:scale-95"
                        >
                            <Share2 size={14} />
                            <span>Share Pro Access</span>
                        </button>
                    </div>
                )}

                {/* Footer User Profile */}
                <div className={`p-3 border-t border-white/5 mt-auto bg-[#171717] z-10 transition-opacity duration-300 ${!isOpen && 'opacity-0'}`}>
                    <div className="flex items-center gap-2 group">
                        {currentUser?.photoURL ? (
                            <img
                                src={currentUser.photoURL}
                                alt="Profile"
                                className="w-8 h-8 rounded-full object-cover shadow-lg ring-2 ring-transparent group-hover:ring-white/10 transition-all"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold shadow-lg ring-2 ring-transparent group-hover:ring-white/10 transition-all">
                                {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        )}
                        <div className="flex-1 text-left min-w-0">
                            <div className="text-xs font-medium text-gray-200 group-hover:text-white truncate">
                                {currentUser?.email || 'Guest'}
                            </div>
                            <div className="text-[10px] text-emerald-500 font-medium">Synced</div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-1.5 hover:bg-white/10 rounded-md text-gray-500 hover:text-red-400 transition-colors"
                            title="Sign out"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Share Access Modal */}
            {showShareModal && (
                <ShareAccessModal onClose={() => setShowShareModal(false)} />
            )}

            {/* Mobile Overlay */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
