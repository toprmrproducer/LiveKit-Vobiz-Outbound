"use client";

import { useEffect, useState, useCallback } from "react";
import { Play, Pause, RefreshCw, Phone, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { useParams } from "next/navigation";

// Types matching our Prisma schema roughly
interface Call {
    id: string;
    phone: string;  // We need to fetch this from Contact relation in real app
    status: string;
    transcript: string | null;
    duration: number | null;
    createdAt: string;
    contact: { phone: string; name: string | null };
}

interface Campaign {
    id: string;
    name: string;
    status: string;
    stats: {
        total: number;
        pending: number;
        completed: number;
        failed: number;
    };
    calls: Call[];
}

export default function CampaignPage() {
    const params = useParams();
    const id = params?.id as string;

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const fetchCampaign = useCallback(async () => {
        try {
            // We need an API to get campaign details. 
            // For now, let's assume we created GET /api/campaigns/[id]
            // Wait, I haven't created that API yet! 
            // I should create it, or use a server component.
            // Let's create the API route in the next step.
            // For this file, I'll write the fetch logic assuming it exists.
            const res = await fetch(`/api/campaigns/${id}`);
            if (res.ok) {
                const data = await res.json();
                setCampaign(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchCampaign();
        const interval = setInterval(fetchCampaign, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [id, fetchCampaign]);

    const handleDispatch = async () => {
        setProcessing(true);
        try {
            await fetch(`/api/campaigns/${id}/dispatch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ batchSize: 10 })
            });
            // Refresh immediately
            fetchCampaign();
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading campaign...</div>;
    if (!campaign) return <div className="p-8 text-center text-red-500">Campaign not found</div>;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
                        <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${campaign.status === 'RUNNING' ? 'bg-green-100 text-green-700' : 'bg-zinc-200 text-zinc-700'
                                }`}>
                                {campaign.status}
                            </span>
                            <span className="text-sm text-zinc-500">ID: {campaign.id}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleDispatch}
                        disabled={processing}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                        Process Batch (10)
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total Contacts" value={campaign.stats.total} icon={<Phone className="w-5 h-5" />} />
                    <StatCard label="Pending" value={campaign.stats.pending} color="text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20" icon={<Clock className="w-5 h-5" />} />
                    <StatCard label="Completed" value={campaign.stats.completed} color="text-green-600 bg-green-50 dark:bg-green-900/20" icon={<CheckCircle className="w-5 h-5" />} />
                    <StatCard label="Failed" value={campaign.stats.failed} color="text-red-600 bg-red-50 dark:bg-red-900/20" icon={<XCircle className="w-5 h-5" />} />
                </div>

                {/* Calls List */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 font-semibold flex justify-between">
                        <h3>Recent Calls</h3>
                        <span className="text-xs text-zinc-500 self-center">Auto-refreshing...</span>
                    </div>
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {campaign.calls.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500 italic">No calls made yet. Start dispatching!</div>
                        ) : (
                            campaign.calls.map((call) => (
                                <div key={call.id} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-medium">{call.contact.phone}</span>
                                            <span className="text-sm text-zinc-500">({call.contact.name || 'Unknown'})</span>
                                        </div>
                                        <StatusBadge status={call.status} />
                                    </div>

                                    {call.transcript ? (
                                        <div className="bg-zinc-100 dark:bg-zinc-950 p-3 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                                            {call.transcript}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-zinc-400 italic">
                                            {call.status === 'COMPLETED' ? 'No transcript available.' : 'Waiting for call data...'}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, color = "text-zinc-900 bg-zinc-100 dark:bg-zinc-800", icon }: any) {
    return (
        <div className={`p-4 rounded-xl flex items-center justify-between ${color}`}>
            <div>
                <div className="text-xs font-semibold opacity-70 uppercase mb-1">{label}</div>
                <div className="text-2xl font-bold">{value}</div>
            </div>
            <div className="opacity-50">{icon}</div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: any = {
        PENDING: "bg-zinc-100 text-zinc-600",
        DISPATCHED: "bg-blue-100 text-blue-600",
        ACTIVE: "bg-purple-100 text-purple-600",
        COMPLETED: "bg-green-100 text-green-600",
        FAILED: "bg-red-100 text-red-600"
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${colors[status] || colors.PENDING}`}>
            {status}
        </span>
    );
}
