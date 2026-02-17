import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector, { languages } from './LanguageSelector';
import Sidebar from './Sidebar';

const API_KEY = import.meta.env.VITE_SARVAM_API_KEY;

const ChatWindow = () => {
    const { t, i18n } = useTranslation();

    // Conversation management
    const [conversations, setConversations] = useState(() => {
        const saved = localStorage.getItem('conversations');
        return saved ? JSON.parse(saved) : [];
    });
    const [currentConversationId, setCurrentConversationId] = useState(null);

    // Current chat state
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Save conversations to localStorage
    useEffect(() => {
        localStorage.setItem('conversations', JSON.stringify(conversations));
    }, [conversations]);

    // Load current conversation messages
    useEffect(() => {
        if (currentConversationId) {
            const conv = conversations.find(c => c.id === currentConversationId);
            if (conv) {
                setMessages(conv.messages || []);
            }
        } else {
            setMessages([]);
        }
    }, [currentConversationId, conversations]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isTyping]);

    const handleNewChat = () => {
        const newConv = {
            id: Date.now().toString(),
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString()
        };
        setConversations(prev => [newConv, ...prev]);
        setCurrentConversationId(newConv.id);
        setMessages([]);
    };

    const handleSelectConversation = (id) => {
        setCurrentConversationId(id);
    };

    const handleDeleteConversation = (id) => {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (currentConversationId === id) {
            setCurrentConversationId(null);
        }
    };

    const updateConversationTitle = (convId, firstMessage) => {
        setConversations(prev => prev.map(conv => {
            if (conv.id === convId && conv.title === 'New Chat') {
                return {
                    ...conv,
                    title: firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : '')
                };
            }
            return conv;
        }));
    };

    const updateConversationMessages = (convId, newMessages) => {
        setConversations(prev => prev.map(conv => {
            if (conv.id === convId) {
                return { ...conv, messages: newMessages };
            }
            return conv;
        }));
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        // Create new conversation if none selected
        let convId = currentConversationId;
        if (!convId) {
            const newConv = {
                id: Date.now().toString(),
                title: 'New Chat',
                messages: [],
                createdAt: new Date().toISOString()
            };
            setConversations(prev => [newConv, ...prev]);
            convId = newConv.id;
            setCurrentConversationId(convId);
        }

        const newMessage = {
            id: Date.now(),
            text: inputText,
            isKey: false,
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        updateConversationMessages(convId, updatedMessages);

        // Update title if first message
        if (messages.length === 0) {
            updateConversationTitle(convId, inputText);
        }

        setInputText('');
        setIsTyping(true);

        try {
            const history = updatedMessages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.isKey ? t(msg.text) : msg.text
            }));

            let apiMessages = history.slice(-10);
            while (apiMessages.length > 0 && apiMessages[0].role !== 'user') {
                apiMessages.shift();
            }

            const currentLangCode = i18n.language || 'en';
            const langObj = languages.find(l => currentLangCode.startsWith(l.code));
            const targetLanguage = langObj ? langObj.name : "English";

            const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-subscription-key': API_KEY,
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "sarvam-m",
                    messages: [
                        {
                            role: "system",
                            content: `You are a helpful Indian AI assistant. Reply in ${targetLanguage}. Keep your answers helpful, friendly, and concise. Use Indian cultural context where appropriate in ${targetLanguage}.`
                        },
                        ...apiMessages
                    ],
                    max_tokens: 300,
                    temperature: 0.7
                })
            });

            const data = await response.json();

            let botText = "Sorry, I couldn't process that.";
            if (data.choices && data.choices[0] && data.choices[0].message) {
                botText = data.choices[0].message.content;
            } else if (data.error) {
                console.error("API Error:", data.error);
                botText = "Error: " + (data.error.message || "Unknown error");
            }

            const botMessage = {
                id: Date.now() + 1,
                text: botText,
                isKey: false,
                sender: 'assistant',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            const finalMessages = [...updatedMessages, botMessage];
            setMessages(finalMessages);
            updateConversationMessages(convId, finalMessages);

        } catch (error) {
            console.error("Request Error:", error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "Network error connecting to Sarvam AI.",
                isKey: false,
                sender: 'assistant',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            const finalMessages = [...updatedMessages, errorMessage];
            setMessages(finalMessages);
            updateConversationMessages(convId, finalMessages);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex h-screen bg-gray-950">
            <Sidebar
                conversations={conversations}
                currentConversation={currentConversationId}
                onNewChat={handleNewChat}
                onSelectConversation={handleSelectConversation}
                onDeleteConversation={handleDeleteConversation}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="border-b border-gray-800 bg-gray-950 px-6 py-3 flex items-center justify-between">
                    <h1 className="text-lg font-semibold text-white">
                        Sarvam AI <span className="text-sm text-gray-500 font-normal">Multilingual</span>
                    </h1>
                    <LanguageSelector />
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto">
                    {messages.length === 0 && !currentConversationId ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <Bot size={48} className="mx-auto mb-4 text-gray-600" />
                                <h2 className="text-2xl font-semibold text-white mb-2">
                                    {t('welcome')}
                                </h2>
                                <p className="text-gray-500">Start a conversation in any Indian language</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`border-b border-gray-800/50 ${msg.sender === 'assistant' ? 'bg-gray-900/30' : ''
                                        }`}
                                >
                                    <div className="max-w-3xl mx-auto px-6 py-6 flex gap-6">
                                        <div className="flex-shrink-0">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'assistant'
                                                    ? 'bg-emerald-600'
                                                    : 'bg-gray-700'
                                                }`}>
                                                {msg.sender === 'assistant' ? (
                                                    <Bot size={18} className="text-white" />
                                                ) : (
                                                    <User size={18} className="text-white" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <div className="text-sm font-semibold text-white mb-1">
                                                {msg.sender === 'assistant' ? 'Sarvam AI' : 'You'}
                                            </div>
                                            <div className="text-gray-200 whitespace-pre-wrap">
                                                {msg.isKey ? t(msg.text) : msg.text}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="border-b border-gray-800/50 bg-gray-900/30">
                                    <div className="max-w-3xl mx-auto px-6 py-6 flex gap-6">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                                                <Bot size={18} className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <div className="text-sm font-semibold text-white mb-1">Sarvam AI</div>
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-gray-500 rounded-full typing-dot"></div>
                                                <div className="w-2 h-2 bg-gray-500 rounded-full typing-dot"></div>
                                                <div className="w-2 h-2 bg-gray-500 rounded-full typing-dot"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-800 bg-gray-950 p-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="relative">
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={t('placeholder')}
                                rows={1}
                                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-600 placeholder-gray-500"
                                style={{ minHeight: '52px', maxHeight: '200px' }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputText.trim() || isTyping}
                                className={`absolute right-2 bottom-2 p-2 rounded-lg transition-colors ${inputText.trim() && !isTyping
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <p className="text-xs text-gray-600 text-center mt-2">
                            AI can make mistakes. Check important info.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
