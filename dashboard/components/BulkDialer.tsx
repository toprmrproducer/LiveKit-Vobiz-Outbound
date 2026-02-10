"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Upload, FileText, Check, AlertCircle, Loader2 } from "lucide-react";

interface CSVRow {
    phone: string;
    name?: string;
    [key: string]: any;
}

export default function BulkDialer() {
    const [file, setFile] = useState<File | null>(null);
    const [data, setData] = useState<CSVRow[]>([]);
    const [uploading, setUploading] = useState(false);
    const [campaignId, setCampaignId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setError(null);

            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setData(results.data as CSVRow[]);
                },
                error: (err) => {
                    setError("Failed to parse CSV: " + err.message);
                }
            });
        }
    };

    const handleUpload = async () => {
        if (!data.length) return;
        setUploading(true);
        setError(null);

        try {
            const res = await fetch("/api/campaigns/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: file?.name || "Untitled Campaign",
                    contacts: data
                }),
            });

            if (!res.ok) throw new Error(await res.text());

            const json = await res.json();
            setCampaignId(json.campaignId);
        } catch (err: any) {
            setError(err.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Upload className="w-6 h-6 text-blue-500" />
                Bulk Dialer Upload
            </h2>

            {/* File Input */}
            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8 text-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer relative">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2 text-zinc-500">
                    <FileText className="w-10 h-10" />
                    <p className="text-sm font-medium">
                        {file ? file.name : "Drag & drop CSV or click to browse"}
                    </p>
                    <p className="text-xs text-zinc-400">
                        Format: phone, name (optional), ...
                    </p>
                </div>
            </div>

            {/* Preview */}
            {data.length > 0 && (
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            Preview ({data.length} contacts)
                        </h3>
                        <button
                            onClick={() => setData([])}
                            className="text-xs text-red-500 hover:text-red-600"
                        >
                            Clear
                        </button>
                    </div>
                    <div className="max-h-40 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-950 p-2 text-xs font-mono">
                        {data.slice(0, 5).map((row, i) => (
                            <div key={i} className="truncate p-1 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                                {JSON.stringify(row)}
                            </div>
                        ))}
                        {data.length > 5 && (
                            <div className="p-1 text-zinc-400 italic">...and {data.length - 5} more</div>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between">
                {error && (
                    <div className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {campaignId ? (
                    <div className="text-green-500 text-sm flex items-center gap-1 font-medium bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded">
                        <Check className="w-4 h-4" />
                        Campaign Created! (ID: {campaignId.slice(-6)})
                    </div>
                ) : (
                    <div />
                )}

                <button
                    onClick={handleUpload}
                    disabled={!data.length || uploading || !!campaignId}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all
                    ${!data.length || uploading || campaignId
                            ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                        }
                `}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        "Create Campaign"
                    )}
                </button>
            </div>
        </div>
    );
}
