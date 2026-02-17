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
                className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white"
            >
                <PanelLeft size={20} />
            </button>
        );
    }

    return (
        <div className="w-64 bg-gray-900 h-screen flex flex-col border-r border-gray-800">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <button
                    onClick={onNewChat}
                    className="flex-1 flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm font-medium transition-colors"
                >
                    <Plus size={18} />
                    New Chat
                </button>
                <button
                    onClick={() => setIsOpen(false)}
                    className="ml-2 p-2 hover:bg-gray-800 rounded-lg text-gray-400"
                >
                    <PanelLeftClose size={18} />
                </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-2">
                {conversations.length === 0 ? (
                    <div className="text-gray-500 text-sm text-center mt-8 px-4">
                        No conversations yet. Start a new chat!
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => onSelectConversation(conv.id)}
                            className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer mb-1 transition-colors ${currentConversation === conv.id
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-400 hover:bg-gray-800/50'
                                }`}
                        >
                            <MessageSquare size={16} className="flex-shrink-0" />
                            <span className="flex-1 text-sm truncate">{conv.title}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteConversation(conv.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-opacity"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
                Powered by Sarvam AI
            </div>
        </div>
    );
}
