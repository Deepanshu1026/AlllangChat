import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PanelLeftClose, PanelLeft, Plus, MessageSquare, Trash2 } from 'lucide-react';

export default function Sidebar({ conversations, currentConversation, onNewChat, onSelectConversation, onDeleteConversation }) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(true);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-3 left-3 z-50 p-2.5 rounded-lg bg-[#2f2f2f] hover:bg-[#3a3a3a] text-white border border-white/10 transition-colors shadow-lg"
                aria-label="Open sidebar"
            >
                <PanelLeft size={20} />
            </button>
        );
    }

    return (
        <aside className="w-64 bg-[#171717] h-screen flex flex-col border-r border-white/10 flex-shrink-0">
            {/* Header */}
            <div className="p-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onNewChat}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#2f2f2f] hover:bg-[#3a3a3a] rounded-lg text-white text-sm font-medium transition-colors border border-white/10"
                    >
                        <Plus size={18} />
                        <span>New Chat</span>
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2.5 hover:bg-[#2f2f2f] rounded-lg text-gray-400 hover:text-white transition-colors"
                        aria-label="Close sidebar"
                    >
                        <PanelLeftClose size={18} />
                    </button>
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {conversations.length === 0 ? (
                    <div className="text-gray-500 text-xs text-center mt-8 px-4 leading-relaxed">
                        No conversations yet.<br />Start a new chat!
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => onSelectConversation(conv.id)}
                            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${currentConversation === conv.id
                                    ? 'bg-[#2f2f2f] text-white'
                                    : 'text-gray-400 hover:bg-[#2a2a2a] hover:text-white'
                                }`}
                        >
                            <MessageSquare size={16} className="flex-shrink-0" />
                            <span className="flex-1 text-sm truncate leading-tight">{conv.title}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteConversation(conv.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded transition-all flex-shrink-0"
                                aria-label="Delete conversation"
                            >
                                <Trash2 size={14} className="text-red-400" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
                <div className="text-xs text-gray-500 text-center">
                    Powered by <span className="text-emerald-500 font-medium">Sarvam AI</span>
                </div>
            </div>
        </aside>
    );
}
