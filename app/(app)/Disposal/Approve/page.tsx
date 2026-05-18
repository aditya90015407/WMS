"use client";

import encrypt from "@/components/Encrypt";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import decrypt from "@/components/Decrypt";
import React from "react";
type FinalDisposalRow = {
    ID: string | number;
    IDDID?: string | number;
    WCID?: string | number;
    DisType?: string;
    WasteCategory?: string;
    Waste?: string;
    TotalQty?: string | number;
    Status?: string;
    CrDt?: string;
    MUnit: string
};

function normalizeData<T extends Record<string, unknown>>(row: T) {
    return Object.fromEntries(
        Object.entries(row).map(([key, value]) => {
            if (value === null || value === undefined) return [key, ""];
            if (typeof value === "object" && !Array.isArray(value)) return [key, ""];
            return [key, value];
        }),
    );
}

export default function DisposalApprovePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rows, setRows] = useState<FinalDisposalRow[]>([]);
    const [page, setPage] = useState(1);

    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * pageSize;
    const currentRows = rows.slice(start, start + pageSize);

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
        const loadRows = async () => {
            if (!ready) return;
            setLoading(true);
            setError(null);

            try {
                const res = await fetch("/api/GetData/GetAllFinalDisposalList", {
                    method: "GET",
                    cache: "no-store",
                });

                const rawData = await res.json();
                console.log("GetAllFinalDisposalList rawData:", rawData);

                const data = Array.isArray(rawData)
                    ? rawData
                    : Array.isArray(rawData?.data)
                        ? rawData.data
                        : [];

                const normalized = data.map(normalizeData) as FinalDisposalRow[];
                // console.log("Normalized final disposal rows:", normalized);

                setRows(normalized);
            } catch (err) {
                console.error("Failed to load final disposal list", err);
                setRows([]);
                setError("Failed to load final disposal list");
            } finally {
                setLoading(false);
            }
        };

        void loadRows();
    }, [ready]);

    return (
        <section className="max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="w-full">
                    <h1 className="text-lg text-center font-semibold text-teal-600">
                        Approve Final Disposal
                    </h1>
                    {/* <h2 className="text-sm text-center font-semibold text-slate-900">
                        Submitted Final Disposal List
                    </h2> */}
                </div>
            </div>

            {loading && (
                <p className="mt-4 text-sm text-slate-600">Loading final disposal records...</p>
            )}

            {!loading && error && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
            )}

            {!loading && !error && currentRows.length === 0 && (
                <p className="mt-4 text-sm text-slate-600">No records found.</p>
            )}

            {!loading && !error && currentRows.length > 0 && (
                <>
                    <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700">
                                        Final Ref ID
                                    </th>
                                    <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700">
                                        Original ID
                                    </th>
                                    <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700">
                                        Waste Category
                                    </th>
                                    <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700">
                                        Waste
                                    </th>
                                    <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700">
                                        Quantity
                                    </th>
                                    <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700">
                                        Disposal Type
                                    </th>
                                    {/* <th className="whitespace-nowrap px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-700">
                                        Status
                                    </th> */}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 bg-white">
                                {currentRows.map((row, index) => (
                                    <tr
                                        key={index}
                                        className="cursor-pointer hover:bg-slate-50"
                                        onClick={async () => {
                                            const rawId = String(row.ID ?? "").trim();
                                            const finalId = rawId ? await encrypt(rawId) : "";
                                            const iddid = await encrypt(String(row.IDDID))
                                            const wcid = String(row.WCID ?? "").trim();
                                            const disType = String(row.DisType ?? "").trim().toLowerCase();

                                            // console.log(row.TotalQty);
                                            // console.log("Routing with final ID:", finalId);

                                            if (!finalId) return;

                                            const target =
                                                disType === "internal"
                                                    ? `/Disposal/Approve/Internal?id=${encodeURIComponent(finalId)}&iddid=${encodeURIComponent(iddid)}`
                                                    : wcid === "1"
                                                        ? `/Disposal/Approve/Hazardous?id=${encodeURIComponent(finalId)}`
                                                        : `/Disposal/Approve/NonHazardous?id=${encodeURIComponent(finalId)}`;

                                            router.push(target);
                                        }}
                                    >
                                        <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                                            {String(row.ID ?? "")}
                                        </td>
                                        <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                                            {String(row.IDDID ?? "")}
                                        </td>
                                        <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                                            {String(row.WasteCategory ?? "")}
                                        </td>
                                        <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                                            {String(row.Waste ?? "")}
                                        </td>
                                        <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                                            {String(row.TotalQty ?? "")}{" "}{row.MUnit}
                                        </td>
                                        <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                                            {String(row.DisType ?? "")}
                                        </td>
                                        {/* <td className="whitespace-nowrap px-2 py-1 text-xs text-slate-700">
                                            {String(row.Status ?? "")}
                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-700">
                        <button
                            type="button"
                            onClick={() => setPage(1)}
                            disabled={currentPage === 1}
                            className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-50"
                        >
                            First
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-50"
                        >
                            Next
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-50"
                        >
                            Last
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}