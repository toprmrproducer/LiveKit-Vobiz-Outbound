"use client";

import { useState } from 'react';
import { Users, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function BulkDialer() {
    const [input, setInput] = useState('');
    const [prompt, setPrompt] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [results, setResults] = useState<any[]>([]);

    const handleBulkDispatch = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setResults([]);

        // Parse comma or newline separated numbers
        const numbers = input.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);

        if (numbers.length === 0) {
            setStatus('error');
            return;
        }

        try {
            const res = await fetch('/api/queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ numbers, prompt }),
            });

            const data = await res.json();
            setResults(data.results || []);

            if (res.ok) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (err: any) {
            setStatus('error');
        }
    };

    return (
        <div className="relative group max-w-md w-full">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 blur-lg animate-tilt"></div>

            <div className="relative p-8 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400">
                        Bulk Operations
                    </h2>
                    <Users className="w-5 h-5 text-teal-400" />
                </div>

                <form onSubmit={handleBulkDispatch} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
                            <Users className="w-4 h-4" /> Phone Numbers (CSV or Newline)
                        </label>
                        <textarea
                            placeholder="+919876543210&#10;+919988776655&#10;+12125551234"
                            required
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-600 outline-none transition-all duration-300 h-32 resize-none font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500 text-right">Separate by comma or new line</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Campaign Context
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Survey about recent purchase..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-600 outline-none transition-all duration-300"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {status === 'loading' ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Processing Queue...
                            </>
                        ) : (
                            'Launch Campaign'
                        )}
                    </button>

                    {status === 'success' && (
                        <div className="max-h-40 overflow-y-auto space-y-2 mt-4 custom-scrollbar">
                            {results.map((res, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5 text-xs">
                                    <span className="font-mono text-gray-300">{res.phoneNumber}</span>
                                    {res.status === 'dispatched' ? (
                                        <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Sent</span>
                                    ) : (
                                        <span className="text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Failed</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
