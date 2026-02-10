"use client";

import {
    LiveKitRoom,
    RoomAudioRenderer,
    StartAudio,
    useConnectionState,
    useVoiceAssistant,
    BarVisualizer,
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import { Mic, MicOff, X, Phone } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import "@livekit/components-styles";

export default function VoiceWidget() {
    const [token, setToken] = useState<string>("");
    const [url, setUrl] = useState<string>("");
    const [isOpen, setIsOpen] = useState(false);

    // Fetch token when widget is opened
    useEffect(() => {
        if (isOpen && !token) {
            (async () => {
                try {
                    const resp = await fetch("/api/token");
                    const data = await resp.json();
                    setToken(data.accessToken);
                    setUrl(data.url);
                } catch (e) {
                    console.error(e);
                }
            })();
        }
    }, [isOpen]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all hover:scale-105 z-50 flex items-center gap-2"
            >
                <Mic className="w-6 h-6" />
                <span className="font-semibold hidden md:inline">Talk to AI</span>
            </button>
        );
    }

    if (!token) {
        return (
            <div className="fixed bottom-4 right-4 w-80 h-96 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 z-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <LiveKitRoom
            token={token}
            serverUrl={url}
            connect={true}
            audio={true}
            video={false}
            className="fixed bottom-4 right-4 w-80 h-96 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 z-50 overflow-hidden flex flex-col"
            onDisconnected={() => setIsOpen(false)}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-sm">AI Assistant</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 relative">
                <RoomAudioRenderer />
                <StartAudio label="Click to allow audio" />

                <AgentVisualizer />
                <Controls />
            </div>

            {/* Footer / Branding */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 text-center text-xs text-zinc-400">
                Powered by Vobiz AI
            </div>

        </LiveKitRoom>
    );
}

function AgentVisualizer() {
    const { state, audioTrack } = useVoiceAssistant();
    return (
        <div className="w-full h-32 flex items-center justify-center">
            <BarVisualizer
                state={state}
                barCount={5}
                trackRef={audioTrack}
                className="h-32 w-full"
                options={{ minHeight: 20 }}
            />
        </div>
    )
}

function Controls() {
    const { state, audioTrack } = useVoiceAssistant();
    const connectionState = useConnectionState();
    const [isMuted, setIsMuted] = useState(false);

    const toggleMute = useCallback(() => {
        if (audioTrack?.publication) {
            const muted = !audioTrack.publication.isMuted;
            // audioTrack.publication.setMuted(muted); // This might need local participant logic
            // For simplicity in this widget we just track state, actual mute logic depends on track type
            // But LiveKit VoiceAssistant hook manages a lot. 
            // Let's use a simple disconnect for now as the main action.
        }
    }, [audioTrack]);

    // Check if connected
    if (connectionState !== ConnectionState.Connected) {
        return (
            <div className="text-sm text-zinc-500">Connecting...</div>
        )
    }

    return (
        <div className="flex items-center gap-4">
            {/* 
            <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-full ${isMuted ? 'bg-red-100 text-red-600' : 'bg-zinc-100 text-zinc-900'}`}
            >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            */}
            <div className="text-zinc-500 text-sm animate-pulse">
                Listening...
            </div>
        </div>
    )
}
