"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import decrypt from "@/components/Decrypt";



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

    const [saving, setSaving] = useState(false);

    const [decision, setDecision] = useState("");
    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const [id, setId] = useState("");
    const [ready, setReady] = useState(false);

    const params = React.use(searchParams);
    const encryptedId = params.id ?? "";
    console.log("encryptedId", encryptedId)
    // const id = encryptedId ? await decrypt(encryptedId) : "";
    useEffect(() => {
        const handleDecrypt = async () => {
            const decryptedId: string = encryptedId ? (await decrypt(encryptedId)) ?? "" : "";
            setId(decryptedId);
            console.log("decryptedID", decryptedId)
            setReady(true);
            // use id here (set state, etc.)
        };

        void handleDecrypt();
    }, [encryptedId]);


    // type WasteList = {
    //     IDID: string
    //     WRID: string
    //     GenerationDate: string
    //     WasteQty: string
    //     Waste: string
    //     CrDt: string
    //     CrBy: string
    //     UpBy: string
    //     UpDt: string
    //     DeptDesc: string
    //     TargetDate: string
    // }
    // const [wasteList, setWasteList] = useState<WasteList[]>([])



    async function UpdateDisposedWaste() {
        const res = await fetch("/api/GetData/GetWasteListByIDDID", {
            method: "POST",
            body: JSON.stringify({ "id": row?.IDDID })
        })

        const data = await res.json()
        // console.log(data.data)
        const wasteItems = data.data
        // setWasteList(data.data)

        // console.log("i am disposing waste")
        // if (!wasteList) return
        // console.log("i am here to disposing waste")
        // console.log(wasteList)
        wasteItems?.map(async (item: any) => {
            const res = await fetch("/api/SetData/UpdateDisposedWaste", {
                method: "POST",
                body: JSON.stringify({ "WRID": item.WRID })
            })

            const data = await res.json()

            // console.log(data)
        })
    }



    const saveDecision = async (stsCode: 3 | 5, label: "Accepted" | "Rejected") => {

        // console.log("I am here ")
        if (!row?.ID) return;
        setSaving(true);

        // console.log("I am here ")



        if (stsCode == 3) {
            UpdateDisposedWaste()
        }

        try {
            const res = await fetch("/api/SetData/SetDisposalApproval", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    FDDID: Number(row.ID),
                    IDDID: row.IDDID,
                    StsCode: stsCode,
                    Remarks: remarks,
                }),
            });
            const payload = await res.json();

            if (!res.ok || !payload.success) {
                setDecision(payload.message || "Failed to save disposal approval")
                return;
            }

            setDecision(`${label}${remarks.trim() ? ` with remarks: ${remarks.trim()}` : ""}`)
            if (stsCode == 3 && row?.id) {
                router.back();
            }
        } catch (err) {
            console.error("Failed to save disposal approval", err);
            setDecision("Failed to save disposal approval");
        } finally {
            setSaving(false);
        }

    }



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
                // console.log(rawData)
                const rows = Array.isArray(rawData) ? rawData : Array.isArray(rawData?.data) ? rawData.data : [];
                const match = rows.find((item: Record<string, unknown>) => String(item?.ID ?? "") === id) ?? null;
                setRow(match);
                // console.log(rows, "rows")
                // console.log(match, "match")
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
                <div className="w-full">
                    <h1 className="text-xl font-semibold text-teal-600 text-center">Disposal Approval - Internal</h1>
                    <p className="mt-2 text-sm text-slate-600">Verify the submitted internal disposal form before taking action.</p>
                </div>
                <img src="/goback.png" alt="" className="h-6  cursor-pointer"
                    onClick={() => router.back()}
                />
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
                            <button
                                type="button"
                                // disabled={saving}
                                onClick={() => void saveDecision(3, "Accepted")}
                                className="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800 disabled:opacity-60"
                            >
                                Accept
                            </button>
                            <button
                                type="button"
                                // disabled={saving}
                                onClick={() => void saveDecision(5, "Rejected")}
                                className="rounded bg-rose-700 px-4 py-2 text-white hover:bg-rose-800 disabled:opacity-60"
                            >
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