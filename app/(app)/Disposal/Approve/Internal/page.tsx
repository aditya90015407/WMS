"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import decrypt from "@/components/Encrypt";


type FinalDisposalRow = Record<string, string | number | boolean | null>;

const fields = [
    ["ID", "Final Disposal Ref No."],
    ["IDDID", "Original Disposal ID"],
    ["WasteCategory", "Waste Category"],
    ["Waste", "Waste Description"],
    ["TotalQty", "Total Quantity"],
    ["NAME", "Recycler / Vendor Name"],
    ["EMAIL", "Recycler Email"],
    ["TransporterName", "Transporter Name"],
    ["TransporterAddress", "Transporter Address"],
    ["TransporterPhone", "Transporter Phone"],
    ["TransporterEmail", "Transporter Email"],
    ["ReceiverName", "Receiver Name"],
    ["ReceiverAddress", "Receiver Address"],
    ["ReceiverAuthNo", "Receiver Auth No."],
    ["Status", "Current Status"],
    ["CrDt", "Created On"],
    ["UpDt", "Updated On"],
] as const;

export default function DisposalApproveInternalPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const router = useRouter();
    // const params = React.use(searchParams)
    // const id = params.id;
    // const id = params.get("id") ?? "";
    const [row, setRow] = useState<FinalDisposalRow | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [remarks, setRemarks] = useState("");
    const [decision, setDecision] = useState("");
    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const [id, setId] = useState("");
    const [ready, setReady] = useState(false);

    const params = React.use(searchParams);
    const encryptedId = params.id ?? "";
    // const id = encryptedId ? await decrypt(encryptedId) : "";
    useEffect(() => {
        const handleDecrypt = async () => {
            const decryptedId: string = encryptedId ? (await decrypt(encryptedId)) ?? "" : "";
            setId(decryptedId);
            setReady(true);
            // use id here (set state, etc.)
        };

        void handleDecrypt();
    }, [encryptedId]);


    useEffect(() => {
        const loadRow = async () => {
            if (!ready) return;
            if (!id) {
                setLoading(false);
                setError("Missing record id");
                return;
            }
            try {
                const res = await fetch("/api/GetData/GetAllFinalDisposalList", {
                    method: "GET",
                    cache: "no-store",
                });
                const rawData = await res.json();
                const rows = Array.isArray(rawData) ? rawData : Array.isArray(rawData?.data) ? rawData.data : [];
                const match = rows.find((item: Record<string, unknown>) => String(item?.ID ?? "") === id) ?? null;
                setRow(match);
                if (!match) setError("Submitted disposal form not found");
            } catch {
                setError("Failed to load submitted disposal form");
            } finally {
                setLoading(false);
            }
        };

        void loadRow();
    }, [id, ready]);

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full text-center">
                    <h1 className="text-2xl font-semibold text-teal-600">Disposal Approval - Internal</h1>
                    <p className="mt-2 text-sm text-slate-600">Verify the submitted internal disposal form before taking action.</p>
                </div>
                <button type="button" onClick={() => router.push("/Disposal/Approve")} className="rounded border border-slate-300 px-1 py-2 text-xs text-slate-700 hover:bg-slate-50">
                    Back to Queue
                </button>
            </div>

            {loading && <p className="mt-4 text-sm text-slate-600">Loading submitted form...</p>}
            {!loading && error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            {!loading && !error && row && (
                <>
                    <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <table className="min-w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="border border-slate-200 px-3 py-2 text-left">Field Name</th>
                                    <th className="border border-slate-200 px-3 py-2 text-left">Submitted Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map(([key, label]) => (
                                    <tr key={key}>
                                        <td className="border border-slate-200 px-3 py-2 align-top">{label}</td>
                                        <td className="border border-slate-200 px-3 py-2 whitespace-pre-wrap">{String(row[key] ?? "-")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h2 className="text-sm font-semibold text-slate-900">Accept / Reject</h2>
                        <p className="mt-1 text-xs text-slate-600">Add remarks and choose the action for this submitted form.</p>
                        <div className="mt-2 text-xs text-slate-500">Review date: {today}</div>
                        <textarea
                            rows={4}
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Enter approval or rejection remarks"
                            className="mt-3 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                        />
                        <div className="mt-4 flex flex-wrap gap-3">
                            <button type="button" onClick={() => setDecision(`Accepted${remarks.trim() ? ` with remarks: ${remarks.trim()}` : ""}`)} className="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800">
                                Accept
                            </button>
                            <button type="button" onClick={() => setDecision(`Rejected${remarks.trim() ? ` with remarks: ${remarks.trim()}` : ""}`)} className="rounded bg-rose-700 px-4 py-2 text-white hover:bg-rose-800">
                                Reject
                            </button>
                        </div>
                        {decision ? <div className="mt-4 rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">{decision}</div> : null}
                    </div>
                </>
            )}
        </section>
    );
}