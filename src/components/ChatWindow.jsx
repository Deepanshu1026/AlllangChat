import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

const API_KEY = import.meta.env.VITE_SARVAM_API_KEY;

const ChatWindow = () => {
    const { t } = useTranslation();
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
            // Translate any key-based messages to text before sending
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
                            content: "You are a helpful Indian AI assistant. Reply in the same language as the user (English, Hindi, Tamil, Hinglish, etc). Keep your answers helpful, friendly, and concise. Use Indian cultural context where appropriate."
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
                        <Bot size={24} color="#4ade80" />
                        {t('assistant')}
                    </h1>
                    <div className="status">
                        <span className="status-dot"></span>
                        {t('status_online')}
                    </div>
                </div>
                <LanguageSelector />
            </div>

            <div className="messages-area">
                <div className="message assistant">
                    {t('welcome')}
                </div>

                {messages.map((msg) => (
                    <div key={msg.id} className={`message ${msg.sender}`}>
                        {msg.isKey ? t(msg.text) : msg.text}
                        <span className="time">{msg.time}</span>
                    </div>
                ))}

                {isTyping && (
                    <div className="message assistant" style={{ fontStyle: 'italic', opacity: 0.7 }}>
                        {t('ai_typing')}
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
                </div>
                <button
                    className="send-btn"
                    onClick={handleSend}
                    disabled={!inputText.trim() || isTyping}
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
