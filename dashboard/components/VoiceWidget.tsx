
"use client";

import {
    LiveKitRoom,
    RoomAudioRenderer,
    StartAudio,
    useConnectionState,
    useVoiceAssistant,
    BarVisualizer,
    useLocalParticipant,
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import { Mic, MicOff, Phone, X, MessageSquare } from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import "@livekit/components-styles";

export default function VoiceWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [url, setUrl] = useState<string | null>(null);

    const connect = useCallback(async () => {
        try {
            const resp = await fetch("/api/token");
            const data = await resp.json();
            setToken(data.token);
            setUrl(data.wsUrl);
            setIsOpen(true);
        } catch (e) {
            console.error(e);
        }
    }, []);

    const disconnect = useCallback(() => {
        setIsOpen(false);
        setToken(null);
    }, []);

    useEffect(() => {
        // Notify parent to resize
        if (isOpen) {
            window.parent.postMessage('widget-open', '*');
        } else {
            window.parent.postMessage('widget-close', '*');
        }

        // Check for HTTPS (Microphone permission requirement)
        if (typeof window !== 'undefined' && window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
            console.warn("Voice Widget requires HTTPS for microphone access.");
            // We could show a toast here, but for now console warning is a start.
            // Actually, let's just make sure the user knows via UI if it fails.
        }
    }, [isOpen]);

    if (!isOpen || !token || !url) {
        return (
            <button
                onClick={connect}
                className="fixed bottom-4 right-4 h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all z-50 animate-in fade-in zoom-in duration-300"
            >
                <MessageSquare className="h-6 w-6" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-200 dark:border-gray-800">
            <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                <h3 className="font-semibold">Support Agent</h3>
                <button onClick={disconnect} className="p-1 hover:bg-blue-700 rounded">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <LiveKitRoom
                token={token}
                serverUrl={url}
                connect={true}
                audio={true}
                video={false}
                onDisconnected={disconnect}
                className="flex-1 flex flex-col relative"
            >
                <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-4">
                    <RoomStateDisplay />
                    <div className="h-32 w-full flex items-center justify-center">
                        <BarVisualizer
                            state="speaking"
                            barCount={5}
                            trackRef={undefined}
                            className="h-16 w-full"
                            options={{ minHeight: 20 }}
                        />
                    </div>
                </div>

                <ControlBar onDisconnect={disconnect} />
                <RoomAudioRenderer />
                <StartAudio label="Click to allow audio" />
            </LiveKitRoom>
        </div>
    );
}

function RoomStateDisplay() {
    const { state } = useVoiceAssistant();
    const connectionState = useConnectionState();

    return (
        <div className="text-center space-y-2">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {connectionState === ConnectionState.Connected ? "Connected" : "Connecting..."}
            </div>
            {state === "listening" && <p className="text-blue-500">I'm listening...</p>}
            {state === "thinking" && <p className="text-purple-500">Thinking...</p>}
            {state === "speaking" && <p className="text-green-500">Speaking...</p>}
        </div>
    );
}

function ControlBar({ onDisconnect }: { onDisconnect: () => void }) {
    const { localParticipant } = useConnectionState() === ConnectionState.Connected ? { localParticipant: undefined } : { localParticipant: undefined }; // We need useLocalParticipant hook
    // Better: use useLocalParticipant directly

    // Implementation below
    return <RealControlBar onDisconnect={onDisconnect} />;
}

// Inner component to safely use hooks
function RealControlBar({ onDisconnect }: { onDisconnect: () => void }) {
    const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();

    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 flex justify-center space-x-4">
            <button
                onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
                className={`p-3 rounded-full transition-colors ${!isMicrophoneEnabled ? "bg-red-100 text-red-600" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                    }`}
            >
                {!isMicrophoneEnabled ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <button
                onClick={onDisconnect}
                className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
                <Phone className="h-5 w-5 rotate-135" />
            </button>
        </div>
    );
}
