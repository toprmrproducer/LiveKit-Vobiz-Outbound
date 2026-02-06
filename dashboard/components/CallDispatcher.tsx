"use client";

import { useState } from 'react';
import { Phone, MessageSquare, Loader2, Sparkles } from 'lucide-react';

export default function CallDispatcher() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [prompt, setPrompt] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleDispatch = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        const form = e.target as HTMLFormElement;
        const modelProvider = (form.elements.namedItem('modelProvider') as HTMLSelectElement).value;
        const voice = (form.elements.namedItem('voice') as HTMLSelectElement).value;

        try {
            const res = await fetch('/api/dispatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber, prompt, modelProvider, voice }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(`Call dispatched to ${phoneNumber}`);
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to dispatch call');
            }
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Network error');
        }
    };

    return (
        <div className="relative group max-w-md w-full">
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 blur-lg animate-tilt"></div>

            <div className="relative p-8 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Deploy Agent
                    </h2>
                    <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                </div>

                <form onSubmit={handleDispatch} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
                            <Phone className="w-4 h-4" /> Phone Number
                        </label>
                        <input
                            type="tel"
                            placeholder="+919876543210"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-600 outline-none transition-all duration-300"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Context / Prompt
                        </label>
                        <textarea
                            placeholder="e.g. You are calling regarding a coffee order..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-600 outline-none transition-all duration-300 h-28 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Model provider</label>
                            <select
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                                name="modelProvider"
                                defaultValue="openai"
                            >
                                <option value="openai">OpenAI (GPT-4o)</option>
                                <option value="groq">Groq (Llama 3)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Voice</label>
                            <select
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500"
                                name="voice"
                                defaultValue="alloy"
                            >
                                <option value="alloy">Alloy (US)</option>
                                <option value="echo">Echo (US)</option>
                                <option value="shimmer">Shimmer (US)</option>
                                <option value="anushka">Anushka (Indian - Sarvam)</option>
                                <option value="aravind">Aravind (Indian - Sarvam)</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {status === 'loading' ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Dispatching...
                            </>
                        ) : (
                            'Initiate Call'
                        )}
                    </button>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm text-center border animate-in fade-in slide-in-from-bottom-2 ${status === 'success' ? 'bg-green-500/10 text-green-200 border-green-500/20' : 'bg-red-500/10 text-red-200 border-red-500/20'}`}>
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
