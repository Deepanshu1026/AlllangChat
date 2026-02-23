import React, { useState, useRef, useEffect } from 'react';
import { Cpu, Check, ChevronDown, Sparkles } from 'lucide-react';

export const models = [
    { id: 'sarvam-m', name: 'Sarvam Multilingual (Free)', description: 'Fast & Optimized for Indian languages', icon: <Sparkles size={14} className="text-emerald-500" /> },
    { id: 'sarvam-30b', name: 'Sarvam Balanced', description: 'Stronger reasoning & multilingual support', icon: <Cpu size={14} className="text-blue-500" /> },
    { id: 'sarvam-105b', name: 'Sarvam Advanced', description: 'Flagship model for complex tasks', icon: <Cpu size={14} className="text-purple-500" /> }
];

export default function ModelSelector({ selectedModel, onModelChange, position = 'bottom' }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentModel = models.find(m => m.id === selectedModel) || models[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
                title="Change AI Model"
            >
                <div className="flex items-center justify-center border border-current rounded-md w-6 h-6 p-0.5">
                    {currentModel.icon}
                </div>
                <ChevronDown size={12} className={`transition-transform opacity-50 group-hover:opacity-100 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div
                    className={`absolute ${position === 'top' ? 'bottom-full mb-3' : 'top-full mt-3'} left-0 w-64 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-${position === 'top' ? 'bottom' : 'top'}-2 duration-200 backdrop-blur-xl`}
                >
                    <div className="p-3 border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4">
                        Model Configuration
                    </div>
                    <div className="py-1">
                        {models.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => {
                                    onModelChange(model.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors text-left ${selectedModel === model.id
                                    ? 'bg-emerald-600/10 text-white'
                                    : 'text-gray-300 hover:bg-white/5'
                                    }`}
                            >
                                <div className="mt-0.5">{model.icon}</div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium flex items-center justify-between">
                                        {model.name}
                                        {selectedModel === model.id && <Check size={14} className="text-emerald-500" />}
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-normal mt-0.5">
                                        {model.description}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
