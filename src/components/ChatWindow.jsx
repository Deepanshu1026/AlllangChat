import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Copy, ArrowUp, Loader2, Mic, MicOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LanguageSelector, { languages } from './LanguageSelector';
import Sidebar from './Sidebar';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const API_KEY = import.meta.env.VITE_SARVAM_API_KEY;

const ChatWindow = () => {
    const { t, i18n } = useTranslation();
    const { currentUser } = useAuth();

    // Conversation management
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const recognitionRef = useRef(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            // Set language based on current i18n language or default to English
            recognitionRef.current.lang = i18n.language || 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputText(prev => prev + (prev ? ' ' : '') + transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [i18n.language]);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            setShowScrollButton(!isNearBottom);
        }
    };

    // Fetch conversations from Supabase
    useEffect(() => {
        const fetchConversations = async () => {
            if (!currentUser) return;
            setLoading(true);

            // Sync user to Supabase users table (idempotent upsert)
            const { error: userError } = await supabase
                .from('users')
                .upsert({
                    id: currentUser.uid,
                    email: currentUser.email
                }, { onConflict: 'id' });

            if (userError) console.error('Error syncing user:', userError);

            const { data, error } = await supabase
                .from('conversations')
                .select('*')
                .eq('user_id', currentUser.uid)
                .order('updated_at', { ascending: false });

            if (error) {
                console.error('Error fetching conversations:', error);
            } else {
                setConversations(data || []);
            }
            setLoading(false);
        };

        fetchConversations();
    }, [currentUser]);

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
        setShowScrollButton(false);
    };

    useEffect(scrollToBottom, [messages, isTyping]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
        }
    }, [inputText]);

    // Auto-focus textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [currentConversationId]);

    const handleNewChat = async () => {
        const newConv = {
            id: crypto.randomUUID(),
            user_id: currentUser.uid,
            title: 'New Chat',
            messages: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // UI Optimistic Update
        setConversations(prev => [newConv, ...prev]);
        setCurrentConversationId(newConv.id);
        setMessages([]);

        const { error } = await supabase
            .from('conversations')
            .insert([newConv]);

        if (error) console.error('Error creating chat:', error);
    };

    const handleSelectConversation = (id) => {
        setCurrentConversationId(id);
    };

    const handleDeleteConversation = async (id) => {
        // UI Optimistic Update
        setConversations(prev => prev.filter(c => c.id !== id));
        if (currentConversationId === id) {
            setCurrentConversationId(null);
            setMessages([]);
        }

        const { error } = await supabase
            .from('conversations')
            .delete()
            .eq('id', id);

        if (error) console.error('Error deleting chat:', error);
    };

    const updateConversationTitle = async (convId, firstMessage) => {
        const newTitle = firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : '');

        setConversations(prev => prev.map(conv => {
            if (conv.id === convId && conv.title === 'New Chat') {
                return { ...conv, title: newTitle };
            }
            return conv;
        }));

        const { error } = await supabase
            .from('conversations')
            .update({ title: newTitle })
            .eq('id', convId);

        if (error) console.error('Error updating title:', error);
    };

    const updateConversationMessages = async (convId, newMessages) => {
        setConversations(prev => prev.map(conv => {
            if (conv.id === convId) {
                return { ...conv, messages: newMessages, updated_at: new Date().toISOString() };
            }
            return conv;
        }));

        const { error } = await supabase
            .from('conversations')
            .update({
                messages: newMessages,
                updated_at: new Date().toISOString()
            })
            .eq('id', convId);

        if (error) console.error('Error updating messages:', error);
    };

    const handleSuggestionClick = (text) => {
        setInputText(text);
    };

    const handleCopyMessage = (text) => {
        navigator.clipboard.writeText(text);
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        let convId = currentConversationId;
        if (!convId) {
            const newConv = {
                id: crypto.randomUUID(),
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
            const targetLanguage = langObj ? langObj.englishName : "English";

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
                            content: `You are a helpful Indian AI assistant. You MUST reply in ${targetLanguage} only. Even if the user asks in English or another language, your response must be in ${targetLanguage}. Keep your answers helpful, friendly, and concise. Use Indian cultural context where appropriate in ${targetLanguage}. Formatting: Use markdown (bold, lists, code blocks) for clarity. IMPORTANT: If providing code, provide the FULL and COMPLETE code without placeholders or truncation.`
                        },
                        ...apiMessages
                    ],
                    max_tokens: 4096,
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
                text: "Network error connecting to Sarvam AI. Please check your internet connection.",
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

    const suggestions = [
        { icon: <Sparkles size={16} />, text: "Draft a tweet about AI" },
        { icon: <Bot size={16} />, text: "Explain quantum computing" },
        { icon: <User size={16} />, text: "Write a poem about rain" },
        { icon: <Sparkles size={16} />, text: "Give me study tips" }
    ];

    const InputArea = (
        <div className="max-w-3xl mx-auto w-full">
            <div className={`relative flex items-end w-full p-3 bg-[#2f2f2f] border rounded-2xl shadow-2xl transition-all duration-300 ${isListening ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-gray-600/30 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500/50 hover:border-gray-500/50'}`}>
                <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={isListening ? "Listening..." : "Message Sarvam AI..."}
                    rows={1}
                    className="w-full max-h-[200px] min-h-[24px] bg-transparent border-0 text-white placeholder-gray-400 focus:ring-0 outline-none resize-none py-2 pr-20 pl-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent text-[15px]"
                    style={{ overflowY: 'auto' }}
                />

                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    {/* Mic Button */}
                    <button
                        onClick={toggleListening}
                        className={`p-1.5 rounded-lg transition-all duration-300 ease-out active:scale-90 ${isListening
                            ? 'bg-red-500/10 text-red-500 animate-pulse'
                            : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                        title="Voice Input"
                    >
                        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>

                    {/* Send Button */}
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim() || isTyping}
                        className={`p-1.5 rounded-lg transition-all duration-300 ease-out active:scale-90 ${inputText.trim() && !isTyping
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 scale-100'
                            : 'bg-transparent text-gray-500 cursor-not-allowed scale-95'
                            }`}
                    >
                        {isTyping ? (
                            <div className="w-4 h-4 rounded-full bg-white animate-pulse" />
                        ) : (
                            <ArrowUp size={20} strokeWidth={2.5} />
                        )}
                    </button>
                </div>
            </div>
            <div className="text-center mt-3 animate-fade-in">
                <p className="text-[11px] text-gray-500">
                    Sarvam AI can make mistakes. Check important info.
                </p>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#212121] overflow-hidden font-sans text-gray-100">
            <Sidebar
                conversations={conversations}
                currentConversation={currentConversationId}
                onNewChat={handleNewChat}
                onSelectConversation={handleSelectConversation}
                onDeleteConversation={handleDeleteConversation}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* ... (header) */}
                <header className="sticky top-0 z-10 border-b border-white/5 bg-[#212121]/80 backdrop-blur-md transition-all duration-300">
                    <div className="flex items-center justify-between h-14 px-4 sm:px-6 pl-14">
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={handleNewChat}>
                            <h1 className="text-lg font-semibold text-gray-200 group-hover:text-white transition-colors duration-200">
                                Sarvam <span className="text-emerald-500">2B</span>
                            </h1>
                        </div>
                        <LanguageSelector />
                    </div>
                </header>

                {/* Messages Area */}
                <main
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto scroll-smooth scrollbar-width-none relative flex flex-col"
                >
                    {messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[500px] animate-fade-in relative overflow-hidden">
                            {/* Background Spotlight */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-emerald-500/5 rounded-full blur-[60px] md:blur-[100px] pointer-events-none" />

                            {/* Logo */}
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-gray-800 to-black rounded-3xl flex items-center justify-center mb-6 md:mb-8 shadow-2xl ring-1 ring-white/10 animate-slide-up relative z-10">
                                <Bot size={40} className="text-white drop-shadow-lg" />
                            </div>

                            {/* Welcome Text */}
                            <h2 className="text-2xl md:text-4xl font-semibold text-white mb-2 text-center tracking-tight animate-slide-up z-10" style={{ animationDelay: '0.1s' }}>
                                Good to See You!
                            </h2>
                            <h3 className="text-xl md:text-3xl font-light text-gray-400 mb-4 text-center animate-slide-up z-10" style={{ animationDelay: '0.2s' }}>
                                How Can I be an <span className="text-emerald-400 font-normal">Assistant?</span>
                            </h3>
                            <p className="text-gray-500 text-xs md:text-sm mb-8 md:mb-12 animate-slide-up z-10 text-center max-w-[80%]" style={{ animationDelay: '0.3s' }}>
                                I'm available 24/7 for you, ask me anything.
                            </p>

                            {/* Status Indicators */}
                            <div className="w-full max-w-2xl px-6 flex justify-between items-center text-[10px] md:text-[11px] text-gray-500 mb-4 opacity-0 animate-fade-in z-10" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
                                <div className="flex items-center gap-2">
                                    <Sparkles size={12} className="text-amber-400" />
                                    <span>Unlock more capabilities</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Active extensions</span>
                                </div>
                            </div>

                            {/* Input Area Wrapper */}
                            <div className="w-full max-w-2xl px-4 relative z-20 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                                <div className={`relative flex items-center w-full p-1.5 md:p-2 bg-[#1a1a1a] border rounded-3xl md:rounded-full shadow-2xl transition-all duration-300 ${isListening ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-white/10 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500/50 hover:border-white/20'}`}>

                                    {/* Plus Button */}
                                    <button className="hidden md:block p-3 mx-1 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                                        <div className="w-5 h-5 flex items-center justify-center border border-current rounded-md overflow-hidden">
                                            <span className="text-lg leading-none mb-0.5">+</span>
                                        </div>
                                    </button>

                                    <div className="hidden md:block h-6 w-[1px] bg-white/10 mx-1" />

                                    <textarea
                                        ref={textareaRef}
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder={isListening ? "Listening..." : "Ask anything..."}
                                        rows={1}
                                        className="flex-1 max-h-[150px] min-h-[24px] bg-transparent border-0 text-white placeholder-gray-500 focus:ring-0 outline-none resize-none py-3 px-3 md:px-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent text-sm md:text-[15px]"
                                        style={{ overflowY: 'auto' }}
                                    />

                                    <div className="flex items-center gap-1 pr-1 md:pr-2">
                                        {/* Mic Button - Audio Wave Style */}
                                        <button
                                            onClick={toggleListening}
                                            className={`p-2.5 rounded-full transition-all duration-300 ${isListening
                                                ? 'bg-red-500 text-white animate-pulse'
                                                : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                                            title="Voice Input"
                                        >
                                            {isListening ? <MicOff size={18} /> : (
                                                <div className="flex items-end gap-[2px] h-4">
                                                    <div className="w-[2px] h-2 bg-current rounded-full" />
                                                    <div className="w-[2px] h-4 bg-current rounded-full" />
                                                    <div className="w-[2px] h-3 bg-current rounded-full" />
                                                    <div className="w-[2px] h-2 bg-current rounded-full" />
                                                </div>
                                            )}
                                        </button>

                                        {/* Send Button */}
                                        <button
                                            onClick={handleSend}
                                            disabled={!inputText.trim() || isTyping}
                                            className={`p-2.5 rounded-full transition-all duration-300 ${inputText.trim() && !isTyping
                                                ? 'bg-white text-black hover:bg-gray-200 scale-100'
                                                : 'bg-transparent text-gray-600 cursor-not-allowed'
                                                }`}
                                        >
                                            <ArrowUp size={18} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Suggestions */}
                            <div className="flex flex-wrap justify-center gap-2 md:gap-3 w-full max-w-3xl px-4 mt-6 md:mt-8 animate-slide-up z-10" style={{ animationDelay: '0.5s' }}>
                                {suggestions.map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSuggestionClick(suggestion.text)}
                                        className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-full border border-white/5 bg-[#1a1a1a] hover:bg-[#252525] hover:border-white/10 transition-all duration-200 text-[11px] md:text-xs text-gray-400 hover:text-white group active:scale-[0.98] shadow-lg"
                                        style={{ animationDelay: `${0.5 + (idx * 0.1)}s` }}
                                    >
                                        <span className="text-emerald-500 group-hover:text-emerald-400 transition-colors">
                                            {suggestion.icon}
                                        </span>
                                        <span className="truncate max-w-[100px] md:max-w-[150px]">{suggestion.text}</span>
                                    </button>
                                ))}
                                <button className="px-3 py-2.5 rounded-full border border-white/5 bg-[#1a1a1a] hover:bg-[#252525] text-gray-400 hover:text-white transition-all">
                                    <span className="text-xs tracking-widest">•••</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="pb-32 pt-4">
                            {messages.map((msg, index) => (
                                <div
                                    key={msg.id}
                                    className={`w-full text-gray-100 border-b border-black/5 dark:border-white/5 animate-fade-in ${msg.sender === 'assistant' ? 'bg-transparent' : 'bg-transparent'}`}
                                >
                                    <div className={`max-w-3xl mx-auto flex gap-4 p-4 md:py-6 lg:px-0 m-auto ${msg.sender === 'user' ? 'justify-end' : ''}`}>

                                        {/* Assistant Avatar - Left Side */}
                                        {msg.sender === 'assistant' && (
                                            <div className="flex-shrink-0 flex flex-col relative items-end">
                                                <div className="w-8 h-8 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600">
                                                    <Bot size={18} className="text-white" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Message Content */}
                                        <div className={`relative overflow-hidden ${msg.sender === 'user' ? 'bg-[#2f2f2f] rounded-2xl px-5 py-3 max-w-[85%]' : 'flex-1'}`}>
                                            {msg.sender === 'assistant' && (
                                                <div className="font-semibold text-sm mb-1 opacity-90 flex items-center gap-2">
                                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 font-bold">Sarvam AI</span>
                                                </div>
                                            )}

                                            <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#0d0d0d] prose-pre:rounded-xl max-w-none text-[15px] prose-strong:text-emerald-400">
                                                {msg.isKey ? (
                                                    <p>{t(msg.text)}</p>
                                                ) : (
                                                    <ReactMarkdown
                                                        children={msg.text}
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            code({ node, className, children, ...props }) {
                                                                const match = /language-(\w+)/.exec(className || '');
                                                                const isBlock = String(children).includes('\n');
                                                                return isBlock ? (
                                                                    <div className="relative my-4 rounded-xl overflow-hidden border border-white/10 shadow-xl bg-[#0d0d0d] group/code">
                                                                        <div className="absolute right-0 top-0 pr-4 pt-4 z-10 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                                                            <button
                                                                                onClick={() => handleCopyMessage(String(children))}
                                                                                className="p-2 bg-gray-700/80 hover:bg-gray-600 rounded-lg text-xs text-gray-200 backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-1.5 transition-all active:scale-95"
                                                                            >
                                                                                <Copy size={14} /> Copy Code
                                                                            </button>
                                                                        </div>
                                                                        {match && (
                                                                            <div className="absolute left-4 top-4 text-xs font-mono text-gray-400 select-none pointer-events-none">
                                                                                {match[1]}
                                                                            </div>
                                                                        )}
                                                                        <pre className="!p-4 !pt-12 !m-0 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700">
                                                                            <code className={className || 'language-text'} {...props}>
                                                                                {children}
                                                                            </code>
                                                                        </pre>
                                                                    </div>
                                                                ) : (
                                                                    <code className="bg-white/10 px-1.5 py-0.5 rounded text-[13px] font-mono text-emerald-400 break-words" {...props}>
                                                                        {children}
                                                                    </code>
                                                                )
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="w-full text-gray-100 border-b border-black/5 dark:border-white/5 bg-[#444654]/0 animate-fade-in">
                                    <div className="max-w-3xl mx-auto flex gap-4 p-4 md:py-6 lg:px-0 m-auto">
                                        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                                            <Loader2 size={18} className="text-white animate-spin" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-sm mb-1 opacity-90 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 font-bold">Sarvam AI</div>
                                            <div className="flex gap-1.5 py-2">
                                                <div className="w-2 h-2 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </main>

                {/* Scroll to Bottom Button */}
                {showScrollButton && (
                    <button
                        onClick={scrollToBottom}
                        className="absolute bottom-24 right-6 z-30 p-2 bg-[#2f2f2f] border border-white/10 rounded-full text-gray-400 hover:text-white shadow-xl hover:bg-[#3a3a3a] transition-all animate-bounce-in"
                        aria-label="Scroll to bottom"
                    >
                        <ArrowUp size={20} />
                    </button>
                )}

                {/* Enhanced Input Area - Only show at bottom if there are messages */}
                {messages.length > 0 && (
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#212121] via-[#212121] to-transparent pt-10 pb-6 px-4 lg:px-0 z-20">
                        {InputArea}
                    </div>
                )}
                <style jsx>{`
                    .scrollbar-width-none::-webkit-scrollbar {
                        display: none;
                    }
                    .scrollbar-width-none {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default ChatWindow;
