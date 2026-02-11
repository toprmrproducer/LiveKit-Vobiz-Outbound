
"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Key, Phone, MessageSquare, Globe } from "lucide-react";

enum ConfigKey {
    LIVEKIT_URL = "LIVEKIT_URL",
    LIVEKIT_API_KEY = "LIVEKIT_API_KEY",
    LIVEKIT_API_SECRET = "LIVEKIT_API_SECRET",
    SIP_TRUNK_ID = "SIP_TRUNK_ID",
    OPENAI_API_KEY = "OPENAI_API_KEY",
    SYSTEM_PROMPT = "SYSTEM_PROMPT",
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null); // Key being saved

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings");
            const data = await res.json();
            setSettings(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key: string, value: string) => {
        setSaving(key);
        try {
            await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key, value }),
            });
            // Verification fetch
            // await fetchSettings(); 
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-white">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                        Agent Configuration
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Configure your Voice Agent's brain and connections. These settings are applied immediately to new calls.
                    </p>
                </div>

                {/* LiveKit Section */}
                <section className="space-y-6">
                    <div className="flex items-center space-x-2 text-blue-400 border-b border-gray-800 pb-2">
                        <Globe className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">LiveKit Connection</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        <SettingInput
                            label="LiveKit URL (WSS)"
                            configKey={ConfigKey.LIVEKIT_URL}
                            value={settings[ConfigKey.LIVEKIT_URL]}
                            onSave={handleSave}
                            saving={saving === ConfigKey.LIVEKIT_URL}
                            placeholder="wss://..."
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SettingInput
                                label="API Key"
                                configKey={ConfigKey.LIVEKIT_API_KEY}
                                value={settings[ConfigKey.LIVEKIT_API_KEY]}
                                onSave={handleSave}
                                saving={saving === ConfigKey.LIVEKIT_API_KEY}
                                type="password"
                            />
                            <SettingInput
                                label="API Secret"
                                configKey={ConfigKey.LIVEKIT_API_SECRET}
                                value={settings[ConfigKey.LIVEKIT_API_SECRET]}
                                onSave={handleSave}
                                saving={saving === ConfigKey.LIVEKIT_API_SECRET}
                                type="password"
                            />
                        </div>
                    </div>
                </section>

                {/* Telephony Section */}
                <section className="space-y-6">
                    <div className="flex items-center space-x-2 text-green-400 border-b border-gray-800 pb-2">
                        <Phone className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Telephony (SIP)</h2>
                    </div>
                    <SettingInput
                        label="Vobiz SIP Trunk ID"
                        configKey={ConfigKey.SIP_TRUNK_ID}
                        value={settings[ConfigKey.SIP_TRUNK_ID]}
                        onSave={handleSave}
                        saving={saving === ConfigKey.SIP_TRUNK_ID}
                        placeholder="ST_..."
                    />
                </section>

                {/* AI Models Section */}
                <section className="space-y-6">
                    <div className="flex items-center space-x-2 text-purple-400 border-b border-gray-800 pb-2">
                        <Key className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">AI Models</h2>
                    </div>
                    <SettingInput
                        label="OpenAI / Groq API Key"
                        configKey={ConfigKey.OPENAI_API_KEY}
                        value={settings[ConfigKey.OPENAI_API_KEY]}
                        onSave={handleSave}
                        saving={saving === ConfigKey.OPENAI_API_KEY}
                        type="password"
                    />
                </section>

                {/* Prompt Section */}
                <section className="space-y-6">
                    <div className="flex items-center space-x-2 text-yellow-400 border-b border-gray-800 pb-2">
                        <MessageSquare className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Agent Persona</h2>
                    </div>
                    <SettingTextArea
                        label="System Prompt"
                        configKey={ConfigKey.SYSTEM_PROMPT}
                        value={settings[ConfigKey.SYSTEM_PROMPT]}
                        onSave={handleSave}
                        saving={saving === ConfigKey.SYSTEM_PROMPT}
                    />
                </section>

            </div>
        </div>
    );
}

function SettingInput({ label, configKey, value, onSave, saving, type = "text", placeholder }: any) {
    const [localValue, setLocalValue] = useState(value || "");
    const [changed, setChanged] = useState(false);

    // Sync from parent if not editing? Actually parent fetch might overwrite
    // Simple approach: Init state, allowing local edit

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">{label}</label>
            <div className="flex space-x-2">
                <input
                    type={type}
                    value={localValue}
                    placeholder={placeholder}
                    onChange={(e) => {
                        setLocalValue(e.target.value);
                        setChanged(e.target.value !== (value || ""));
                    }}
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <button
                    onClick={() => {
                        onSave(configKey, localValue);
                        setChanged(false);
                    }}
                    disabled={!changed && !saving}
                    className={`px-4 py-2 rounded-lg flex items-center justify-center transition-all ${changed
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-gray-800 text-gray-500 cursor-not-allowed"
                        }`}
                >
                    {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                </button>
            </div>
        </div>
    )
}

function SettingTextArea({ label, configKey, value, onSave, saving }: any) {
    const [localValue, setLocalValue] = useState(value || "");
    const [changed, setChanged] = useState(false);

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">{label}</label>
            <div className="flex flex-col space-y-2">
                <textarea
                    value={localValue}
                    onChange={(e) => {
                        setLocalValue(e.target.value);
                        setChanged(e.target.value !== (value || ""));
                    }}
                    rows={8}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                />
                <div className="flex justify-end">
                    <button
                        onClick={() => {
                            onSave(configKey, localValue);
                            setChanged(false);
                        }}
                        disabled={!changed && !saving}
                        className={`px-6 py-2 rounded-lg flex items-center justify-center transition-all ${changed
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "bg-gray-800 text-gray-500 cursor-not-allowed"
                            }`}
                    >
                        {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <div className="flex items-center space-x-2"><Save className="h-4 w-4" /><span>Save Prompt</span></div>}
                    </button>
                </div>
            </div>
        </div>
    )
}
