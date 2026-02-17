import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector, { languages } from './LanguageSelector';

const API_KEY = import.meta.env.VITE_SARVAM_API_KEY;

const ChatWindow = () => {
    const { t, i18n } = useTranslation();
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: 'message_1',
            isKey: true,
            sender: 'assistant',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isTyping]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const newId = Date.now();
        const newMessage = {
            id: newId,
            text: inputText,
            isKey: false,
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newMessage]);
        setInputText('');
        setIsTyping(true);

        try {
            // Prepare history for context
            const history = messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.isKey ? t(msg.text) : msg.text
            }));

            // Add the new user message to history payload
            history.push({ role: "user", content: newMessage.text });

            // Validate history for API
            let apiMessages = history.slice(-10);
            while (apiMessages.length > 0 && apiMessages[0].role !== 'user') {
                apiMessages.shift();
            }

            // Determine target language for AI response
            const currentLangCode = i18n.language || 'en';
            const langObj = languages.find(l => currentLangCode.startsWith(l.code));
            const targetLanguage = langObj ? langObj.name : "English";

            const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-subscription-key': API_KEY, // Primary for Sarvam
                    'Authorization': `Bearer ${API_KEY}` // Fallback for OpenAI compatibility
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

            let botText = "Maaf kijiye, main abhi busy hoon. (Connection Error)";
            if (data.choices && data.choices[0] && data.choices[0].message) {
                botText = data.choices[0].message.content;
            } else if (data.error) {
                console.error("API Error:", data.error);
                botText = "Error: " + (data.error.message || "Unknown error");
            }

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: botText,
                isKey: false,
                sender: 'assistant',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);

        } catch (error) {
            console.error("Request Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Network error connecting to Sarvam AI.",
                isKey: false,
                sender: 'assistant',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <div className="brand">
                    <h1>
                        Sarvam 2B <span style={{ opacity: 0.5, fontSize: '0.9em' }}>Multilingual</span>
                    </h1>
                </div>
                <LanguageSelector />
            </div>

            <div className="messages-area">
                {/* Welcome Message as a standard message */}
                <div className="message-wrapper assistant">
                    <div className="message-avatar">
                        <Bot size={18} />
                    </div>
                    <div className="message-content">
                        <div className="user-name">Sarvam AI</div>
                        {t('welcome')}
                    </div>
                </div>

                {messages.map((msg) => (
                    <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                        <div className="message-avatar">
                            {msg.sender === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                        </div>
                        <div className="message-content">
                            <div className="user-name">{msg.sender === 'assistant' ? 'Sarvam AI' : 'You'}</div>
                            {msg.isKey ? t(msg.text) : msg.text}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="message-wrapper assistant">
                        <div className="message-avatar">
                            <Bot size={18} />
                        </div>
                        <div className="typing-indicator">
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
                <div className="input-wrapper">
                    <input
                        type="text"
                        className="chat-input"
                        placeholder={t('placeholder')}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button
                        className="send-btn"
                        onClick={handleSend}
                        disabled={!inputText.trim() || isTyping}
                    >
                        <Send size={16} />
                    </button>
                    <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#888', marginTop: '12px' }}>
                        AI can make mistakes. Check important info.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
